namespace CommercePrototype_Backend.Models;

public sealed record LoginRequestDto(string Username, string Password);

public sealed record ShopperSessionDto(string SessionId, string? CustomerId, string AuthType);
