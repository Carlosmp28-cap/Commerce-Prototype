using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Models.Customers;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Services.Auth;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly ISfccAuthService _auth;
    private readonly IShopperSessionStore _store;
    private readonly ISfccShopService _shopService;
    private readonly SfccRequestContext _sfccRequestContext;
    private readonly IJwtTokenService _jwt;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ISfccAuthService auth,
        IShopperSessionStore store,
        ISfccShopService shopService,
        SfccRequestContext sfccRequestContext,
        IJwtTokenService jwt,
        ILogger<AuthController> logger)
    {
        _auth = auth;
        _store = store;
        _shopService = shopService;
        _sfccRequestContext = sfccRequestContext;
        _jwt = jwt;
        _logger = logger;
    }

    private const string ShopperSessionHeader = "X-Shopper-Session-Id";

    private void ApplyShopperSession(SfccShopperSession session)
    {
        _sfccRequestContext.ShopperAuthToken = session.AuthToken;
        _sfccRequestContext.ShopperCookieHeader = session.CookieHeader;
    }

    [HttpPost("guest")]
    public async Task<ActionResult<ShopperSessionDto>> Guest(CancellationToken cancellationToken)
    {
        try
        {
            var session = await _auth.GetGuestShopperSessionAsync(cancellationToken);
            var sessionId = _store.Save(session);
            Response.Headers[ShopperSessionHeader] = sessionId;
            return Ok(new ShopperSessionDto(sessionId, session.CustomerId, "guest"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating guest shopper session");
            return StatusCode(500, new { error = "Failed to create guest shopper session", details = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<CustomerProfileDto>> Register(
        [FromBody] RegisterCustomerRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Email and Password are required" });
        }

        try
        {
            var profile = await _shopService.RegisterCustomerAsync(request, cancellationToken);
            return Ok(profile);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "SFCC registration failed");
            return StatusCode(400, new { error = "Registration failed", details = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during registration");
            return StatusCode(500, new { error = "Failed to register", details = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<ShopperSessionDto>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        if (request is null)
        {
            return BadRequest(new { error = "login/username and password are required" });
        }

        var username = request.EffectiveUsername?.Trim();
        var password = request.Password;

        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            return BadRequest(new { error = "login/username and password are required" });
        }

        try
        {
            string? guestSessionId = null;
            if (Request.Headers.TryGetValue(ShopperSessionHeader, out var headerValue))
            {
                guestSessionId = headerValue.ToString();
            }

            var session = await _auth.GetCustomerShopperSessionAsync(username, password, cancellationToken);
            var sessionId = _store.Save(session);

            Response.Headers[ShopperSessionHeader] = sessionId;

            string? mergedBasketId = null;
            if (!string.IsNullOrWhiteSpace(request.BasketId)
                && !string.IsNullOrWhiteSpace(guestSessionId)
                && _store.TryGet(guestSessionId, out var guestSession))
            {
                try
                {
                    ApplyShopperSession(guestSession);
                    var guestBasket = await _shopService.GetBasketAsync(request.BasketId, cancellationToken);
                    var guestItems = guestBasket?.Items;
                    if (guestBasket is not null && guestItems is not null && guestItems.Count > 0)
                    {
                        ApplyShopperSession(session);
                        var customerBasket = await _shopService.CreateBasketAsync(guestBasket.Currency, cancellationToken);

                        foreach (var item in guestItems)
                        {
                            await _shopService.AddItemToBasketAsync(
                                customerBasket.BasketId,
                                item.ProductId,
                                item.Quantity,
                                cancellationToken);
                        }

                        mergedBasketId = customerBasket.BasketId;
                        _store.LinkBasketToSession(customerBasket.BasketId, sessionId);

                        ApplyShopperSession(guestSession);
                        await _shopService.ClearBasketAsync(request.BasketId, cancellationToken);
                    }
                }
                catch (Exception mergeEx)
                {
                    _logger.LogWarning(mergeEx, "Failed to merge guest basket {BasketId} on login", request.BasketId);
                }
            }

            var customerId = session.CustomerId ?? username;
            var jwt = _jwt.CreateToken(customerId ?? string.Empty, sessionId, username);

            return Ok(new ShopperSessionDto(sessionId, session.CustomerId, "registered", mergedBasketId, jwt));
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "SFCC login failed");
            return StatusCode(401, new { error = "Login failed", details = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new { error = "Failed to login", details = ex.Message });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        if (Request.Headers.TryGetValue(ShopperSessionHeader, out var sessionHeader))
        {
            var sessionId = sessionHeader.ToString();
            _store.RemoveSession(sessionId);
        }

        return Ok(new { ok = true });
    }
}
