# CommercePrototype Backend (ASP.NET Core 10)

Backend for the Commerce Prototype. Acts as a Backend‑for‑Frontend (BFF) that integrates with Salesforce Commerce Cloud (SFCC) Shop API and exposes frontend-friendly DTOs for products, categories and related operations.

## Architecture

This backend follows a small, service-oriented Web API structure.

- `Controllers/` — HTTP controllers (products, categories, etc.)
- `Services/` — application services and SFCC integration (see `Services/Sfcc/`)
- `Models/` — API DTOs (now organized under `Models/Categories/` and `Models/Products/`)
- `Options/` — typed configuration objects (for example `SfccOptions`)
- `Services/Json/` — small JSON helpers used to parse SFCC payloads
- `appsettings*.json` — environment configuration (development and production)

### Key components

- `Services/Sfcc/Shared` — common SFCC HTTP primitives and auth helpers (`SfccApiClientBase`, `ISfccAuthService`, `SfccAuthService`)
- `Services/Sfcc/ShopApi` — typed Shop API client and the `SfccShopService` mapping layer (partial classes are used for `Mapping` and `Images` helpers)
- `Models/Categories` and `Models/Products` — DTO records consumed by the frontend (`CategoryNodeDto`, `ProductSummaryDto`, `ProductDetailDto`, `ProductSearchResultDto`)
- `Options/SfccOptions.cs` — strongly-typed SFCC configuration bound from `appsettings.json`
- `Services/Json/JsonElementExtensions.cs` — helpers that make reading SFCC JSON payloads safer and less verbose

## Getting started

Prerequisites:

- .NET 10 SDK
- SFCC sandbox access (Shop API / OCAPI credentials)

Copy your SFCC configuration into `appsettings.Development.json` (see `SFCC_INTEGRATION_GUIDE.md`) and run:

```bash
dotnet restore
dotnet run
```

Development server default: `http://localhost:5035` (adjust the launch settings or `ASPNETCORE_URLS` if needed)

What changed recently

- SFCC integration: split SFCC services into `Shared` and `ShopApi` layers and added a typed `SfccShopApiClient`.
- Models reorganized into `Models/Categories/` and `Models/Products/`.
- Interfaces separated into individual files (e.g. `ISfccAuthService.cs`, `ISfccShopApiClient.cs`).
- OpenAPI XML documentation enabled and controller/DTO comments added for better API docs.

## API Endpoints

### Products

#### Search Products

```
GET /api/products
```

Query parameters:

- `q` (optional): Search keyword
- `categoryId` (required): Filter by category (current implementation expects a `categoryId`; calling the endpoint with only `q` returns a 400 validation error)
- `limit` (optional): Number of results (default: 12)
- `offset` (optional): Pagination offset (default: 0)

Example:

```
GET /api/products?q=shirt&categoryId=mens&limit=20
```

Response:

```json
{
  "items": [
    {
      "id": "product-123",
      "name": "Classic Shirt",
      "price": 49.99,
      "categoryId": "mens",
      "imageUrl": "https://...",
      "rating": 4.5,
      "reviewCount": 128
    }
  ],
  "total": 45,
  "count": 20,
  "offset": 0
}
```

#### Get Product Details

```
GET /api/products/{id}
```

Response:

```json
{
  "id": "product-123",
  "name": "Classic Shirt",
  "price": 49.99,
  "categoryId": "mens",
  "quantityAvailable": 42,
  "description": "A timeless classic...",
  "imageUrl": "https://...",
  "gallery": ["https://...", "https://..."],
  "rating": 4.5,
  "reviewCount": 128,
  "features": ["Cotton", "Machine washable"],
  "shippingType": "Standard",
  "shippingEstimate": "3-5 days"
}
```

### Categories

#### Get Category Tree

```
GET /api/categories
```

Query parameters:

- `rootId` (optional): Category root ID (default: "root")
- `levels` (optional): Tree depth (default: 2)

Example:

```
GET /api/categories?rootId=root&levels=3
```

Response:

```json
{
  "id": "root",
  "name": "Root",
  "parentId": null,
  "children": [
    {
      "id": "mens",
      "name": "Men",
      "parentId": "root",
      "children": [...]
    }
  ]
}
```

## SFCC Integration

This backend integrates with SFCC Shop API using:

- **x-dw-client-id header**: For public Shop API access (no OAuth token required for read operations)
- **JSON response mapping**: Transforms SFCC responses into frontend-friendly DTOs
- **Error handling**: Graceful handling of 404s and API errors

The integration supports:

- Product search with filters
- Product detail retrieval
- Category tree navigation
- Inventory availability

For authenticated operations (cart, orders, customer data), the backend can be extended to use OAuth2 token flow.

## Development

## Project Structure

```
CommercePrototype-Backend/
├── Controllers/                      # Web API controllers (Products, Categories, ...)
├── Models/
│   ├── Categories/                   # Category DTOs
│   └── Products/                     # Product DTOs
├── Options/                          # Typed configuration (SfccOptions)
├── Services/
│   ├── Sfcc/
│   │   ├── Shared/                   # SfccApiClientBase, auth services, shared helpers
│   │   ├── ShopApi/                   # Sfcc shop API client, SfccShopService mapping layer
  │   └── DataApi/                    # placeholder for future Data API client
│   └── Json/                         # JsonElement helper extensions
├── Properties/
│   └── launchSettings.json
├── appsettings.json
├── appsettings.Development.json
├── Program.cs
├── CommercePrototype-Backend.csproj
└── README.md
```

### CORS

In **Development**, CORS is open to allow local frontend testing.

In **Production**, configure allowed origins in `appsettings.json`:

```json
{
  "Cors": {
    "AllowedOrigins": ["https://your-production-frontend.com"]
  }
}
```

### Adding New Endpoints

1. Add DTO model in `Models/`
2. Add service method in `Services/SfccShopService.cs`
3. Add controller endpoint in `Controllers/`
4. Register service in `Program.cs` if needed
5. Update this README with endpoint documentation

## Testing

Run tests with:

```bash
dotnet test
```

(Tests to be implemented)

## Deployment

The backend can be deployed to:

- Azure App Service
- AWS Elastic Beanstalk
- Docker containers
- IIS

Ensure production configuration includes:

- Secure SFCC credentials (use Azure Key Vault, AWS Secrets Manager, etc.)
- CORS restrictions
- HTTPS enforcement

## Troubleshooting

### 404 Not Found on SFCC API calls

- Verify `ApiBaseUrl`, `ApiVersion`, and `SiteId` in configuration
- Check that the endpoint path is correct (e.g., `/product_search` vs `/products`)
- Ensure your sandbox is accessible

### 403 Forbidden

- Verify your `ClientId` is whitelisted in OCAPI settings
- Check that the API version matches your OCAPI configuration
- Ensure the endpoint has appropriate permissions in Business Manager

### Connection errors

- Verify the sandbox hostname is correct
- Check firewall/network settings
- Ensure the sandbox is running

## Resources

- [SFCC_INTEGRATION_GUIDE.md](SFCC_INTEGRATION_GUIDE.md) - Detailed SFCC setup guide
- [SFCC Shop API Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/index.html)
- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/)
