namespace CommercePrototype_Backend.Models;

public sealed record ProductSummaryDto(
    string Id,
    string Name,
    decimal Price,
    string? CategoryId,
    string? ImageUrl,
    decimal? Rating,
    int? ReviewCount
);
