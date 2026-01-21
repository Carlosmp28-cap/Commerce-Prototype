namespace CommercePrototype_Backend.Models;

public sealed record CategoryNodeDto(
    string Id,
    string Name,
    string? ParentId,
    IReadOnlyList<CategoryNodeDto> Children
);
