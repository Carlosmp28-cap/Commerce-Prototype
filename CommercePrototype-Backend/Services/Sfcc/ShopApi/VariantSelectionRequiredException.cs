namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

public sealed class VariantSelectionRequiredException : Exception
{
    public VariantSelectionRequiredException(string masterProductId, IReadOnlyList<string> variantIds)
        : base($"Variant selection required for master product '{masterProductId}'.")
    {
        MasterProductId = masterProductId;
        VariantIds = variantIds;
    }

    public string MasterProductId { get; }
    public IReadOnlyList<string> VariantIds { get; }
}
