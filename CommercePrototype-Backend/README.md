# CommercePrototype Backend

ASP.NET Core 10.0 Web API backend for the Commerce prototype, integrated with Salesforce Commerce Cloud (SFCC) via OCAPI.

## Architecture

This backend follows MVC architecture with a service layer:

- **Controllers**: Handle HTTP requests and responses (`Controllers/`)
- **Services**: Business logic and SFCC API integration (`Services/`)
- **Models**: DTOs for API responses (`Models/`)
- **Configuration**: SFCC connection settings (`appsettings.Development.json`)

### Key Components

- **SfccApiClient**: Low-level HTTP client for SFCC Shop API calls
- **SfccShopService**: High-level service that maps SFCC responses to DTOs
- **ProductsController**: REST endpoints for product search and details
- **CategoriesController**: REST endpoints for category tree navigation

## Getting Started

### Prerequisites

- .NET 10.0 SDK
- SFCC sandbox access with OCAPI credentials

### Configuration

1. Update `appsettings.Development.json` with your SFCC sandbox credentials:

```json
{
  "Sfcc": {
    "OAuthTokenUrl": "https://account.demandware.com/dw/oauth2/access_token",
    "ApiBaseUrl": "https://your-instance.dx.commercecloud.salesforce.com",
    "ApiVersion": "v20_4",
    "ClientId": "your-client-id",
    "SiteId": "RefArch"
  }
}
```

2. Ensure your OCAPI settings in Business Manager allow your `ClientId` to access Shop API endpoints.

See [SFCC_INTEGRATION_GUIDE.md](SFCC_INTEGRATION_GUIDE.md) for detailed configuration steps.

### Run

```bash
dotnet restore
dotnet run
```

The API will be available at:

- HTTP: `http://localhost:5035`
- HTTPS: `https://localhost:7270`

## API Endpoints

### Products

#### Search Products

```
GET /api/products
```

Query parameters:

- `q` (optional): Search keyword
- `categoryId` (optional): Filter by category
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

### Health Check

```
GET /health
```

Returns `200 OK` if the service is healthy.

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

### Project Structure

```
CommercePrototype-Backend/
├── Controllers/
│   ├── CategoriesController.cs
│   └── ProductsController.cs
├── Models/
│   ├── CategoryNodeDto.cs
│   ├── ProductDetailDto.cs
│   ├── ProductDto.cs
│   ├── ProductSearchResultDto.cs
│   └── ProductSummaryDto.cs
├── Services/
│   ├── SfccApiClient.cs
│   ├── SfccAuthService.cs
│   └── SfccShopService.cs
├── Properties/
│   └── launchSettings.json
├── appsettings.json
├── appsettings.Development.json
├── Program.cs
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
- Health check endpoints for load balancers

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
