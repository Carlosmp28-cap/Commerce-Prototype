using CommercePrototype_Backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductsController : ControllerBase
{
    // In-memory sample data for the prototype.
    // Later you can swap this for a DB or another service.
    private static readonly IReadOnlyList<ProductDto> Products =
    [
        new("sku-new-001", "Lightweight Tee", 18.99m, "new", true),
        new("sku-new-006", "Everyday Hoodie", 39.99m, "new", true),
        new("sku-men-005", "Classic Polo", 29.99m, "men", false),
    ];

    [HttpGet]
    public ActionResult<IEnumerable<ProductDto>> List([FromQuery] string? q = null)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(Products);

        var filtered = Products.Where(p =>
            p.Name.Contains(q, StringComparison.OrdinalIgnoreCase)
            || p.CategoryId.Equals(q, StringComparison.OrdinalIgnoreCase)
        );

        return Ok(filtered);
    }

    [HttpGet("{id}")]
    public ActionResult<ProductDto> GetById(string id)
    {
        var product = Products.FirstOrDefault(p => p.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
        return product is null ? NotFound() : Ok(product);
    }
}
