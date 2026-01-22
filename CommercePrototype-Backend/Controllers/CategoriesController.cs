using CommercePrototype_Backend.Models.Categories;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

/// <summary>
/// Category endpoints backed by the SFCC Shop API.
/// </summary>
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

    /// <summary>
    /// Gets a category tree starting from a root category.
    /// </summary>
    /// <param name="rootId" example="root">SFCC category id used as the tree root.</param>
    /// <param name="levels" example="3">Depth of children to include (capped server-side).</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The category tree rooted at <paramref name="rootId"/>.</returns>
    /// <response code="200">Returns the category tree.</response>
    /// <response code="404">If the category root is not found.</response>
    /// <response code="500">If the SFCC call fails.</response>
    [HttpGet]
    public async Task<ActionResult<CategoryNodeDto>> GetTree(
        [FromQuery] string rootId = "root",
        [FromQuery] int levels = 2,
        CancellationToken cancellationToken = default)
    {
        if (levels < 1) levels = 1;
        if (levels > 5) levels = 5;

        try
        {
            var tree = await _shopService.GetCategoryTreeAsync(rootId, levels, cancellationToken);
            return tree is null ? NotFound() : Ok(tree);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching categories from SFCC");
            return StatusCode(500, new { error = "Failed to fetch categories from SFCC" });
        }
    }
}
