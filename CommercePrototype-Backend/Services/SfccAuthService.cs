using System.Text;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CommercePrototype_Backend.Services;

public interface ISfccAuthService
{
    Task<string> GetAccessTokenAsync();
    Task<SfccShopperSession> GetGuestShopperSessionAsync(CancellationToken cancellationToken = default);
    Task<SfccShopperSession> GetCustomerShopperSessionAsync(string username, string password, CancellationToken cancellationToken = default);
}

public sealed record SfccShopperSession(string? AuthToken, string? CookieHeader, string? CustomerId, DateTime ExpiresAtUtc);

public class SfccAuthService : ISfccAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SfccAuthService> _logger;
    private string? _cachedToken;
    private DateTime _tokenExpiry;

    private SfccShopperSession? _cachedGuestSession;

    // Cache only guest session; registered sessions are user-specific and are handled by IShopperSessionStore.

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

    public async Task<SfccShopperSession> GetGuestShopperSessionAsync(CancellationToken cancellationToken = default)
    {
        // Return cached session if still valid (with 1 minute buffer)
        if (_cachedGuestSession is not null && DateTime.UtcNow < _cachedGuestSession.ExpiresAtUtc.AddMinutes(-1))
        {
            return _cachedGuestSession;
        }

        var sfccConfig = _configuration.GetSection("Sfcc");
        var clientId = sfccConfig["ClientId"];

        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException("Missing SFCC configuration (ClientId required)");
        }

        // Use client_credentials token to call /customers/auth (to establish a guest session)
        var clientToken = await GetAccessTokenAsync();

        var request = new HttpRequestMessage(HttpMethod.Post, BuildShopUrl("/customers/auth"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Remove("x-dw-client-id");
        request.Headers.Add("x-dw-client-id", clientId);
        // IMPORTANT: /customers/auth issues a customer auth token for shopper context.
        // Many SFCC setups do NOT require an OAuth bearer here; they only need x-dw-client-id.

        request.Content = new StringContent(
            JsonSerializer.Serialize(new { type = "guest" }),
            Encoding.UTF8,
            "application/json"
        );

        _logger.LogInformation("Requesting SFCC guest shopper token via /customers/auth");

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        _logger.LogInformation(
            "SFCC /customers/auth response headers: {Headers}",
            string.Join(", ", response.Headers.Select(h => h.Key)));

        if (response.Headers.TryGetValues("Authorization", out var authHeaderValues))
        {
            var raw = authHeaderValues.FirstOrDefault() ?? string.Empty;
            var scheme = raw.Contains(' ') ? raw.Split(' ', 2)[0] : "(none)";
            var tokenPart = raw.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? raw[7..].Trim() : raw;
            _logger.LogInformation("SFCC /customers/auth returned Authorization header (scheme={Scheme}, length={Length})", scheme, tokenPart.Length);
        }

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("SFCC guest auth failed: {StatusCode} - {Body}", response.StatusCode, body);
            throw new HttpRequestException($"Failed to get SFCC guest shopper token: {response.StatusCode} - {body}");
        }

        // /customers/auth returns a customer auth token (often `auth_token`) used as Authorization for shopper endpoints.
        // Depending on setup, token can be in the response body or headers.
        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body);
        var root = doc.RootElement;
        var customerId = root.TryGetStringPropertyCaseInsensitive("customer_id") ?? root.TryGetStringPropertyCaseInsensitive("customerId");

        var authToken =
            root.TryGetStringPropertyCaseInsensitive("auth_token")
            ?? root.TryGetStringPropertyCaseInsensitive("authToken")
            ?? root.TryGetStringPropertyCaseInsensitive("access_token")
            ?? root.TryGetStringPropertyCaseInsensitive("token");

        // Some setups return the token in a header.
        if (string.IsNullOrWhiteSpace(authToken) && response.Headers.TryGetValues("Authorization", out var authHeaders))
        {
            var header = authHeaders.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(header) && header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                authToken = header[7..].Trim();
            }
            else if (!string.IsNullOrWhiteSpace(header))
            {
                // Some configurations return token without Bearer prefix.
                authToken = header.Trim();
            }
        }

        // As a fallback, accept a session cookie if present.
        string? cookieHeader = null;
        if (response.Headers.TryGetValues("Set-Cookie", out var setCookieValues))
        {
            var cookiePairs = new List<string>();
            foreach (var setCookie in setCookieValues)
            {
                var firstPart = setCookie.Split(';', 2)[0].Trim();
                if (!string.IsNullOrWhiteSpace(firstPart)) cookiePairs.Add(firstPart);
            }
            if (cookiePairs.Count > 0)
            {
                cookieHeader = string.Join("; ", cookiePairs);
            }
        }

        if (string.IsNullOrWhiteSpace(authToken) && string.IsNullOrWhiteSpace(cookieHeader))
        {
            var snippet = body.Length <= 400 ? body : body[..400] + "...";
            var headerNames = string.Join(", ", response.Headers.Select(h => h.Key));
            throw new InvalidOperationException(
                $"SFCC /customers/auth returned 200 but did not provide a shopper token (no auth_token/access_token and no Set-Cookie). " +
                $"Check OCAPI Shop API settings for /customers/auth and ensure the response includes 'auth_token' (read_attributes isn't restricting it) and that the client is allowed to use customer auth. " +
                $"Response headers: {headerNames}. Body snippet: {snippet}");
        }
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(25);

        _cachedGuestSession = new SfccShopperSession(authToken, cookieHeader, customerId, expiresAtUtc);

        _logger.LogInformation(
            "Obtained SFCC guest shopper session (customer_id={CustomerId}) expiring at {ExpiresAtUtc}",
            customerId ?? "(unknown)",
            expiresAtUtc);

        return _cachedGuestSession;
    }

    public async Task<SfccShopperSession> GetCustomerShopperSessionAsync(string username, string password, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("Username is required", nameof(username));
        if (string.IsNullOrWhiteSpace(password)) throw new ArgumentException("Password is required", nameof(password));

        var sfccConfig = _configuration.GetSection("Sfcc");
        var clientId = sfccConfig["ClientId"];

        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException("Missing SFCC configuration (ClientId required)");
        }

        var clientToken = await GetAccessTokenAsync();

        var request = new HttpRequestMessage(HttpMethod.Post, BuildShopUrl("/customers/auth"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Remove("x-dw-client-id");
        request.Headers.Add("x-dw-client-id", clientId);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", clientToken);

        // OCAPI supports credential-based auth. Many setups expect `login` (not `username`).
        request.Content = new StringContent(
            JsonSerializer.Serialize(new { type = "credentials", login = username, password }),
            Encoding.UTF8,
            "application/json"
        );

        _logger.LogInformation("Requesting SFCC registered shopper session via /customers/auth (credentials)");

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("SFCC credentials auth failed: {StatusCode} - {Body}", response.StatusCode, body);
            throw new HttpRequestException($"Failed to login customer: {response.StatusCode} - {body}");
        }

        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body);
        var root = doc.RootElement;
        var customerId = root.TryGetStringPropertyCaseInsensitive("customer_id") ?? root.TryGetStringPropertyCaseInsensitive("customerId");

        var authToken =
            root.TryGetStringPropertyCaseInsensitive("auth_token")
            ?? root.TryGetStringPropertyCaseInsensitive("authToken")
            ?? root.TryGetStringPropertyCaseInsensitive("access_token")
            ?? root.TryGetStringPropertyCaseInsensitive("token");

        if (string.IsNullOrWhiteSpace(authToken) && response.Headers.TryGetValues("Authorization", out var authHeaders2))
        {
            var header = authHeaders2.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(header) && header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                authToken = header[7..].Trim();
            }
        }

        string? cookieHeader = null;
        if (response.Headers.TryGetValues("Set-Cookie", out var setCookieValues))
        {
            var cookiePairs = new List<string>();
            foreach (var setCookie in setCookieValues)
            {
                var firstPart = setCookie.Split(';', 2)[0].Trim();
                if (!string.IsNullOrWhiteSpace(firstPart)) cookiePairs.Add(firstPart);
            }
            if (cookiePairs.Count > 0)
            {
                cookieHeader = string.Join("; ", cookiePairs);
            }
        }

        if (string.IsNullOrWhiteSpace(authToken) && string.IsNullOrWhiteSpace(cookieHeader))
        {
            var snippet = body.Length <= 400 ? body : body[..400] + "...";
            var headerNames = string.Join(", ", response.Headers.Select(h => h.Key));
            throw new InvalidOperationException(
                $"SFCC /customers/auth (credentials) returned 200 but did not provide a shopper token (no auth_token/access_token and no Set-Cookie). " +
                $"Response headers: {headerNames}. Body snippet: {snippet}");
        }

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(25);

        return new SfccShopperSession(authToken, cookieHeader, customerId, expiresAtUtc);
    }

    private string BuildShopUrl(string endpoint)
    {
        var baseUrl = _configuration["Sfcc:ApiBaseUrl"]?.TrimEnd('/');
        var version = _configuration["Sfcc:ApiVersion"] ?? "v1";
        var siteId = _configuration["Sfcc:SiteId"] ?? "RefArch";

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException("Missing SFCC configuration (ApiBaseUrl required)");
        }

        if (!endpoint.StartsWith("/")) endpoint = "/" + endpoint;
        return $"{baseUrl}/s/{siteId}/dw/shop/{version}{endpoint}";
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

    private sealed class ShopperAuthResponse
    {
        [JsonPropertyName("access_token")]
        public string? AccessToken { get; set; }

        [JsonPropertyName("expires_in")]
        public int ExpiresIn { get; set; }

        [JsonPropertyName("token_type")]
        public string? TokenType { get; set; }

        [JsonPropertyName("customer_id")]
        public string? CustomerId { get; set; }
    }
}

internal static class JsonDocumentExtensions
{
    public static string? TryGetStringPropertyCaseInsensitive(this JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object) return null;

        foreach (var prop in element.EnumerateObject())
        {
            if (!string.Equals(prop.Name, propertyName, StringComparison.OrdinalIgnoreCase)) continue;
            if (prop.Value.ValueKind == JsonValueKind.String) return prop.Value.GetString();
            if (prop.Value.ValueKind == JsonValueKind.Number) return prop.Value.ToString();
        }

        return null;
    }

    public static int? TryGetIntPropertyCaseInsensitive(this JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object) return null;

        foreach (var prop in element.EnumerateObject())
        {
            if (!string.Equals(prop.Name, propertyName, StringComparison.OrdinalIgnoreCase)) continue;
            if (prop.Value.ValueKind == JsonValueKind.Number && prop.Value.TryGetInt32(out var value)) return value;
            if (prop.Value.ValueKind == JsonValueKind.String && int.TryParse(prop.Value.GetString(), out var parsed)) return parsed;
        }

        return null;
    }
}
