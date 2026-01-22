namespace CommercePrototype_Backend.Models.Products;

/// <summary>
/// Minimal product representation.
/// </summary>
/// <param name="Id">Unique product identifier.</param>
/// <param name="Name">Product display name.</param>
/// <param name="Price">Current price.</param>
/// <param name="CategoryId">Primary category identifier.</param>
/// <param name="InStock">Whether the product is currently in stock.</param>
public sealed record ProductDto(
    string Id,
    string Name,
    decimal Price,
    string CategoryId,
    bool InStock
);
