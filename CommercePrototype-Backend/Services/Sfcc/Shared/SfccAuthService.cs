using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using CommercePrototype_Backend.Options;
using Microsoft.Extensions.Options;

namespace CommercePrototype_Backend.Services.Sfcc.Shared;

/// <summary>
/// SFCC OAuth2 client-credentials token provider and shopper-session helper.
/// </summary>
/// <remarks>
/// - The client-credentials token is cached in-memory and refreshed when close to expiring.
/// - A semaphore is used to ensure only one refresh happens concurrently.
/// - Guest shopper sessions are cached in-memory as well (registered sessions are user-specific).
/// </remarks>
public class SfccAuthService : ISfccAuthService
{
    private readonly HttpClient _httpClient;
    private readonly IOptionsMonitor<SfccOptions> _sfccOptions;
    private readonly ILogger<SfccAuthService> _logger;
    private string? _cachedToken;
    private DateTime _tokenExpiry;
    private readonly SemaphoreSlim _tokenLock = new(1, 1);

    private SfccShopperSession? _cachedGuestSession;
    private SfccShopperSession? _cachedTrustedSystemSession;

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

    public async Task<SfccShopperSession> GetGuestShopperSessionAsync(CancellationToken cancellationToken = default)
    {
        // Return cached session if still valid (with 1 minute buffer)
        if (_cachedGuestSession is not null && DateTime.UtcNow < _cachedGuestSession.ExpiresAtUtc.AddMinutes(-1))
        {
            return _cachedGuestSession;
        }

        var clientId = _sfccOptions.CurrentValue.ClientId;

        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException("Missing SFCC configuration (ClientId required)");
        }

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
        var expiresAtUtc = ComputeShopperSessionExpiryUtc(authToken, fallbackMinutes: 25);

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

        var clientId = _sfccOptions.CurrentValue.ClientId;

        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException("Missing SFCC configuration (ClientId required)");
        }

        var clientToken = await GetAccessTokenAsync(cancellationToken);

        static string? TryParseUnknownProperty(string body)
        {
            // Example body:
            // {"fault":{"arguments":{"property":"login","document":"auth_request"},"type":"UnknownPropertyException",...}}
            try
            {
                using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body);
                if (doc.RootElement.TryGetProperty("fault", out var fault)
                    && fault.TryGetProperty("type", out var type)
                    && string.Equals(type.GetString(), "UnknownPropertyException", StringComparison.OrdinalIgnoreCase)
                    && fault.TryGetProperty("arguments", out var args)
                    && args.TryGetProperty("property", out var prop))
                {
                    return prop.GetString();
                }
            }
            catch
            {
                // ignore parsing failures
            }

            return null;
        }

        HttpRequestMessage CreateCredentialsRequest(string userField)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, BuildShopUrl("/customers/auth"));
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Remove("x-dw-client-id");
            request.Headers.Add("x-dw-client-id", clientId);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", clientToken);

            var payload = new Dictionary<string, string?>
            {
                ["type"] = "credentials",
                [userField] = username,
                ["password"] = password
            };

            request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            return request;
        }

        async Task<(HttpResponseMessage Response, string Body)> SendCredentialsAuthAsync(string userField)
        {
            using var request = CreateCredentialsRequest(userField);

            // Log only the shape (redacted password) to avoid secrets in logs.
            var redacted = new Dictionary<string, string?>
            {
                ["type"] = "credentials",
                [userField] = username,
                ["password"] = "***"
            };
            _logger.LogInformation("Requesting SFCC registered shopper session via /customers/auth (credentials): {Payload}", JsonSerializer.Serialize(redacted));

            var response = await _httpClient.SendAsync(request, cancellationToken);
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            return (response, body);
        }

        HttpResponseMessage? response = null;
        string body = string.Empty;

        // SFCC sandboxes differ on the accepted identifier field name for credentials.
        // Common variants observed: `username`, `email`, `login`.
        foreach (var userField in new[] { "username", "email", "login" })
        {
            response?.Dispose();
            (response, body) = await SendCredentialsAuthAsync(userField);

            if (response.IsSuccessStatusCode)
            {
                break;
            }

            if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
            {
                var unknown = TryParseUnknownProperty(body);
                if (!string.IsNullOrWhiteSpace(unknown))
                {
                    _logger.LogWarning("SFCC rejected credentials payload field '{Field}'; trying next option", unknown);
                    continue;
                }
            }

            // Non-retriable failure.
            break;
        }

        if (response is null)
        {
            throw new InvalidOperationException("Failed to call SFCC /customers/auth (credentials): no response");
        }

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

        var expiresAtUtc = ComputeShopperSessionExpiryUtc(authToken, fallbackMinutes: 25);

        return new SfccShopperSession(authToken, cookieHeader, customerId, expiresAtUtc);
    }

    public async Task<SfccShopperSession> GetTrustedSystemShopperSessionAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedTrustedSystemSession is not null
            && DateTime.UtcNow < _cachedTrustedSystemSession.ExpiresAtUtc.AddMinutes(-1))
        {
            return _cachedTrustedSystemSession;
        }

        var clientId = _sfccOptions.CurrentValue.ClientId;
        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException("Missing SFCC configuration (ClientId required)");
        }

        // Trusted-system auth typically requires a client-credentials bearer token.
        var clientToken = await GetAccessTokenAsync(cancellationToken);

        var login = _sfccOptions.CurrentValue.TrustedSystemLogin;
        var password = _sfccOptions.CurrentValue.TrustedSystemPassword;
        if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Missing configuration: Sfcc:TrustedSystemLogin and Sfcc:TrustedSystemPassword are required for /customers/auth/trustedsystem in this sandbox.");
        }

        var request = new HttpRequestMessage(HttpMethod.Post, BuildShopUrl("/customers/auth/trustedsystem"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Remove("x-dw-client-id");
        request.Headers.Add("x-dw-client-id", clientId);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", clientToken);

        // SFCC expects a trusted_system_auth_request document.
        // This sandbox requires at least client_id + login + password.
        var payload = JsonSerializer.Serialize(new { client_id = clientId, login, password });
        request.Content = new StringContent(payload, Encoding.UTF8, "application/json");

        _logger.LogInformation("Requesting SFCC trusted-system shopper session via /customers/auth/trustedsystem");

        var response = await _httpClient.SendAsync(request, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError("SFCC trusted-system auth failed: {StatusCode} - {Body}", response.StatusCode, body);
            throw new HttpRequestException($"Failed to get SFCC trusted-system token: {response.StatusCode} - {body}");
        }

        using var doc = JsonDocument.Parse(string.IsNullOrWhiteSpace(body) ? "{}" : body);
        var root = doc.RootElement;

        var authToken =
            root.TryGetStringPropertyCaseInsensitive("auth_token")
            ?? root.TryGetStringPropertyCaseInsensitive("authToken")
            ?? root.TryGetStringPropertyCaseInsensitive("access_token")
            ?? root.TryGetStringPropertyCaseInsensitive("token");

        if (string.IsNullOrWhiteSpace(authToken) && response.Headers.TryGetValues("Authorization", out var authHeaders))
        {
            var header = authHeaders.FirstOrDefault();
            if (!string.IsNullOrWhiteSpace(header) && header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                authToken = header[7..].Trim();
            }
            else if (!string.IsNullOrWhiteSpace(header))
            {
                authToken = header.Trim();
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
                $"SFCC /customers/auth/trustedsystem returned 200 but did not provide a token (no auth_token/access_token and no Set-Cookie). " +
                $"Response headers: {headerNames}. Body snippet: {snippet}");
        }

        var expiresAtUtc = ComputeShopperSessionExpiryUtc(authToken, fallbackMinutes: 25);
        _cachedTrustedSystemSession = new SfccShopperSession(authToken, cookieHeader, CustomerId: null, expiresAtUtc);
        return _cachedTrustedSystemSession;
    }

    private static DateTime ComputeShopperSessionExpiryUtc(string? authToken, int fallbackMinutes)
    {
        if (!string.IsNullOrWhiteSpace(authToken) && TryGetJwtExpiryUtc(authToken, out var jwtExpiryUtc))
        {
            // Add a small buffer so we refresh before the token is actually rejected.
            var buffered = jwtExpiryUtc.AddSeconds(-60);
            return buffered > DateTime.UtcNow ? buffered : jwtExpiryUtc;
        }

        return DateTime.UtcNow.AddMinutes(fallbackMinutes);
    }

    private static bool TryGetJwtExpiryUtc(string token, out DateTime expiryUtc)
    {
        expiryUtc = default;

        var trimmed = token.Trim();
        if (trimmed.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = trimmed[7..].Trim();
        }

        var parts = trimmed.Split('.');
        if (parts.Length < 2) return false;

        var payload = parts[1];
        payload = payload.Replace('-', '+').Replace('_', '/');
        switch (payload.Length % 4)
        {
            case 2: payload += "=="; break;
            case 3: payload += "="; break;
        }

        try
        {
            var bytes = Convert.FromBase64String(payload);
            using var doc = JsonDocument.Parse(bytes);
            if (doc.RootElement.ValueKind != JsonValueKind.Object) return false;

            if (!doc.RootElement.TryGetProperty("exp", out var expElement)) return false;
            if (expElement.ValueKind != JsonValueKind.Number) return false;
            if (!expElement.TryGetInt64(out var expSeconds)) return false;

            expiryUtc = DateTimeOffset.FromUnixTimeSeconds(expSeconds).UtcDateTime;
            return true;
        }
        catch
        {
            return false;
        }
    }

    private string BuildShopUrl(string endpoint)
    {
        var baseUrl = _sfccOptions.CurrentValue.ApiBaseUrl?.TrimEnd('/');
        var version = _sfccOptions.CurrentValue.ApiVersion ?? "v1";
        var siteId = _sfccOptions.CurrentValue.SiteId ?? "RefArch";

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
