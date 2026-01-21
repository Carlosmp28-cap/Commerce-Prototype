namespace CommercePrototype_Backend.Models;

public sealed record ProductSearchResultDto(
    IReadOnlyList<ProductSummaryDto> Items,
    int Total,
    int Count,
    int Offset
);
