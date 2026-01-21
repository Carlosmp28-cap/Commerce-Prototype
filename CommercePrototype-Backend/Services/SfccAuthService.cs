using System.Text;
using System.Text.Json.Serialization;

namespace CommercePrototype_Backend.Services;

public interface ISfccAuthService
{
    Task<string> GetAccessTokenAsync();
}

public class SfccAuthService : ISfccAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SfccAuthService> _logger;
    private string? _cachedToken;
    private DateTime _tokenExpiry;

    public SfccAuthService(HttpClient httpClient, IConfiguration configuration, ILogger<SfccAuthService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> GetAccessTokenAsync()
    {
        // Return cached token if still valid (with 1 minute buffer)
        if (!string.IsNullOrEmpty(_cachedToken) && DateTime.UtcNow < _tokenExpiry.AddMinutes(-1))
        {
            return _cachedToken;
        }

        try
        {
            var sfccConfig = _configuration.GetSection("Sfcc");
            var tokenUrl = sfccConfig["OAuthTokenUrl"];
            var clientId = sfccConfig["ClientId"];

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

            _logger.LogInformation($"Requesting SFCC access token from {tokenUrl}");

            var response = await _httpClient.SendAsync(request);

            var error = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError($"SFCC OAuth2 token request failed: {response.StatusCode} - {error}");
                throw new HttpRequestException($"Failed to get SFCC access token: {response.StatusCode} - {error}");
            }

            var tokenResponse = System.Text.Json.JsonSerializer.Deserialize<OAuthTokenResponse>(error, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

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
