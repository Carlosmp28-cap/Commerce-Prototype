namespace CommercePrototype_Backend.Models.Basket;

public sealed record BasketItemDto(
    string ItemId,
    string ProductId,
    string? ProductName,
    int Quantity,
    decimal? Price,
    decimal? BasePrice,
    string? ImageUrl
);
