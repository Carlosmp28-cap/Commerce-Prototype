using CommercePrototype_Backend.Options;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using Microsoft.Extensions.Options;

namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

/// <summary>
/// SFCC Shop API client implementation.
/// </summary>
/// <remarks>
/// In SFCC Shop API, authentication is typically done via the <c>x-dw-client-id</c> header.
/// This client composes that requirement with the shared HTTP behavior in
/// <see cref="SfccApiClientBase"/>.
/// </remarks>
public sealed class SfccShopApiClient : SfccApiClientBase, ISfccShopApiClient
{
    private readonly IOptionsMonitor<SfccOptions> _sfccOptions;

    /// <summary>
    /// Initializes a new instance of the <see cref="SfccShopApiClient"/>.
    /// </summary>
    /// <param name="httpClient">HTTP client provided by <c>IHttpClientFactory</c>.</param>
    /// <param name="sfccOptions">Bound SFCC configuration.</param>
    /// <param name="logger">Logger for request diagnostics.</param>
    public SfccShopApiClient(
        HttpClient httpClient,
        IOptionsMonitor<SfccOptions> sfccOptions,
        ILogger<SfccShopApiClient> logger)
        : base(httpClient, logger)
    {
        _sfccOptions = sfccOptions;
    }

    /// <inheritdoc />
    protected override ValueTask ApplyRequestHeadersAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        // Shop API (public) access is typically via x-dw-client-id.
        var clientId = _sfccOptions.CurrentValue.ClientId;
        if (!string.IsNullOrWhiteSpace(clientId))
        {
            request.Headers.Remove("x-dw-client-id");
            request.Headers.Add("x-dw-client-id", clientId);
        }

        return ValueTask.CompletedTask;
    }

    /// <inheritdoc />
    protected override string BuildUrl(string endpoint)
    {
        var baseUrl = _sfccOptions.CurrentValue.ApiBaseUrl?.TrimEnd('/');
        var version = _sfccOptions.CurrentValue.ApiVersion ?? "v1";
        var siteId = _sfccOptions.CurrentValue.SiteId ?? "RefArch";

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            throw new InvalidOperationException("Missing configuration: Sfcc:ApiBaseUrl");
        }

        if (endpoint.StartsWith("http"))
        {
            return endpoint;
        }

        if (!endpoint.StartsWith("/"))
        {
            endpoint = "/" + endpoint;
        }

        return $"{baseUrl}/s/{siteId}/dw/shop/{version}{endpoint}";
    }
}
