using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

[ApiController]
[Route("api/routes")]
public sealed class RoutesController : ControllerBase
{
    private readonly IRouteService _routeService;
    private readonly ILogger<RoutesController> _logger;

    public RoutesController(IRouteService routeService, ILogger<RoutesController> logger)
    {
        _routeService = routeService;
        _logger = logger;
    }

    [HttpPost("calculate")]
    public async Task<ActionResult<RouteResultDto>> Calculate([FromBody] RouteRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.StoreId) || string.IsNullOrWhiteSpace(request.ProductId))
        {
            return BadRequest(new { error = "storeId and productId are required" });
        }

        try
        {
            var result = await _routeService.CalculateRouteAsync(request, cancellationToken);
            if (result == null) return NotFound(new { error = "Store or product not found in mocked data" });
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating route");
            return StatusCode(500, new { error = "Failed to calculate route", details = ex.Message });
        }
    }
}
