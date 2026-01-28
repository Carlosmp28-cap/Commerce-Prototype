using System.Net;
using System.Text.Json;
using CommercePrototype_Backend.Models.Categories;
using CommercePrototype_Backend.Models.Products;
using CommercePrototype_Backend.Options;
using CommercePrototype_Backend.Services.Json;
using CommercePrototype_Backend.Services.Sfcc.DataApi;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

/// <summary>
/// Orchestrates SFCC Shop API calls and maps SFCC JSON into API DTOs.
/// </summary>
/// <remarks>
/// This service keeps controllers thin by centralizing:
/// - SFCC endpoint selection and query parameters
/// - Mapping from SFCC response shapes into <c>Models.*</c> DTOs
/// - Resiliency decisions like paging limits and best-effort fallbacks
/// </remarks>
public sealed partial class SfccShopService : ISfccShopService
{
    private readonly ISfccShopApiClient _apiClient;
    private readonly ILogger<SfccShopService> _logger;
    private readonly IMemoryCache _cache;
    private readonly IOptionsMonitor<SfccOptions> _sfccOptions;
    private readonly ISfccAuthService _authService;
    private readonly SfccRequestContext _requestContext;
    private readonly ISfccDataApiClient _dataApiClient;

    /// <summary>
    /// Initializes a new instance of the <see cref="SfccShopService"/>.
    /// </summary>
    /// <param name="apiClient">Low-level Shop API client.</param>
    /// <param name="dataApiClient">Low-level Data API client (used for datasets not available in Shop API).</param>
    /// <param name="authService">Auth service used to create/refresh shopper sessions when needed.</param>
    /// <param name="requestContext">Per-request context used to apply shopper/client authentication.</param>
    /// <param name="cache">In-memory cache used for small, frequently-read datasets.</param>
    /// <param name="sfccOptions">Bound SFCC configuration.</param>
    /// <param name="logger">Logger for operational diagnostics.</param>
    public SfccShopService(
        ISfccShopApiClient apiClient,
        ISfccDataApiClient dataApiClient,
        ISfccAuthService authService,
        SfccRequestContext requestContext,
        IMemoryCache cache,
        IOptionsMonitor<SfccOptions> sfccOptions,
        ILogger<SfccShopService> logger)
    {
        _apiClient = apiClient;
        _dataApiClient = dataApiClient;
        _authService = authService;
        _requestContext = requestContext;
        _cache = cache;
        _sfccOptions = sfccOptions;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<CategoryNodeDto?> GetCategoryTreeAsync(string rootId = "root", int levels = 2, CancellationToken cancellationToken = default)
    {
        try
        {
            // Categories are typically fairly static; cache to reduce repeated network I/O.
            // NOTE: This is a deliberately simple in-memory caching strategy for the prototype.
            // There is a dedicated user story planned to revisit caching (strategy, invalidation,
            // possible distributed cache, and/or output caching). When that work happens, update
            // the cache keying/expiration and consider ETags or SFCC-side cache headers.
            var cacheKey = $"sfcc:categories:{rootId}:{levels}";

            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);

                var path = $"/categories/{rootId}?levels={levels}";
                var json = await _apiClient.GetAsync<JsonElement>(path, cancellationToken);
                return MapCategory(json, null);
            });
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning("SFCC category not found for root {RootId}", rootId);
            return null;
        }
    }

    /// <inheritdoc />
    public async Task<ProductSearchResultDto> SearchProductsAsync(string categoryId, string? query = null, int limit = 50, int offset = 0, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(categoryId))
        {
            throw new ArgumentException("CategoryId is required for product search in SFCC", nameof(categoryId));
        }

        // `expand` ensures the search results include images/prices.
        // Without it, SFCC often returns only ids/names/links (leading to null imageUrl on the frontend).
        var path = $"/product_search?limit={limit}&start={offset}&expand=images,prices";
        path += $"&refine_1=cgid={Uri.EscapeDataString(categoryId)}";

        if (!string.IsNullOrWhiteSpace(query))
        {
            path += $"&q={Uri.EscapeDataString(query)}";
        }

        var json = await _apiClient.GetAsync<JsonElement>(path, cancellationToken);

        var hits = json.TryGetProperty("hits", out var hitsNode) && hitsNode.ValueKind == JsonValueKind.Array
            ? hitsNode.EnumerateArray().ToList()
            : new List<JsonElement>();

        var items = hits
            .Select(MapProductSummary)
            .Where(item => item is not null)
            .Select(item => item!)
            .ToList();

        var total = json.TryGetProperty("total", out var totalNode) && totalNode.ValueKind == JsonValueKind.Number
            ? totalNode.GetInt32()
            : items.Count;

        var count = json.TryGetProperty("count", out var countNode) && countNode.ValueKind == JsonValueKind.Number
            ? countNode.GetInt32()
            : items.Count;

        var start = json.TryGetProperty("start", out var startNode) && startNode.ValueKind == JsonValueKind.Number
            ? startNode.GetInt32()
            : offset;

        return new ProductSearchResultDto(items, total, count, start);
    }

    /// <inheritdoc />
    public async Task<ProductDetailDto?> GetProductAsync(string productId, CancellationToken cancellationToken = default)
    {
        // `expand` is required to reliably get `image_groups` (and therefore gallery/main image).
        // Include variations so the PDP can resolve and select orderable variants.
        var path = $"/products/{productId}?expand=images,prices,availability,variations";

        try
        {
            var json = await _apiClient.GetAsync<JsonElement>(path, cancellationToken);
            var mapped = MapProductDetail(json);
            if (mapped is null) return null;

            // Some SFCC setups return only a single `image` for variants, while the full gallery is stored
            // on the master product. If the gallery is empty and we can resolve a master id, fall back.
            if ((mapped.Gallery is null || mapped.Gallery.Count == 0) && TryGetMasterProductId(json, out var masterId))
            {
                try
                {
                    var masterJson = await _apiClient.GetAsync<JsonElement>($"/products/{masterId}?expand=images,prices,availability", cancellationToken);
                    var masterMain = ExtractAndNormalizeImageUrl(masterJson);
                    var masterGallery = BuildNormalizedDistinctGallery(masterJson, masterMain);

                    if (masterGallery.Count > 0 || (!string.IsNullOrWhiteSpace(masterMain) && string.IsNullOrWhiteSpace(mapped.ImageUrl)))
                    {
                        mapped = mapped with
                        {
                            ImageUrl = string.IsNullOrWhiteSpace(mapped.ImageUrl) ? masterMain : mapped.ImageUrl,
                            Gallery = masterGallery.Count > 0 ? masterGallery : mapped.Gallery,
                        };
                    }
                }
                catch (HttpRequestException ex)
                {
                    _logger.LogDebug(ex, "SFCC master product fallback failed for {ProductId} -> {MasterId}", productId, masterId);
                }
            }

            return mapped;
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning("SFCC product not found for id {ProductId}", productId);
            return null;
        }
    }

    private static bool TryGetMasterProductId(JsonElement node, out string masterProductId)
    {
        masterProductId = string.Empty;

        // Some responses expose a flat string property.
        var direct = node.GetPropertyOrDefault("master_id") ?? node.GetPropertyOrDefault("masterId");
        if (!string.IsNullOrWhiteSpace(direct))
        {
            masterProductId = direct;
            return true;
        }

        // Common shape: { "master": { "product_id": "..." } }
        if (node.ValueKind == JsonValueKind.Object && node.TryGetProperty("master", out var masterNode))
        {
            if (masterNode.ValueKind == JsonValueKind.String)
            {
                var s = masterNode.GetString();
                if (!string.IsNullOrWhiteSpace(s))
                {
                    masterProductId = s;
                    return true;
                }
            }

            if (masterNode.ValueKind == JsonValueKind.Object)
            {
                var nested = masterNode.GetPropertyOrDefault("product_id") ?? masterNode.GetPropertyOrDefault("id");
                if (!string.IsNullOrWhiteSpace(nested))
                {
                    masterProductId = nested;
                    return true;
                }
            }
        }

        return false;
    }
}
