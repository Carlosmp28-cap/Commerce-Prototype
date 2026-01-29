namespace CommercePrototype_Backend.Services.Sfcc.Shared;

/// <summary>
/// Provides OAuth access tokens and shopper sessions for SFCC API requests.
/// </summary>
public interface ISfccAuthService
{
    /// <summary>
    /// Gets a valid access token, refreshing it if required.
    /// </summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>A bearer token string.</returns>
    Task<string> GetAccessTokenAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates or retrieves a cached guest shopper session.
    /// </summary>
    Task<SfccShopperSession> GetGuestShopperSessionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a shopper session for a registered customer using credentials.
    /// </summary>
    Task<SfccShopperSession> GetCustomerShopperSessionAsync(string username, string password, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates or retrieves a cached trusted-system shopper session.
    /// </summary>
    /// <remarks>
    /// This is used for Shop API operations that require a trusted system context
    /// (for example, customer creation in environments where anonymous creation is forbidden).
    /// </remarks>
    Task<SfccShopperSession> GetTrustedSystemShopperSessionAsync(CancellationToken cancellationToken = default);
}

