
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CommercePrototype_Backend.Models.Products;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;

namespace CommercePrototype_Backend.Controllers;

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
    /// Search products in SFCC Shop API. Supports optional keyword and category filter.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<ProductSearchResultDto>> Search(
        [FromQuery] string? q = null,
        [FromQuery] string? categoryId = null,
        [FromQuery] int limit = 12,
        [FromQuery] int offset = 0,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // SfccShopService.SearchProductsAsync expects categoryId first, then query
            var result = await _shopService.SearchProductsAsync(categoryId, q, limit, offset, cancellationToken);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products in SFCC");
            return StatusCode(500, new { error = "Failed to search products from SFCC", details = ex.Message });
        }
    }

    /// <summary>
    /// Get product detail by id from SFCC Shop API.
    /// </summary>
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
            return StatusCode(500, new { error = "Failed to fetch product from SFCC", details = ex.Message });
        }
    }
}
    