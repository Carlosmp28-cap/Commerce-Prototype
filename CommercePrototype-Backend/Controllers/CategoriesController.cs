using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly ISfccShopService _shopService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(ISfccShopService shopService, ILogger<CategoriesController> logger)
    {
        _shopService = shopService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<CategoryNodeDto>> GetTree(
        [FromQuery] string rootId = "root",
        [FromQuery] int levels = 2,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var tree = await _shopService.GetCategoryTreeAsync(rootId, levels, cancellationToken);
            return tree is null ? NotFound() : Ok(tree);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching categories from SFCC");
            return StatusCode(500, new { error = "Failed to fetch categories from SFCC", details = ex.Message });
        }
    }
}
