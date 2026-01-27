using CommercePrototype_Backend.Options;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using CommercePrototype_Backend.Services.Zone;
using CommercePrototype_Backend.Services.Sfcc.Shelf;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Services.Algorithms;
using CommercePrototype_Backend;

// Load a local `.env` file into environment variables early so local secrets
// (ClientId, Api keys, etc.) can be provided without committing them to
// appsettings files. The backend configuration will then pick them up via
// the normal IConfiguration environment provider (env vars override appsettings).
DotEnv.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IStoreFileReader, StoreFileReader>();
builder.Services.AddScoped<IAStarPathFinder, AStarPathFinder>();
builder.Services.AddScoped<IRouteDefinitionService, RouteDefinitionService>();

// Add pathfinding algorithm service
// builder.Services.AddScoped<IAStarPathFinder, AStarPathFinder>();
// builder.Services.AddScoped<IRouteDefinitionService, RouteDefinitionService>();

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
var sfccApiBase = builder.Configuration.GetValue<string>("Sfcc:ApiBaseUrl");
builder.Services.AddHttpClient<ISfccAuthService, SfccAuthService>(client => {
    if (!string.IsNullOrEmpty(sfccApiBase)) client.BaseAddress = new Uri(sfccApiBase);
});
builder.Services.AddHttpClient<ISfccShopApiClient, SfccShopApiClient>(client => {
    if (!string.IsNullOrEmpty(sfccApiBase)) client.BaseAddress = new Uri(sfccApiBase);
});
builder.Services.AddScoped<ISfccShopService, SfccShopService>();
// Register zone and shelf services (use HttpClient-based implementations)
builder.Services.AddHttpClient<IZoneService, ZoneService>(client => {
    if (!string.IsNullOrEmpty(sfccApiBase)) client.BaseAddress = new Uri(sfccApiBase);
});
builder.Services.AddHttpClient<IShelfService, ShelfService>(client => {
    if (!string.IsNullOrEmpty(sfccApiBase)) client.BaseAddress = new Uri(sfccApiBase);
});

// Add routing service for pathfinding
builder.Services.AddScoped<IRouteDefinitionService, RouteDefinitionService>();

builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseResponseCompression();

app.UseHttpsRedirection();
// In Development we avoid forcing HTTPS redirection so browser preflight
// (OPTIONS) requests to the HTTP endpoint are not redirected to HTTPS
// which can cause CORS preflight failures. Keep redirection enabled in
// Production.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("Frontend");

app.UseAuthorization();

app.MapHealthChecks("/health");

app.MapControllers();

app.Run();
