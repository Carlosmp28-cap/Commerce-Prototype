namespace CommercePrototype_Backend.Models;

public sealed record ProductDetailDto(
    string Id,
    string Name,
    decimal Price,
    string? CategoryId,
    int QuantityAvailable,
    string? Description,
    string? ImageUrl,
    IReadOnlyList<string>? Gallery,
    decimal? Rating,
    int? ReviewCount,
    IReadOnlyList<string>? Features,
    string? ShippingType,
    string? ShippingEstimate
);
