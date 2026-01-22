namespace CommercePrototype_Backend.Models;

public sealed record BasketDto(
    string BasketId,
    string Currency,
    IReadOnlyList<BasketItemDto> Items,
    int ItemCount,
    decimal? ProductTotal,
    decimal? ShippingTotal,
    decimal? TaxTotal,
    decimal? OrderTotal
);
