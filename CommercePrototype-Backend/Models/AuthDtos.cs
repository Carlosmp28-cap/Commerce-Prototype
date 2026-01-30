using System.Text.Json.Serialization;

namespace CommercePrototype_Backend.Models;

public sealed class LoginRequestDto
{
    [JsonPropertyName("username")]
    public string? Username { get; init; }

    [JsonPropertyName("password")]
    public string? Password { get; init; }

    [JsonPropertyName("basketId")]
    public string? BasketId { get; init; }
}

public sealed record ShopperSessionDto(
	string SessionId,
	string? CustomerId,
	string AuthType,
	string? BasketId = null,
	string? JwtToken = null);
