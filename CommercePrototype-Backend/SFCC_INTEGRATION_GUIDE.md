# SFCC Integration Guide

This backend is configured to connect to your Salesforce Commerce Cloud (SFCC) sandbox using OCAPI (Open Commerce API) with OAuth2 authentication.

## Configuration

### 1. Update `appsettings.Development.json`

Replace the placeholder values in your `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Sfcc": {
    "OAuthTokenUrl": "https://account.demandware.com/dw/oauth2/access_token",
    "ApiBaseUrl": "https://your-sandbox-name.api.commercecloud.salesforce.com",
    "ClientId": "your-client-id",
    "Username": "your-business-manager-username",
    "Password": "your-business-manager-password",
    "InstanceName": "your-sandbox-name"
  }
}
```

**Configuration Fields:**

- **OAuthTokenUrl**: Fixed SFCC OAuth2 endpoint for getting access tokens
- **ApiBaseUrl**: Your SFCC sandbox API endpoint (e.g., `https://myinstance.api.commercecloud.salesforce.com`)
- **ClientId**: Your SFCC API client ID (this is used in Basic Auth along with password)
- **Username**: Business Manager username for authentication
- **Password**: Business Manager password (or use API token)
- **InstanceName**: Your SFCC sandbox instance name

## How It Works

### Authentication Flow

1. **Token Request**: When the app needs to call SFCC APIs, `SfccAuthService` sends a request to the OAuth2 endpoint with:
   - Basic Auth header: `base64(clientId:password)`
   - Form data: `grant_type=urn:demandware:params:oauth:grant-type:client-id:dwsid:dwsecuretoken&username=<username>`

2. **Token Caching**: The access token is cached for its validity period (minus 1-minute buffer) to avoid repeated authentication calls

3. **API Calls**: `SfccApiClient` attaches the token as a Bearer token to all API requests

### Architecture

- **`ISfccAuthService`**: Handles OAuth2 token retrieval and caching
- **`ISfccApiClient`**: Provides typed methods for GET, POST, PUT, DELETE operations to SFCC APIs
- Both services are registered with dependency injection in `Program.cs`

## Usage

### In Your Controllers

Inject `ISfccApiClient` and use it to call SFCC APIs:

```csharp
[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly ISfccApiClient _sfccApiClient;

    public ProductsController(ISfccApiClient sfccApiClient)
    {
        _sfccApiClient = sfccApiClient;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(string query)
    {
        // Call SFCC Shop API product search
        var result = await _sfccApiClient.GetAsync<dynamic>($"/products?q={query}&limit=20");
        return Ok(result);
    }
}
```

### API Methods

```csharp
// GET request
var products = await _sfccApiClient.GetAsync<ProductResponse>("/products");

// POST request
var cart = await _sfccApiClient.PostAsync<CartResponse>("/carts", new { ... });

// PUT request
var updated = await _sfccApiClient.PutAsync<OrderResponse>("/orders/{id}", new { ... });

// DELETE request
await _sfccApiClient.DeleteAsync("/baskets/{id}");
```

## SFCC Shop API Endpoints

Here are some common endpoints you can use:

### Products

- `GET /products` - List products
- `GET /products/{id}` - Get product details
- `GET /products?q=search` - Search products

### Baskets/Carts

- `GET /baskets/{id}` - Get basket
- `POST /baskets` - Create basket
- `PUT /baskets/{id}` - Update basket
- `POST /baskets/{id}/items` - Add items to basket

### Orders

- `GET /orders/{id}` - Get order
- `POST /orders` - Create order

### Customers

- `GET /customers/{id}` - Get customer profile
- `POST /customers/{id}/addresses` - Add address

For complete API documentation, refer to: [SFCC Commerce Cloud API Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/topic/com.demandware.dochelp/OCAPI/current/shop/index.html)

## Error Handling

The services include error logging and will throw exceptions on authentication or API failures. Errors are logged using the standard .NET logging framework.

## Testing the Connection

You can test the SFCC integration by:

1. Ensure your `appsettings.Development.json` is properly configured
2. Start the backend: `dotnet run`
3. Call the test endpoint: `GET http://localhost:port/api/products/sfcc/catalog`

If successful, you'll get products from your SFCC sandbox. If there's an error, check the console logs for details.

## Security Notes

- **Never commit credentials**: Do not commit `appsettings.Development.json` with real credentials to version control
- **Use User Secrets**: For development, use .NET User Secrets to store sensitive configuration
- **Production**: Use environment variables or secure configuration providers in production

### Using User Secrets (Recommended for Development)

```bash
dotnet user-secrets init
dotnet user-secrets set "Sfcc:ClientId" "your-client-id"
dotnet user-secrets set "Sfcc:Username" "your-username"
dotnet user-secrets set "Sfcc:Password" "your-password"
dotnet user-secrets set "Sfcc:ApiBaseUrl" "your-api-url"
```

## Troubleshooting

### "No access token in SFCC response"

- Verify your credentials in `appsettings.Development.json`
- Check that your Business Manager user has API permissions

### "SFCC API request failed: 401"

- Token may be expired - check logs to see if token refresh is working
- Verify your Business Manager account is active

### "SFCC API request failed: 404"

- Check that the endpoint path is correct
- Verify your SFCC instance has the Shop API enabled

## Next Steps

1. Configure your SFCC sandbox credentials
2. Test the `/api/products/sfcc/catalog` endpoint
3. Implement your business logic using `ISfccApiClient`
4. Remove or adapt the in-memory sample data as needed
