namespace CommercePrototype_Backend.Services.Sfcc.Shared;

/// <summary>
/// Provides OAuth access tokens for SFCC API requests.
/// </summary>
public interface ISfccAuthService
{
    /// <summary>
    /// Gets a valid access token, refreshing it if required.
    /// </summary>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>A bearer token string.</returns>
    Task<string> GetAccessTokenAsync(CancellationToken cancellationToken = default);
}
