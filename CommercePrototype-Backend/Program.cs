using CommercePrototype_Backend.Options;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using CommercePrototype_Backend.Services.Sfcc.Shared;

var builder = WebApplication.CreateBuilder(args);

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
                .AllowAnyMethod();
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
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddMemoryCache();

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

builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});

// Add SFCC Services
builder.Services.AddHttpClient<ISfccAuthService, SfccAuthService>();
builder.Services.AddHttpClient<ISfccShopApiClient, SfccShopApiClient>();
builder.Services.AddScoped<ISfccShopService, SfccShopService>();

// Shopper session handling (guest + login)
builder.Services.AddSingleton<IShopperSessionStore, ShopperSessionStore>();
builder.Services.AddScoped<SfccRequestContext>();

builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseResponseCompression();

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthorization();

app.MapHealthChecks("/health");

app.MapControllers();

app.Run();
