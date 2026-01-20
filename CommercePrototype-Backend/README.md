# CommercePrototype Backend

ASP.NET Core Web API backend for the Commerce prototype.

## Run

```bash
dotnet restore
dotnet run
```

Default URLs (from `Properties/launchSettings.json`):

- http://localhost:5035
- https://localhost:7270

## Endpoints

- `GET /health` — health check
- `GET /openapi/v1.json` — OpenAPI document (Development)
- `GET /api/products` — list products
- `GET /api/products?q=new` — filter products by query/category
- `GET /api/products/{id}` — get product by id

## CORS

- In **Development**, CORS is open to simplify Expo web/local testing.
- In **Production**, configure allowed origins in `appsettings.json` under `Cors:AllowedOrigins`.
