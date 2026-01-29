namespace CommercePrototype_Backend.Models.Products;

/// <summary>
/// Minimal variant info to support selection on PDP.
/// </summary>
public sealed record ProductVariantDto(
    string Id,
    bool? Orderable,
    IReadOnlyDictionary<string, string>? VariationValues
);
