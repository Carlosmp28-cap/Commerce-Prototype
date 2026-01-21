using System.Net.Http.Headers;
using System.Text.Json.Serialization;
using System.Linq;

namespace CommercePrototype_Backend.Services;

public interface ISfccApiClient
{
    Task<T?> GetAsync<T>(string endpoint);
    Task<T?> PostAsync<T>(string endpoint, object? payload = null);
    Task<T?> PutAsync<T>(string endpoint, object? payload = null);
    Task DeleteAsync(string endpoint);
}

public class SfccApiClient : ISfccApiClient
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SfccApiClient> _logger;

    public SfccApiClient(HttpClient httpClient, ISfccAuthService authService, IConfiguration configuration, ILogger<SfccApiClient> logger)
    {
        _httpClient = httpClient;
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
        var request = new HttpRequestMessage(HttpMethod.Delete, BuildUrl(endpoint));
        await SendAsync<object>(request);
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
                throw new HttpRequestException($"SFCC API request failed: {response.StatusCode}", null, response.StatusCode);
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
