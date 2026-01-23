namespace CommercePrototype_Backend.Models.Products;

/// <summary>
/// Lightweight product projection used in search/listing results.
/// </summary>
/// <param name="Id">Unique product identifier.</param>
/// <param name="Name">Product display name.</param>
/// <param name="Price">Current price.</param>
/// <param name="CategoryId">Primary category identifier, if available.</param>
/// <param name="ImageUrl">Primary image URL, if available.</param>
/// <param name="Rating">Average rating, if available.</param>
/// <param name="ReviewCount">Number of reviews, if available.</param>
public sealed record ProductSummaryDto(
    string Id,
    string Name,
    decimal Price,
    string? CategoryId,
    string? ImageUrl,
    decimal? Rating,
    int? ReviewCount
);
