# SFCC Integration Guide

This backend is designed to act as a BFF for the SFCC Shop API. The implementation follows a defensive, service-layered approach:

- Low-level HTTP primitives and auth live under `Services/Sfcc/Shared`
- A typed Shop API client and mapping/service layer live under `Services/Sfcc/ShopApi`
- JSON helpers to safely read SFCC payloads live under `Services/Json` (`JsonElementExtensions`)

This guide explains the configuration, DI setup, and recommended usage patterns.

## Configuration

Add SFCC settings to a local `.env` file (copy `./.env.example` to `.env` and fill values), or set via user-secrets / environment variables:

````dotenv
# SFCC settings (copy these into `.env`)
Sfcc__OAuthTokenUrl=https://account.demandware.com/dw/oauth2/access_token
Sfcc__ApiBaseUrl=https://your-instance.dx.commercecloud.salesforce.com
Sfcc__ApiVersion=v20_4
Sfcc__ClientId=your-client-id
Sfcc__SiteId=RefArch
Sfcc__InstanceName=your-instance-name

```json
{
  "Sfcc": {
    "ApiBaseUrl": "https://your-instance.api.commercecloud.salesforce.com",
    "ApiVersion": "v20_4",
    "SiteId": "RefArch",
    "ClientId": "your-client-id",
    "OAuthTokenUrl": "https://account.demandware.com/dw/oauth2/access_token",
        "InstanceName": "your-instance-name",

        // Some sandboxes require trusted-system auth for customer operations.
        // Prefer storing these via user-secrets or environment variables (do not commit real values).
        "TrustedSystemLogin": "",
        "TrustedSystemPassword": ""
  }
}
````

Configuration notes:

- `ApiBaseUrl`: base host for the Shop API
- `ApiVersion`: API version to use (defaults to `v1` if omitted)
- `SiteId`: SFCC site id (for example `RefArch`)
- `ClientId`: client id used for Shop API access (sent as `x-dw-client-id` for public Shop API calls)
- `OAuthTokenUrl`: OAuth token endpoint (when using token-based flows)
- `InstanceName`: optional instance name used to build absolute URLs for relative asset links
- `TrustedSystemLogin` / `TrustedSystemPassword`: credentials used for Shop API `POST /customers/auth/trustedsystem` (required only in some sandboxes)

### Recommended: use .NET User Secrets for trusted-system credentials

From the `CommercePrototype-Backend` folder:

```bash
dotnet user-secrets init
dotnet user-secrets set "Sfcc:TrustedSystemLogin" "<your-login>"
dotnet user-secrets set "Sfcc:TrustedSystemPassword" "<your-password>"
```

Environment variable equivalents (use `__` as a separator):

- `Sfcc__TrustedSystemLogin`
- `Sfcc__TrustedSystemPassword`

Sensitive values should be stored using .NET user secrets or environment variables in development and secure configuration providers in production.

## Authentication and clients

This prototype provides two complementary patterns:

- Public Shop API read flows using the `x-dw-client-id` header (no user token required for many read endpoints).
- Token-based OAuth flows for operations that require authenticated access.

Key types in the codebase:

- `ISfccAuthService` / `SfccAuthService`: obtains and caches OAuth access tokens (uses `OAuthTokenUrl` and client credentials). The token is cached with a small safety buffer to avoid expiry during requests.
- `SfccApiClientBase`: shared HTTP behavior (typed HttpClient, streaming responses, structured logging, JSON deserialization helpers).
- `ISfccShopApiClient` / `SfccShopApiClient`: Shop-API-specific HTTP client that applies `x-dw-client-id` and builds SFCC shop URLs.
- `ISfccShopService` / `SfccShopService`: application-facing service that maps SFCC JSON into `Models/Products/*` and `Models/Categories/*` DTOs.

Prefer injecting `ISfccShopService` in controllers rather than calling the low-level client directly — the service centralizes mapping, paging limits and error handling.

## Dependency Injection (example)

Register options and typed clients in `Program.cs`:

```csharp
builder.Services.Configure<SfccOptions>(builder.Configuration.GetSection("Sfcc"));

// Auth client (if you need OAuth token flow)
builder.Services.AddHttpClient<ISfccAuthService, SfccAuthService>();

// Low-level Shop API client (uses SfccApiClientBase internally)
builder.Services.AddHttpClient<ISfccShopApiClient, SfccShopApiClient>();

// Application-facing service used by controllers
builder.Services.AddScoped<ISfccShopService, SfccShopService>();
```

Notes:

- The concrete `SfccApiClientBase` and `SfccShopApiClient` implementations stream responses (`ResponseHeadersRead`) and deserialize with `JsonSerializer.DeserializeAsync<T>` to reduce memory usage on large payloads.
- All requests propagate `CancellationToken` to allow graceful shutdown.

## Using the service in controllers (recommended)

Inject the higher-level `ISfccShopService` and call its methods. Example:

```csharp
[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private readonly ISfccShopService _sfcc;

    public ProductsController(ISfccShopService sfcc)
    {
        _sfcc = sfcc;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string? q, [FromQuery] string? categoryId, CancellationToken ct)
    {
        var result = await _sfcc.SearchProductsAsync(categoryId ?? string.Empty, q, limit: 24, offset: 0, cancellationToken: ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id, CancellationToken ct)
    {
        var product = await _sfcc.GetProductAsync(id, ct);
        if (product == null) return NotFound();
        return Ok(product);
    }
}
```

For categories:

```csharp
[HttpGet("/api/categories")]
public async Task<IActionResult> Tree([FromQuery] string rootId = "root", [FromQuery] int levels = 2, CancellationToken ct)
{
    var tree = await _sfcc.GetCategoryTreeAsync(rootId, levels, ct);
    return Ok(tree);
}
```

For cart/basket operations (requires shopper session management):

```csharp
[ApiController]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly ISfccShopService _shopService;
    private readonly ISfccAuthService _auth;
    private readonly IShopperSessionStore _sessionStore;
    private readonly SfccRequestContext _sfccRequestContext;

    // Basket endpoints delegate to _shopService basket methods:
    // CreateBasketAsync, GetBasketAsync, AddItemToBasketAsync,
    // UpdateBasketItemQuantityAsync, RemoveItemFromBasketAsync, ClearBasketAsync

    [HttpPost]
    public async Task<ActionResult<BasketDto>> Create([FromBody] CreateBasketRequestDto? request, CancellationToken ct)
    {
        var sessionId = await EnsureSessionForBasketAsync(null, ct);
        var basket = await _shopService.CreateBasketAsync(request?.Currency, ct);
        _sessionStore.LinkBasketToSession(basket.BasketId, sessionId);
        Response.Headers["X-Shopper-Session-Id"] = sessionId;
        return CreatedAtAction(nameof(GetById), new { basketId = basket.BasketId }, basket);
    }

    [HttpPost("{basketId}/items")]
    public async Task<ActionResult<BasketDto>> AddItem(string basketId, [FromBody] AddBasketItemRequestDto request, CancellationToken ct)
    {
        var sessionId = await EnsureSessionForBasketAsync(basketId, ct);
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return Unauthorized(new { error = "UNKNOWN_OR_MISSING_SHOPPER_SESSION" });
        }
        var basket = await _shopService.AddItemToBasketAsync(basketId, request.ProductId, request.Quantity, ct);
        return basket is null ? NotFound() : Ok(basket);
    }

    // ... (similar for other basket operations)
}
```

## Common endpoints (exposed by this backend)

- `GET /api/products` — search products (maps SFCC results to `ProductSummaryDto`)
- `GET /api/products/{id}` — product detail (`ProductDetailDto`)
- `GET /api/categories` — category tree (`CategoryNodeDto`)
- `POST /api/cart` — create basket (`BasketDto`)
- `GET /api/cart/{basketId}` — get basket details
- `POST /api/cart/{basketId}/items` — add item to basket
- `PATCH /api/cart/{basketId}/items/{itemId}` — update item quantity
- `DELETE /api/cart/{basketId}/items/{itemId}` — remove item
- `DELETE /api/cart/{basketId}` — clear/delete basket

These endpoints are implemented in the `Controllers/` folder and rely on `ISfccShopService`.

## Testing the integration

Start the backend and call the public endpoints (example using `curl`):

```bash
dotnet run

curl "http://localhost:5035/api/categories?rootId=root&levels=2"
curl "http://localhost:5035/api/products?categoryId=mens&q=shirt&limit=12"
curl "http://localhost:5035/api/products/25696717M"
```

Note: calling the products search endpoint with only `q` (no `categoryId`) will return a 400 validation error in the current implementation. Update the controller if you prefer `q`-only global searches.

```

If you need to directly exercise the Shop API client for debugging, the `Services/Sfcc/ShopApi` code shows how URLs are composed (`/s/{siteId}/dw/shop/{apiVersion}/{endpoint}`).

## Troubleshooting

- 401 Unauthorized: check `Sfcc:ClientId` and (if applicable) OAuth client credentials; verify token retrieval logs in `SfccAuthService`.
- 404 Not Found: verify `ApiBaseUrl`, `ApiVersion` and constructed path (the Shop API base includes `/s/{siteId}/dw/shop/{version}` by default).
- Unexpected payload shapes: SFCC payloads can vary by cartridge/configuration — mapping code in `SfccShopService.Mapping.cs` is defensive. Use `JsonElement` helpers in `Services/Json/JsonElementExtensions.cs` to inspect fields safely.

## Security

- Do not commit secrets. Use user-secrets in development and environment-based secure config in CI/CD and production.
- Prefer `IOptions<SfccOptions>` (bound) and `IConfiguration` for runtime overrides.

## Next steps and extension points

- Add Data API client under `Services/Sfcc/DataApi/` when you need admin/back-office operations.
- Add caching (IMemoryCache or distributed cache) around category/product list responses to reduce Shop API calls.
- Consider pagination caps and rate limiting to protect the SFCC sandbox.

If you want, I can also add a short Checklist to validate your SFCC credentials and a minimal Postman collection for quick testing.
```
