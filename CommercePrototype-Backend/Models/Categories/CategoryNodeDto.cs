namespace CommercePrototype_Backend.Models.Categories;

/// <summary>
/// Category node used to represent a hierarchical category tree.
/// </summary>
/// <param name="Id">Unique category identifier.</param>
/// <param name="Name">Display name for the category.</param>
/// <param name="ParentId">Parent category identifier, if any.</param>
/// <param name="Children">Child categories.</param>
public sealed record CategoryNodeDto(
    string Id,
    string Name,
    string? ParentId,
    IReadOnlyList<CategoryNodeDto> Children
);
