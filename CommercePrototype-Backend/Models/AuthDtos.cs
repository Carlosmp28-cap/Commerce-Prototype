using System.Text.Json.Serialization;

namespace CommercePrototype_Backend.Models;

public sealed class LoginRequestDto
{
	// Accept either { "username": "..." } or { "login": "..." } from clients.
	// Many SFCC examples use `login`.
	[JsonPropertyName("username")]
	public string? Username { get; init; }

	// Convenience alias for clients that treat the login identifier as email.
	[JsonPropertyName("email")]
	public string? Email { get; init; }

	[JsonPropertyName("login")]
	public string? Login { get; init; }

	[JsonPropertyName("password")]
	public string? Password { get; init; }

	[JsonPropertyName("basketId")]
	public string? BasketId { get; init; }

	[JsonIgnore]
	public string? EffectiveUsername =>
		!string.IsNullOrWhiteSpace(Login)
			? Login
			: !string.IsNullOrWhiteSpace(Email)
				? Email
				: Username;
}

public sealed record ShopperSessionDto(
	string SessionId,
	string? CustomerId,
	string AuthType,
	string? BasketId = null,
	string? JwtToken = null);
