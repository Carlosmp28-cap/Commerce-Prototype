using CommercePrototype_Backend.Services;

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

// Add SFCC Services
builder.Services.AddHttpClient<ISfccAuthService, SfccAuthService>();
builder.Services.AddHttpClient<ISfccApiClient, SfccApiClient>();
builder.Services.AddScoped<ISfccShopService, SfccShopService>();

builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("Frontend");

app.UseAuthorization();

app.MapHealthChecks("/health");

app.MapControllers();

app.Run();
