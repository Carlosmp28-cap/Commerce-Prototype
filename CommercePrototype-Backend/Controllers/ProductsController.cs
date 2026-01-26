using CommercePrototype_Backend.Models.Products;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

/// <summary>
/// Product endpoints backed by the SFCC Shop API.
/// </summary>
[ApiController]
[Route("api/products")]
public sealed class ProductsController : ControllerBase
{
    private readonly ISfccShopService _shopService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(ISfccShopService shopService, ILogger<ProductsController> logger)
    {
        _shopService = shopService;
        _logger = logger;
    }

    /// <summary>
    /// Searches products within a category.
    /// </summary>
    /// <remarks>
    /// SFCC product search is category-oriented in this prototype, so <paramref name="categoryId"/> is required.
    /// The result set is paged using <paramref name="limit"/> and <paramref name="offset"/>.
    /// </remarks>
    /// <param name="categoryId" example="mens">SFCC category id to search within.</param>
    /// <param name="q" example="shoes">Optional free-text query.</param>
    /// <param name="limit" example="24">Maximum number of items to return (capped server-side).</param>
    /// <param name="offset" example="0">Zero-based offset into the result set.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>A paged list of products.</returns>
    /// <response code="200">Returns a paged list of products.</response>
    /// <response code="400">If <paramref name="categoryId"/> is missing.</response>
    /// <response code="500">If the SFCC call fails.</response>
    [HttpGet]
    public async Task<ActionResult<ProductSearchResultDto>> Search(
        [FromQuery] string categoryId,
        [FromQuery] string? q = null,
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(categoryId))
        {
            return BadRequest(new { error = "categoryId is required. Products in SFCC are organized by categories." });
        }

        if (limit < 1) limit = 1;
        if (limit > 100) limit = 100;
        if (offset < 0) offset = 0;

        try
        {
            // categoryId is now guaranteed to be non-null
            var result = await _shopService.SearchProductsAsync(categoryId!, q, limit, offset, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products in SFCC for category {CategoryId}", categoryId);
            return StatusCode(500, new { error = "Failed to search products from SFCC" });
        }
    }

    /// <summary>
    /// Gets a product by id.
    /// </summary>
    /// <param name="id" example="25752235M">SFCC product id.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The product detail if found.</returns>
    /// <response code="200">Returns the product detail.</response>
    /// <response code="404">If the product is not found.</response>
    /// <response code="500">If the SFCC call fails.</response>
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDetailDto>> GetById(string id, CancellationToken cancellationToken = default)
    {
        try
        {
            var product = await _shopService.GetProductAsync(id, cancellationToken);
            return product is null ? NotFound() : Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching product {ProductId} from SFCC", id);
            return StatusCode(500, new { error = "Failed to fetch product from SFCC" });
        }
    }
}
    