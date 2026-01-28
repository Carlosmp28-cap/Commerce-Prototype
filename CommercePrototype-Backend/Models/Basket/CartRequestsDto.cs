namespace CommercePrototype_Backend.Models.Basket;

public sealed record CreateBasketRequestDto(string? Currency = null);

public sealed record AddBasketItemRequestDto(string ProductId, int Quantity = 1);

public sealed record UpdateBasketItemQuantityRequestDto(int Quantity);
