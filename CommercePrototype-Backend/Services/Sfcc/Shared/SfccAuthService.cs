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

            // Use a confidential (server-side) OAuth client when provided.
            // Backwards-compatible fallbacks:
            // - If OAuthClientId/OAuthClientSecret are not set, fall back to TrustedSystemLogin/TrustedSystemPassword (older naming).
            // - If still not set, fall back to ClientId with no secret (legacy behavior; many sandboxes will reject it).
            static string? FirstNonEmpty(params string?[] values)
            {
                foreach (var v in values)
                {
                    if (!string.IsNullOrWhiteSpace(v)) return v;
                }

                return null;
            }

            var oauthClientId = FirstNonEmpty(
                _sfccOptions.CurrentValue.OAuthClientId,
                _sfccOptions.CurrentValue.ClientId);

            var oauthClientSecret =
                _sfccOptions.CurrentValue.OAuthClientSecret
                ?? _sfccOptions.CurrentValue.TrustedSystemPassword;

            if (string.IsNullOrEmpty(tokenUrl) || string.IsNullOrEmpty(oauthClientId))
            {
                throw new InvalidOperationException("Missing SFCC OAuth configuration (OAuthTokenUrl and OAuthClientId/ClientId required)");
            }

            if (string.IsNullOrWhiteSpace(oauthClientSecret))
            {
                throw new InvalidOperationException(
                    "Missing SFCC OAuth client secret. Configure Sfcc:OAuthClientSecret (preferred) or Sfcc:TrustedSystemPassword for client-credentials token retrieval.");
            }

            // Create request matching Postman configuration
            var request = new HttpRequestMessage(HttpMethod.Post, tokenUrl);
            
            // Add Basic Auth header with client_id:client_secret
            var authString = $"{oauthClientId}:{oauthClientSecret}";
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

        var clientId = _sfccOptions.CurrentValue.OAuthClientId ?? _sfccOptions.CurrentValue.ClientId;
        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException("Missing SFCC configuration (ClientId required)");
        }

        var request = new HttpRequestMessage(HttpMethod.Post, BuildShopUrl("/customers/auth"));
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Headers.Remove("x-dw-client-id");
        request.Headers.Add("x-dw-client-id", clientId);
        request.Headers.Add("Origin", "http://www.sitegenesis.com");

        // Adiciona Basic Auth com username e password do shopper
        var basicAuth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{username}:{password}"));
        request.Headers.Authorization = new AuthenticationHeaderValue("Basic", basicAuth);

        // Body só com type: credentials
        var payload = new Dictionary<string, string?>
        {
            ["type"] = "credentials"
        };
        request.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

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

        // Se não veio no body, tenta pegar do header Authorization
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
                $"SFCC /customers/auth (credentials) returned 200 but did not provide a shopper token (no auth_token/access_token and no Set-Cookie/Authorization header). " +
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

        // Prefer the confidential OAuth client for trusted-system flows.
        static string? FirstNonEmpty(params string?[] values)
        {
            foreach (var v in values)
            {
                if (!string.IsNullOrWhiteSpace(v)) return v;
            }

            return null;
        }

        var clientId = FirstNonEmpty(
            _sfccOptions.CurrentValue.OAuthClientId,
            _sfccOptions.CurrentValue.ClientId);
        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException("Missing SFCC configuration (ClientId required)");
        }

        // Trusted-system auth typically requires a client-credentials bearer token.
        var clientToken = await GetAccessTokenAsync(cancellationToken);

        // Older config uses TrustedSystemLogin/TrustedSystemPassword.
        // Depending on sandbox config, /customers/auth/trustedsystem may require additional fields.
        // We keep these optional and try the minimal payload first, then fall back.
        var login = _sfccOptions.CurrentValue.TrustedSystemLogin;
        var password = _sfccOptions.CurrentValue.TrustedSystemPassword;
        var includeLogin = _sfccOptions.CurrentValue.TrustedSystemIncludeLogin;

        HttpRequestMessage CreateRequest(object payloadObj)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, BuildShopUrl("/customers/auth/trustedsystem"));
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            request.Headers.Remove("x-dw-client-id");
            request.Headers.Add("x-dw-client-id", clientId);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", clientToken);

            var payloadJson = JsonSerializer.Serialize(payloadObj);
            request.Content = new StringContent(payloadJson, Encoding.UTF8, "application/json");
            return request;
        }

        async Task<(HttpResponseMessage Response, string Body)> SendAsync(object payloadObj)
        {
            using var request = CreateRequest(payloadObj);
            var resp = await _httpClient.SendAsync(request, cancellationToken);
            var respBody = await resp.Content.ReadAsStringAsync(cancellationToken);
            return (resp, respBody);
        }

        _logger.LogInformation("Requesting SFCC trusted-system shopper session via /customers/auth/trustedsystem");

        // Try minimal payload first.
        var (response, body) = await SendAsync(new { client_id = clientId });

        if (!response.IsSuccessStatusCode && TryGetFaultInfo(body, out var faultType, out var faultPath, out var faultProperty))
        {
            var requiresLogin =
                (!string.IsNullOrWhiteSpace(faultProperty) && faultProperty.Equals("login", StringComparison.OrdinalIgnoreCase))
                || (!string.IsNullOrWhiteSpace(faultPath) && faultPath.Contains("$.login", StringComparison.OrdinalIgnoreCase))
                || (faultType?.Contains("MissingProperty", StringComparison.OrdinalIgnoreCase) ?? false)
                || (faultType?.Contains("RequiredProperty", StringComparison.OrdinalIgnoreCase) ?? false);

            // Only attempt login-based payloads if the server indicates the login field is required.
            if (includeLogin && requiresLogin && !string.IsNullOrWhiteSpace(login))
            {
                response.Dispose();
                (response, body) = await SendAsync(new { client_id = clientId, login });

                if (!response.IsSuccessStatusCode && !string.IsNullOrWhiteSpace(password))
                {
                    response.Dispose();
                    (response, body) = await SendAsync(new { client_id = clientId, login, password });
                }
            }
        }

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

    private static bool TryGetFaultInfo(string body, out string? faultType, out string? faultPath, out string? faultProperty)
    {
        faultType = null;
        faultPath = null;
        faultProperty = null;

        if (string.IsNullOrWhiteSpace(body)) return false;

        try
        {
            using var doc = JsonDocument.Parse(body);
            if (!doc.RootElement.TryGetProperty("fault", out var fault)) return false;

            if (fault.TryGetProperty("type", out var typeNode) && typeNode.ValueKind == JsonValueKind.String)
            {
                faultType = typeNode.GetString();
            }

            if (fault.TryGetProperty("arguments", out var args))
            {
                if (args.TryGetProperty("path", out var pathNode) && pathNode.ValueKind == JsonValueKind.String)
                {
                    faultPath = pathNode.GetString();
                }

                if (args.TryGetProperty("property", out var propNode) && propNode.ValueKind == JsonValueKind.String)
                {
                    faultProperty = propNode.GetString();
                }
            }

            return true;
        }
        catch
        {
            return false;
        }
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
