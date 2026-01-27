using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Models.Basket;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

[ApiController]
[Route("api/cart")]
public sealed class CartController : ControllerBase
{
    private readonly ISfccShopService _shopService;
    private readonly ISfccAuthService _auth;
    private readonly IShopperSessionStore _sessionStore;
    private readonly SfccRequestContext _sfccRequestContext;
    private readonly ILogger<CartController> _logger;

    public CartController(
        ISfccShopService shopService,
        ISfccAuthService auth,
        IShopperSessionStore sessionStore,
        SfccRequestContext sfccRequestContext,
        ILogger<CartController> logger)
    {
        _shopService = shopService;
        _auth = auth;
        _sessionStore = sessionStore;
        _sfccRequestContext = sfccRequestContext;
        _logger = logger;
    }

    private const string ShopperSessionHeader = "X-Shopper-Session-Id";

    private async Task<string?> EnsureSessionForBasketAsync(string? basketId, CancellationToken cancellationToken)
    {
        // 1) If client sends session id, use it
        if (Request.Headers.TryGetValue(ShopperSessionHeader, out var sessionHeader) && !string.IsNullOrWhiteSpace(sessionHeader))
        {
            var sessionId = sessionHeader.ToString();
            if (_sessionStore.TryGet(sessionId, out var existing))
            {
                _sfccRequestContext.ShopperAuthToken = existing.AuthToken;
                _sfccRequestContext.ShopperCookieHeader = existing.CookieHeader;
                return sessionId;
            }

            // Client provided a session id, but we don't know it (service restarted, expired, etc.).
            // Do NOT silently create a new session because baskets are tied to the original session in SFCC.
            _logger.LogWarning("Unknown shopper session id provided: {SessionId}", sessionId);
            return null;
        }

        // 2) For existing basket operations, the caller must always provide the shopper session id.
        // Basket ids are not treated as authorization.
        if (!string.IsNullOrWhiteSpace(basketId))
        {
            return null;
        }

        // 3) For basket creation, create a guest session.
        var guest = await _auth.GetGuestShopperSessionAsync(cancellationToken);
        var newId = _sessionStore.Save(guest);
        _sfccRequestContext.ShopperAuthToken = guest.AuthToken;
        _sfccRequestContext.ShopperCookieHeader = guest.CookieHeader;
        Response.Headers[ShopperSessionHeader] = newId;
        return newId;
    }

    /// <summary>
    /// Create a new basket.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<BasketDto>> Create([FromBody] CreateBasketRequestDto? request = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var sessionId = await EnsureSessionForBasketAsync(null, cancellationToken);
            var basket = await _shopService.CreateBasketAsync(request?.Currency, cancellationToken);

            if (!string.IsNullOrWhiteSpace(sessionId))
            {
                _sessionStore.LinkBasketToSession(basket.BasketId, sessionId);
                Response.Headers[ShopperSessionHeader] = sessionId;
            }

            return CreatedAtAction(nameof(GetById), new { basketId = basket.BasketId }, basket);
        }
        catch (Exception ex)
        {
            return HandleCartException(ex, "Error creating basket");
        }
    }

    /// <summary>
    /// Get basket details.
    /// </summary>
    [HttpGet("{basketId}")]
    public async Task<ActionResult<BasketDto>> GetById(string basketId, CancellationToken cancellationToken = default)
    {
        try
        {
            var sessionId = await EnsureSessionForBasketAsync(basketId, cancellationToken);
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return Unauthorized(new { error = "UNKNOWN_OR_MISSING_SHOPPER_SESSION", header = ShopperSessionHeader });
            }
            var basket = await _shopService.GetBasketAsync(basketId, cancellationToken);
            return basket is null ? NotFound() : Ok(basket);
        }
        catch (Exception ex)
        {
            return HandleCartException(ex, $"Error fetching basket {basketId}");
        }
    }

    /// <summary>
    /// Add product to basket.
    /// </summary>
    [HttpPost("{basketId}/items")]
    public async Task<ActionResult<BasketDto>> AddItem(string basketId, [FromBody] AddBasketItemRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.ProductId))
        {
            return BadRequest(new { error = "ProductId is required" });
        }

        var productId = request.ProductId.Trim();

        if (request.Quantity <= 0)
        {
            return BadRequest(new { error = "Quantity must be > 0" });
        }

        try
        {
            var sessionId = await EnsureSessionForBasketAsync(basketId, cancellationToken);
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return Unauthorized(new { error = "UNKNOWN_OR_MISSING_SHOPPER_SESSION", header = ShopperSessionHeader });
            }
            var basket = await _shopService.AddItemToBasketAsync(basketId, productId, request.Quantity, cancellationToken);
            return basket is null ? NotFound() : Ok(basket);
        }
        catch (Exception ex)
        {
            return HandleCartException(ex, $"Error adding item to basket {basketId}");
        }
    }

    /// <summary>
    /// Update item quantity.
    /// </summary>
    [HttpPatch("{basketId}/items/{itemId}")]
    public async Task<ActionResult<BasketDto>> UpdateItemQuantity(
        string basketId,
        string itemId,
        [FromBody] UpdateBasketItemQuantityRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (request is null)
        {
            return BadRequest(new { error = "Request body required" });
        }

        if (request.Quantity < 0)
        {
            return BadRequest(new { error = "Quantity must be >= 0" });
        }

        try
        {
            var sessionId = await EnsureSessionForBasketAsync(basketId, cancellationToken);
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return Unauthorized(new { error = "UNKNOWN_OR_MISSING_SHOPPER_SESSION", header = ShopperSessionHeader });
            }
            var basket = await _shopService.UpdateBasketItemQuantityAsync(basketId, itemId, request.Quantity, cancellationToken);
            return basket is null ? NotFound() : Ok(basket);
        }
        catch (Exception ex)
        {
            return HandleCartException(ex, $"Error updating basket item {itemId} in {basketId}");
        }
    }

    /// <summary>
    /// Remove item from basket.
    /// </summary>
    [HttpDelete("{basketId}/items/{itemId}")]
    public async Task<ActionResult<BasketDto>> RemoveItem(string basketId, string itemId, CancellationToken cancellationToken = default)
    {
        try
        {
            var sessionId = await EnsureSessionForBasketAsync(basketId, cancellationToken);
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return Unauthorized(new { error = "UNKNOWN_OR_MISSING_SHOPPER_SESSION", header = ShopperSessionHeader });
            }
            var basket = await _shopService.RemoveItemFromBasketAsync(basketId, itemId, cancellationToken);
            return basket is null ? NotFound() : Ok(basket);
        }
        catch (Exception ex)
        {
            return HandleCartException(ex, $"Error removing basket item {itemId} from {basketId}");
        }
    }

    /// <summary>
    /// Clear entire basket (delete basket).
    /// </summary>
    [HttpDelete("{basketId}")]
    public async Task<IActionResult> Clear(string basketId, CancellationToken cancellationToken = default)
    {
        try
        {
            var sessionId = await EnsureSessionForBasketAsync(basketId, cancellationToken);
            if (string.IsNullOrWhiteSpace(sessionId))
            {
                return Unauthorized(new { error = "UNKNOWN_OR_MISSING_SHOPPER_SESSION", header = ShopperSessionHeader });
            }
            await _shopService.ClearBasketAsync(basketId, cancellationToken);
            return NoContent();
        }
        catch (Exception ex)
        {
            return HandleCartException(ex, $"Error clearing basket {basketId}");
        }
    }

    private ActionResult HandleCartException(Exception ex, string message)
    {
        switch (ex)
        {
            case VariantSelectionRequiredException variant:
                return Conflict(new
                {
                    error = "VARIANT_SELECTION_REQUIRED",
                    masterProductId = variant.MasterProductId,
                    variantIds = variant.VariantIds
                });

            case OutOfStockException stock:
                return Conflict(new
                {
                    error = "OUT_OF_STOCK",
                    productId = stock.ProductId,
                    requested = stock.Requested,
                    available = stock.Available
                });

            case HttpRequestException http when http.StatusCode is not null:
                _logger.LogError(http, "{Message}", message);
                return StatusCode((int)http.StatusCode.Value, new
                {
                    error = "HTTP_ERROR",
                    status = (int)http.StatusCode.Value,
                    details = http.Message
                });

            default:
                _logger.LogError(ex, "{Message}", message);
                return StatusCode(500, new { error = "Internal error", details = ex.Message });
        }
    }
}
