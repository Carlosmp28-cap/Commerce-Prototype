namespace CommercePrototype_Backend.Services;

// Scoped per HTTP request, used to pass shopper session/cookie to SfccApiClient.
public sealed class SfccRequestContext
{
    public string? ShopperAuthToken { get; set; }
    public string? ShopperCookieHeader { get; set; }
    public string? ClientAuthToken { get; set; }
}
