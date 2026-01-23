namespace CommercePrototype_Backend.Models.Products;

/// <summary>
/// Full product detail returned by the API.
/// </summary>
/// <param name="Id">Unique product identifier.</param>
/// <param name="Name">Product display name.</param>
/// <param name="Price">Current price.</param>
/// <param name="CategoryId">Primary category identifier, if available.</param>
/// <param name="QuantityAvailable">Available quantity, when provided by SFCC.</param>
/// <param name="Description">Description/marketing copy, if available.</param>
/// <param name="ImageUrl">Primary image URL, if available.</param>
/// <param name="Gallery">Additional image URLs, if available.</param>
/// <param name="Rating">Average rating, if available.</param>
/// <param name="ReviewCount">Number of reviews, if available.</param>
/// <param name="Features">Product feature list, if available.</param>
/// <param name="ShippingType">Shipping method label, if available.</param>
/// <param name="ShippingEstimate">Estimated delivery time, if available.</param>
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
