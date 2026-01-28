using System;

namespace CommercePrototype_Backend.Services.Sfcc.Shared;

public sealed record SfccShopperSession(string? AuthToken, string? CookieHeader, string? CustomerId, DateTime ExpiresAtUtc);
