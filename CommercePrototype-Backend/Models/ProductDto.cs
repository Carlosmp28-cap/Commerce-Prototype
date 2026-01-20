namespace CommercePrototype_Backend.Models;

public sealed record ProductDto(
    string Id,
    string Name,
    decimal Price,
    string CategoryId,
    bool InStock
);
