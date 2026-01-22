using System.Net;
using System.Net.Http.Headers;
using System.Text.Json.Serialization;
using System.Linq;

namespace CommercePrototype_Backend.Services;

public interface ISfccApiClient
{
    Task<T?> GetAsync<T>(string endpoint);
    Task<T?> PostAsync<T>(string endpoint, object? payload = null);
    Task<T?> PatchAsync<T>(string endpoint, object? payload = null);
    Task<T?> PutAsync<T>(string endpoint, object? payload = null);
    Task<T?> DeleteAsync<T>(string endpoint);
    Task DeleteAsync(string endpoint);
}

public sealed class SfccApiException : HttpRequestException
{
    public SfccApiException(string message, HttpStatusCode? statusCode, string? responseBody)
        : base(message, null, statusCode)
    {
        ResponseBody = responseBody;
    }

    public string? ResponseBody { get; }
}

public class SfccApiClient : ISfccApiClient
{
    private readonly HttpClient _httpClient;
    private readonly ISfccAuthService _authService;
    private readonly SfccRequestContext _requestContext;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SfccApiClient> _logger;

    public SfccApiClient(HttpClient httpClient, ISfccAuthService authService, SfccRequestContext requestContext, IConfiguration configuration, ILogger<SfccApiClient> logger)
    {
        _httpClient = httpClient;
        _authService = authService;
        _requestContext = requestContext;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string endpoint)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, BuildUrl(endpoint));
        return await SendAsync<T>(request);
    }

    public async Task<T?> PostAsync<T>(string endpoint, object? payload = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, BuildUrl(endpoint));
        if (payload != null)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(payload);
            // Safe diagnostics: log payload only for basket item mutations (no credentials).
            if (request.RequestUri?.AbsolutePath.Contains("/baskets/", StringComparison.OrdinalIgnoreCase) == true
                && request.RequestUri.AbsolutePath.EndsWith("/items", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogInformation("SFCC request payload for {Method} {Url}: {Json}", request.Method, request.RequestUri, json);
            }
            request.Content = new StringContent(
                json,
                System.Text.Encoding.UTF8,
                "application/json"
            );
        }
        return await SendAsync<T>(request);
    }

    public async Task<T?> PatchAsync<T>(string endpoint, object? payload = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Patch, BuildUrl(endpoint));
        if (payload != null)
        {
            request.Content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json"
            );
        }
        return await SendAsync<T>(request);
    }

    public async Task<T?> PutAsync<T>(string endpoint, object? payload = null)
    {
        var request = new HttpRequestMessage(HttpMethod.Put, BuildUrl(endpoint));
        if (payload != null)
        {
            request.Content = new StringContent(
                System.Text.Json.JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json"
            );
        }
        return await SendAsync<T>(request);
    }

    public async Task DeleteAsync(string endpoint)
    {
        await DeleteAsync<object>(endpoint);
    }

    public async Task<T?> DeleteAsync<T>(string endpoint)
    {
        var request = new HttpRequestMessage(HttpMethod.Delete, BuildUrl(endpoint));
        return await SendAsync<T>(request);
    }

    private async Task<T?> SendAsync<T>(HttpRequestMessage request)
    {
        try
        {
            // Use x-dw-client-id header (public Shop API access)
            var clientId = _configuration["Sfcc:ClientId"];
            if (!string.IsNullOrWhiteSpace(clientId))
            {
                request.Headers.Remove("x-dw-client-id");
                request.Headers.Add("x-dw-client-id", clientId);
            }

            // Add OAuth2 bearer token (client_credentials) for Shop API calls.
            // For baskets, SFCC requires a shopper session (cookie) established via /customers/auth.
            var needsShopper = request.RequestUri?.AbsolutePath.Contains("/baskets", StringComparison.OrdinalIgnoreCase) == true;

            if (needsShopper)
            {
                var authToken = _requestContext.ShopperAuthToken;
                var cookieHeader = _requestContext.ShopperCookieHeader;

                if (string.IsNullOrWhiteSpace(authToken) && string.IsNullOrWhiteSpace(cookieHeader))
                {
                    var guestSession = await _authService.GetGuestShopperSessionAsync();
                    authToken = guestSession.AuthToken;
                    cookieHeader = guestSession.CookieHeader;
                }

                if (!string.IsNullOrWhiteSpace(authToken))
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authToken);
                    _logger.LogInformation("SFCC shopper auth token applied for {Method} {Url}", request.Method, request.RequestUri);
                }

                if (!string.IsNullOrWhiteSpace(cookieHeader))
                {
                    request.Headers.Remove("Cookie");
                    request.Headers.Add("Cookie", cookieHeader);
                    _logger.LogInformation("SFCC shopper session cookie applied for {Method} {Url}", request.Method, request.RequestUri);
                }
            }
            else
            {
                // Non-shopper endpoints: keep existing behavior (OAuth client token) as some sandboxes require it.
                var clientAccessToken = await _authService.GetAccessTokenAsync();
                if (!string.IsNullOrWhiteSpace(clientAccessToken))
                {
                    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", clientAccessToken);
                }
            }

            _logger.LogInformation(
                "SFCC Authorization header applied (client) for {Method} {Url}",
                request.Method,
                request.RequestUri);

            // Always request JSON responses
            if (!request.Headers.Accept.Any())
            {
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            }

            // Ensure content type when sending a body
            if (request.Content != null && request.Content.Headers.ContentType == null)
            {
                request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            }

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError($"SFCC API call failed: {request.Method} {request.RequestUri} - {response.StatusCode} - {error}");
                throw new SfccApiException($"SFCC API request failed: {response.StatusCode}", response.StatusCode, error);
            }

            var content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrEmpty(content))
            {
                return default;
            }

            return System.Text.Json.JsonSerializer.Deserialize<T>(content, new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error calling SFCC API: {request.Method} {request.RequestUri}");
            throw;
        }
    }

    private string BuildUrl(string endpoint)
    {
        var baseUrl = _configuration["Sfcc:ApiBaseUrl"]?.TrimEnd('/');
        var version = _configuration["Sfcc:ApiVersion"] ?? "v1";
        var siteId = _configuration["Sfcc:SiteId"] ?? "RefArch";

        if (endpoint.StartsWith("http"))
        {
            return endpoint;
        }

        // Ensure endpoint starts with /
        if (!endpoint.StartsWith("/"))
        {
            endpoint = "/" + endpoint;
        }

        return $"{baseUrl}/s/{siteId}/dw/shop/{version}{endpoint}";
    }
}
