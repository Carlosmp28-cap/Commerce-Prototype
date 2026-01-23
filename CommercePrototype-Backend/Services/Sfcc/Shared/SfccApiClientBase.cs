using System.Net.Http.Headers;
using System.Text.Json;

namespace CommercePrototype_Backend.Services.Sfcc.Shared;

/// <summary>
/// Shared, low-level SFCC HTTP client functionality.
///
/// Best-practices applied:
/// - Uses HttpClientFactory (typed clients in DI)
/// - Streams responses (ResponseHeadersRead + DeserializeAsync)
/// - Propagates CancellationToken end-to-end
/// - Uses structured logging
///
/// API-specific concerns (base URL/path, auth/headers) are handled in derived classes.
/// </summary>
public abstract class SfccApiClientBase
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    private readonly HttpClient _httpClient;
    private readonly ILogger _logger;

    /// <summary>
    /// Initializes a new SFCC API client base.
    /// </summary>
    /// <param name="httpClient">HTTP client provided by <c>IHttpClientFactory</c>.</param>
    /// <param name="logger">Logger used for structured request/response diagnostics.</param>
    protected SfccApiClientBase(HttpClient httpClient, ILogger logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    /// <summary>
    /// Builds an absolute URL for a given API-specific endpoint.
    /// </summary>
    protected abstract string BuildUrl(string endpoint);

    /// <summary>
    /// Allows derived clients to apply headers (for example, auth/client-id) before sending a request.
    /// </summary>
    protected virtual ValueTask ApplyRequestHeadersAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        => ValueTask.CompletedTask;

    /// <summary>
    /// Sends an HTTP GET request.
    /// </summary>
    public Task<T?> GetAsync<T>(string endpoint, CancellationToken cancellationToken = default)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, BuildUrl(endpoint));
        return SendAsync<T>(request, cancellationToken);
    }

    /// <summary>
    /// Sends an HTTP POST request with an optional JSON payload.
    /// </summary>
    public Task<T?> PostAsync<T>(string endpoint, object? payload = null, CancellationToken cancellationToken = default)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, BuildUrl(endpoint));
        if (payload != null)
        {
            request.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json");
        }

        return SendAsync<T>(request, cancellationToken);
    }

    /// <summary>
    /// Sends an HTTP PUT request with an optional JSON payload.
    /// </summary>
    public Task<T?> PutAsync<T>(string endpoint, object? payload = null, CancellationToken cancellationToken = default)
    {
        var request = new HttpRequestMessage(HttpMethod.Put, BuildUrl(endpoint));
        if (payload != null)
        {
            request.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json");
        }

        return SendAsync<T>(request, cancellationToken);
    }

    /// <summary>
    /// Sends an HTTP PATCH request with an optional JSON payload.
    /// </summary>
    public Task<T?> PatchAsync<T>(string endpoint, object? payload = null, CancellationToken cancellationToken = default)
    {
        var request = new HttpRequestMessage(HttpMethod.Patch, BuildUrl(endpoint));
        if (payload != null)
        {
            request.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                System.Text.Encoding.UTF8,
                "application/json");
        }

        return SendAsync<T>(request, cancellationToken);
    }

    /// <summary>
    /// Sends an HTTP DELETE request and deserializes the JSON response (when present).
    /// </summary>
    public Task<T?> DeleteAsync<T>(string endpoint, CancellationToken cancellationToken = default)
    {
        var request = new HttpRequestMessage(HttpMethod.Delete, BuildUrl(endpoint));
        return SendAsync<T>(request, cancellationToken);
    }

    /// <summary>
    /// Sends an HTTP DELETE request.
    /// </summary>
    public async Task DeleteAsync(string endpoint, CancellationToken cancellationToken = default)
    {
        await DeleteAsync<object>(endpoint, cancellationToken);
    }

    private async Task<T?> SendAsync<T>(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        try
        {
            await ApplyRequestHeadersAsync(request, cancellationToken);

            if (!request.Headers.Accept.Any())
            {
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            }

            if (request.Content != null && request.Content.Headers.ContentType == null)
            {
                request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            }

            using var response = await _httpClient.SendAsync(
                request,
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogError(
                    "SFCC API call failed: {Method} {Url} - {StatusCode} - {Body}",
                    request.Method,
                    request.RequestUri,
                    (int)response.StatusCode,
                    error);

                throw new HttpRequestException(
                    $"SFCC API request failed: {response.StatusCode}",
                    null,
                    response.StatusCode);
            }

            // Some SFCC endpoints return 204 No Content (especially DELETE). In that case there is no JSON to parse.
            if (response.StatusCode == System.Net.HttpStatusCode.NoContent)
            {
                return default;
            }

            var contentLength = response.Content.Headers.ContentLength;
            if (contentLength is 0)
            {
                return default;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            if (stream is null) return default;

            // Some servers omit Content-Length but still return an empty body.
            if (stream.CanSeek && stream.Length == 0)
            {
                return default;
            }

            return await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling SFCC API: {Method} {Url}", request.Method, request.RequestUri);
            throw;
        }
    }
}
