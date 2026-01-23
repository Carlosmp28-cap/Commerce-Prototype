using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json;
using CommercePrototype_Backend.Options;
using Microsoft.Extensions.Options;

namespace CommercePrototype_Backend.Services.Sfcc.Shared;

/// <summary>
/// SFCC OAuth2 client-credentials token provider.
/// </summary>
/// <remarks>
/// The token is cached in-memory and refreshed when it is close to expiring.
/// A semaphore is used to ensure only one refresh happens concurrently.
/// </remarks>
public class SfccAuthService : ISfccAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IOptionsMonitor<SfccOptions> _sfccOptions;
    private readonly ILogger<SfccAuthService> _logger;
    private string? _cachedToken;
    private DateTime _tokenExpiry;
    private readonly SemaphoreSlim _tokenLock = new(1, 1);

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    /// <summary>
    /// Initializes a new instance of the <see cref="SfccAuthService"/>.
    /// </summary>
    /// <param name="httpClient">HTTP client provided by <c>IHttpClientFactory</c>.</param>
    /// <param name="sfccOptions">Bound SFCC configuration.</param>
    /// <param name="logger">Logger for token retrieval diagnostics.</param>
    public SfccAuthService(HttpClient httpClient, IOptionsMonitor<SfccOptions> sfccOptions, ILogger<SfccAuthService> logger)
    {
        _httpClient = httpClient;
        _sfccOptions = sfccOptions;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken = default)
    {
        // Return cached token if still valid (with 1 minute buffer)
        if (!string.IsNullOrEmpty(_cachedToken) && DateTime.UtcNow < _tokenExpiry.AddMinutes(-1))
        {
            return _cachedToken;
        }

        await _tokenLock.WaitAsync(cancellationToken);
        try
        {
            // Double-check after acquiring the lock.
            if (!string.IsNullOrEmpty(_cachedToken) && DateTime.UtcNow < _tokenExpiry.AddMinutes(-1))
            {
                return _cachedToken;
            }

            var tokenUrl = _sfccOptions.CurrentValue.OAuthTokenUrl;
            var clientId = _sfccOptions.CurrentValue.ClientId;

            if (string.IsNullOrEmpty(tokenUrl) || string.IsNullOrEmpty(clientId))
            {
                throw new InvalidOperationException("Missing SFCC OAuth configuration (OAuthTokenUrl and ClientId required)");
            }

            // Create request matching Postman configuration
            var request = new HttpRequestMessage(HttpMethod.Post, tokenUrl);
            
            // Add Basic Auth header with clientId:clientId (both username and password are the clientId)
            var authString = $"{clientId}:{clientId}";
            var authBytes = Encoding.ASCII.GetBytes(authString);
            var authBase64 = Convert.ToBase64String(authBytes);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", authBase64);

            // Send form data with grant_type
            var formData = new Dictionary<string, string>
            {
                { "grant_type", "client_credentials" }
            };
            request.Content = new FormUrlEncodedContent(formData);

            _logger.LogInformation("Requesting SFCC access token from {TokenUrl}", tokenUrl);

            using var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError("SFCC OAuth2 token request failed: {StatusCode} - {Body}", (int)response.StatusCode, body);
                throw new HttpRequestException($"Failed to get SFCC access token: {response.StatusCode}");
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);

            if (stream is null)
            {
                throw new InvalidOperationException("Empty response body from SFCC OAuth token endpoint");
            }

            var tokenResponse = await JsonSerializer.DeserializeAsync<OAuthTokenResponse>(stream, JsonOptions, cancellationToken);

            if (tokenResponse?.AccessToken == null)
            {
                throw new InvalidOperationException("No access token in SFCC response");
            }

            _cachedToken = tokenResponse.AccessToken;
            _tokenExpiry = DateTime.UtcNow.AddSeconds(tokenResponse.ExpiresIn);

            _logger.LogInformation($"Successfully obtained SFCC access token, valid for {tokenResponse.ExpiresIn} seconds");

            return _cachedToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error obtaining SFCC access token");
            throw;
        }
        finally
        {
            _tokenLock.Release();
        }
    }

    private class OAuthTokenResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("token_type")]
        public string? TokenType { get; set; }
    }
}
