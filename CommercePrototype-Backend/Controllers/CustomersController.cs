using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CommercePrototype_Backend.Models.Customers;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

[ApiController]
[Route("api/customers/me")]
[Authorize]
public sealed class CustomersController : ControllerBase
{
    private readonly ISfccShopService _shopService;
    private readonly IShopperSessionStore _sessionStore;
    private readonly SfccRequestContext _sfccRequestContext;
    private readonly ILogger<CustomersController> _logger;

    public CustomersController(
        ISfccShopService shopService,
        IShopperSessionStore sessionStore,
        SfccRequestContext sfccRequestContext,
        ILogger<CustomersController> logger)
    {
        _shopService = shopService;
        _sessionStore = sessionStore;
        _sfccRequestContext = sfccRequestContext;
        _logger = logger;
    }

    private bool TryApplySession(out string? customerId)
    {
        customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub)
                     ?? User.FindFirstValue("sub");

        var sessionId = User.FindFirstValue("session_id");
        if (string.IsNullOrWhiteSpace(sessionId)) return false;

        if (!_sessionStore.TryGet(sessionId, out var session))
        {
            return false;
        }

        _sfccRequestContext.ShopperAuthToken = session.AuthToken;
        _sfccRequestContext.ShopperCookieHeader = session.CookieHeader;
        return true;
    }

    [HttpGet]
    public async Task<ActionResult<CustomerProfileDto>> GetProfile(CancellationToken cancellationToken)
    {
        if (!TryApplySession(out var customerId) || string.IsNullOrWhiteSpace(customerId))
        {
            return Unauthorized(new { error = "INVALID_SESSION" });
        }

        var profile = await _shopService.GetCustomerProfileAsync(customerId, cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPatch]
    public async Task<ActionResult<CustomerProfileDto>> UpdateProfile(
        [FromBody] UpdateCustomerProfileRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryApplySession(out var customerId) || string.IsNullOrWhiteSpace(customerId))
        {
            return Unauthorized(new { error = "INVALID_SESSION" });
        }

        var profile = await _shopService.UpdateCustomerProfileAsync(customerId, request, cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpGet("orders")]
    public async Task<ActionResult<IReadOnlyList<CustomerOrderDto>>> GetOrders(CancellationToken cancellationToken)
    {
        if (!TryApplySession(out var customerId) || string.IsNullOrWhiteSpace(customerId))
        {
            return Unauthorized(new { error = "INVALID_SESSION" });
        }

        var orders = await _shopService.GetCustomerOrdersAsync(customerId, cancellationToken);
        return Ok(orders);
    }

    [HttpGet("addresses")]
    public async Task<ActionResult<IReadOnlyList<CustomerAddressDto>>> GetAddresses(CancellationToken cancellationToken)
    {
        if (!TryApplySession(out var customerId) || string.IsNullOrWhiteSpace(customerId))
        {
            return Unauthorized(new { error = "INVALID_SESSION" });
        }

        var addresses = await _shopService.GetCustomerAddressesAsync(customerId, cancellationToken);
        return Ok(addresses);
    }

    [HttpPost("addresses")]
    public async Task<ActionResult<CustomerAddressDto>> AddAddress(
        [FromBody] AddCustomerAddressRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryApplySession(out var customerId) || string.IsNullOrWhiteSpace(customerId))
        {
            return Unauthorized(new { error = "INVALID_SESSION" });
        }

        var address = await _shopService.AddCustomerAddressAsync(customerId, request, cancellationToken);
        return address is null ? StatusCode(500) : Ok(address);
    }
}
