namespace CommercePrototype_Backend.Models.Products;

/// <summary>
/// Paged search result for product listings.
/// </summary>
/// <param name="Items">Returned items for the current page.</param>
/// <param name="Total">Total number of matching products.</param>
/// <param name="Count">Number of items in <paramref name="Items"/>.</param>
/// <param name="Offset">Zero-based offset used to produce this page.</param>
public sealed record ProductSearchResultDto(
    IReadOnlyList<ProductSummaryDto> Items,
    int Total,
    int Count,
    int Offset
);
