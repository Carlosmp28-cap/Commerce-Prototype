using CommercePrototype_Backend.Options;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Services.Auth;
using CommercePrototype_Backend.Services.Sfcc.DataApi;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CommercePrototype_Backend;
using OpenTelemetry;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using OpenTelemetry.Metrics;
using OpenTelemetry.Extensions.Hosting;
using Sentry;
using Sentry.OpenTelemetry;
using Microsoft.Extensions.Logging;
// Load a local `.env` file into environment variables early so local secrets
// (ClientId, Api keys, etc.) can be provided without committing them to
// appsettings files. The backend configuration will then pick them up via
// the normal IConfiguration environment provider (env vars override appsettings).
DotEnv.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

var builder = WebApplication.CreateBuilder(args);

// Initialize Sentry (reads DSN from `SENTRY_DSN` env var or configuration)
// Use `SENTRY_TRACES_SAMPLE_RATE` to control sampling or set `TracesSampleRate` below.
builder.WebHost.UseSentry(o =>
{
    // Prefer explicit config, fall back to environment variable
    o.Dsn = builder.Configuration["SENTRY_DSN"] ?? Environment.GetEnvironmentVariable("SENTRY_DSN");
    // Default to no sampling in production unless explicitly set; use 1.0 for dev.
    if (double.TryParse(builder.Configuration["SENTRY_TRACES_SAMPLE_RATE"], out var sampleRate))
    {
        o.TracesSampleRate = sampleRate;
    }
    else if (builder.Environment.IsDevelopment())
    {
        o.TracesSampleRate = 1.0;
    }

    o.Environment = builder.Environment.EnvironmentName;
    o.AttachStacktrace = true;
});

// Forward application logs to Sentry (optional but useful for correlating errors)
builder.Logging.AddSentry();

// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        // For the prototype: allow any origin in Development to make Expo Web
        // and local testing frictionless. Tighten this in Production.
        if (builder.Environment.IsDevelopment())
        {
            policy
                .AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod()
                // Expo Web (browser) can only read custom response headers if they are exposed.
                .WithExposedHeaders("X-Shopper-Session-Id");
            return;
        }

        var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                      ?? Array.Empty<string>();

        if (origins.Length == 0)
        {
            // Fail closed in Production if you forget to configure origins.
            // (Better to break early than silently allow everything.)
            return;
        }

        policy
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders("X-Shopper-Session-Id");
    });
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddMemoryCache();

// OpenTelemetry: Traces + Metrics
// Instrument ASP.NET Core and HttpClient and forward activities to Sentry.
// OpenTelemetry: Traces + Metrics
// Create and register TracerProvider and MeterProvider directly so we don't
// rely on the IServiceCollection extension methods (which can vary by package).
builder.Services.AddSingleton<OpenTelemetry.Trace.TracerProvider>(sp =>
{
    return Sdk.CreateTracerProviderBuilder()
        .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("CommercePrototypeBackend"))
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        // Forward OpenTelemetry activities to Sentry as spans
        .AddSentry()
        .Build();
});

builder.Services.AddSingleton<OpenTelemetry.Metrics.MeterProvider>(sp =>
{
    return Sdk.CreateMeterProviderBuilder()
        .SetResourceBuilder(ResourceBuilder.CreateDefault().AddService("CommercePrototypeBackend"))
        .AddAspNetCoreInstrumentation()
        .Build();
});

var redisConnectionString = builder.Configuration.GetValue<string>("SessionStore:RedisConnectionString");
if (!string.IsNullOrWhiteSpace(redisConnectionString))
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = redisConnectionString;
        options.InstanceName = "CommercePrototype-Backend:";
    });
}
else
{
    builder.Services.AddDistributedMemoryCache();
}

// Bind SFCC settings and validate on startup so misconfigurations fail fast
// (rather than surfacing as runtime HTTP errors when the first request hits the SFCC client).
builder.Services
    .AddOptions<SfccOptions>()
    .Bind(builder.Configuration.GetSection("Sfcc"))
    .ValidateDataAnnotations()
    .Validate(
        o => Uri.TryCreate(o.ApiBaseUrl, UriKind.Absolute, out _),
        "Sfcc:ApiBaseUrl must be an absolute URL.")
    .ValidateOnStart();

builder.Services
    .AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection("Jwt"))
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// Add SFCC Services
builder.Services.AddHttpClient<ISfccAuthService, SfccAuthService>();
builder.Services.AddHttpClient<ISfccShopApiClient, SfccShopApiClient>();
builder.Services.AddHttpClient<ISfccDataApiClient, SfccDataApiClient>();
builder.Services.AddScoped<ISfccShopService, SfccShopService>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();

// Shopper session handling (guest + login)
builder.Services.AddSingleton<IShopperSessionStore, ShopperSessionStore>();
builder.Services.AddScoped<SfccRequestContext>();

builder.Services.AddHealthChecks();

var jwtOptions = builder.Configuration.GetSection("Jwt").Get<JwtOptions>();
if (jwtOptions is not null)
{
    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtOptions.Issuer,
                ValidAudience = jwtOptions.Audience,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key))
            };
        });
}

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseResponseCompression();

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthentication();

app.UseAuthorization();

app.MapHealthChecks("/health");

app.MapControllers();

// On application start, log whether Sentry is enabled and optionally send a
// one-off test message when `SENTRY_DEBUG=1` to validate connectivity.
var logger = app.Services.GetRequiredService<ILogger<Program>>();
app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        if (SentrySdk.IsEnabled)
        {
            logger.LogInformation("Sentry SDK is enabled.");
            var debugFlag = builder.Configuration["SENTRY_DEBUG"] ?? Environment.GetEnvironmentVariable("SENTRY_DEBUG");
            if (debugFlag == "1")
            {
                logger.LogInformation("SENTRY_DEBUG=1, sending a one-off Sentry test message.");
                SentrySdk.CaptureMessage("Sentry startup test message - debug");
            }
        }
        else
        {
            logger.LogWarning("Sentry SDK is not enabled. Ensure SENTRY_DSN is set.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error while performing Sentry startup check.");
    }
});

app.Run();
