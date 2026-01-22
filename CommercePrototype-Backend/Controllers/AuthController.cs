using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly ISfccAuthService _auth;
    private readonly IShopperSessionStore _store;
    private readonly ILogger<AuthController> _logger;

    public AuthController(ISfccAuthService auth, IShopperSessionStore store, ILogger<AuthController> logger)
    {
        _auth = auth;
        _store = store;
        _logger = logger;
    }

    [HttpPost("guest")]
    public async Task<ActionResult<ShopperSessionDto>> Guest(CancellationToken cancellationToken)
    {
        try
        {
            var session = await _auth.GetGuestShopperSessionAsync(cancellationToken);
            var sessionId = _store.Save(session);
            return Ok(new ShopperSessionDto(sessionId, session.CustomerId, "guest"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating guest shopper session");
            return StatusCode(500, new { error = "Failed to create guest shopper session", details = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<ShopperSessionDto>> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
    {
        if (request is null || string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { error = "Username and Password are required" });
        }

        try
        {
            var session = await _auth.GetCustomerShopperSessionAsync(request.Username, request.Password, cancellationToken);
            var sessionId = _store.Save(session);
            return Ok(new ShopperSessionDto(sessionId, session.CustomerId, "registered"));
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
}
