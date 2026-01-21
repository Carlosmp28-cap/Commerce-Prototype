using System.Net;
using System.Text.Json;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services;

public interface ISfccShopService
{
    Task<CategoryNodeDto?> GetCategoryTreeAsync(string rootId = "root", int levels = 2, CancellationToken cancellationToken = default);
    Task<ProductSearchResultDto> SearchProductsAsync(string? query, string? categoryId, int limit = 12, int offset = 0, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetProductAsync(string productId, CancellationToken cancellationToken = default);
}

public sealed class SfccShopService : ISfccShopService
{
    private readonly ISfccApiClient _apiClient;
    private readonly ILogger<SfccShopService> _logger;

    public SfccShopService(ISfccApiClient apiClient, ILogger<SfccShopService> logger)
    {
        _apiClient = apiClient;
        _logger = logger;
    }

    public async Task<CategoryNodeDto?> GetCategoryTreeAsync(string rootId = "root", int levels = 2, CancellationToken cancellationToken = default)
    {
        var path = $"/categories/{rootId}?levels={levels}";

        try
        {
            var json = await _apiClient.GetAsync<JsonElement>(path);
            return MapCategory(json, null);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning("SFCC category not found for root {RootId}", rootId);
            return null;
        }
    }

    public async Task<ProductSearchResultDto> SearchProductsAsync(string? query, string? categoryId, int limit = 12, int offset = 0, CancellationToken cancellationToken = default)
    {
        var path = $"/product_search?limit={limit}&start={offset}";

        if (!string.IsNullOrWhiteSpace(query))
        {
            path += $"&q={Uri.EscapeDataString(query)}";
        }

        if (!string.IsNullOrWhiteSpace(categoryId))
        {
            path += $"&refine_1=cgid={Uri.EscapeDataString(categoryId)}";
        }

        var json = await _apiClient.GetAsync<JsonElement>(path);

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

    public async Task<ProductDetailDto?> GetProductAsync(string productId, CancellationToken cancellationToken = default)
    {
        var path = $"/products/{productId}";

        try
        {
            var json = await _apiClient.GetAsync<JsonElement>(path);
            return MapProductDetail(json);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning("SFCC product not found for id {ProductId}", productId);
            return null;
        }
    }

    private static CategoryNodeDto MapCategory(JsonElement node, string? parentId)
    {
        var id = node.GetPropertyOrDefault("id") ?? "";
        var name = node.GetPropertyOrDefault("name") ?? node.GetPropertyOrDefault("display_name") ?? id;

        var children = new List<CategoryNodeDto>();
        if (node.TryGetProperty("categories", out var childrenNode) && childrenNode.ValueKind == JsonValueKind.Array)
        {
            foreach (var child in childrenNode.EnumerateArray())
            {
                children.Add(MapCategory(child, id));
            }
        }

        return new CategoryNodeDto(id, name, parentId, children);
    }

    private static ProductSummaryDto? MapProductSummary(JsonElement node)
    {
        var id = node.GetPropertyOrDefault("product_id") ?? node.GetPropertyOrDefault("id");
        if (string.IsNullOrWhiteSpace(id)) return null;

        var name = node.GetPropertyOrDefault("product_name") ?? node.GetPropertyOrDefault("name") ?? id;
        var categoryId = node.GetPropertyOrDefault("primary_category_id");
        var price = node.GetDecimalOrDefault("price")
                    ?? node.GetNestedDecimalOrDefault("price", "value")
                    ?? 0m;
        var image = node.GetNestedStringOrDefault("image", "link")
                 ?? node.GetNestedStringOrDefault("c_image", "link")
                 ?? node.GetPropertyOrDefault("image");
        var rating = node.GetDecimalOrDefault("c_average_rating");
        var reviewCount = node.GetIntOrDefault("c_review_count");

        return new ProductSummaryDto(id, name, price, categoryId, image, rating, reviewCount);
    }

    private static ProductDetailDto? MapProductDetail(JsonElement node)
    {
        var id = node.GetPropertyOrDefault("id") ?? node.GetPropertyOrDefault("product_id");
        if (string.IsNullOrWhiteSpace(id)) return null;

        var name = node.GetPropertyOrDefault("name") ?? node.GetPropertyOrDefault("product_name") ?? id;
        var categoryId = node.GetPropertyOrDefault("primary_category_id");
        var price = node.GetNestedDecimalOrDefault("price", "value")
                    ?? node.GetDecimalOrDefault("price")
                    ?? 0m;
        var description = node.GetPropertyOrDefault("long_description") ?? node.GetPropertyOrDefault("short_description");

        var quantityAvailable = node.GetNestedIntOrDefault("inventory", "ats")
                               ?? node.GetNestedIntOrDefault("inventory", "available_to_sell")
                               ?? 0;

        var mainImage = node.GetNestedStringOrDefault("image", "link")
                    ?? node.GetNestedStringOrDefault("c_image", "link");

        var gallery = new List<string>();
        if (node.TryGetProperty("images", out var imagesNode) && imagesNode.ValueKind == JsonValueKind.Object)
        {
            if (imagesNode.TryGetProperty("large", out var largeArray) && largeArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var image in largeArray.EnumerateArray())
                {
                    var link = image.GetPropertyOrDefault("link");
                    if (!string.IsNullOrWhiteSpace(link)) gallery.Add(link);
                }
            }
        }

        var rating = node.GetDecimalOrDefault("c_average_rating");
        var reviewCount = node.GetIntOrDefault("c_review_count");

        var features = new List<string>();
        if (node.TryGetProperty("c_features", out var featuresNode) && featuresNode.ValueKind == JsonValueKind.Array)
        {
            foreach (var feature in featuresNode.EnumerateArray())
            {
                if (feature.ValueKind == JsonValueKind.String)
                {
                    features.Add(feature.GetString() ?? string.Empty);
                }
            }
        }

        var shippingType = node.GetNestedStringOrDefault("c_shipping", "type") ?? node.GetPropertyOrDefault("shipping_type");
        var shippingEstimate = node.GetNestedStringOrDefault("c_shipping", "estimatedDays") ?? node.GetPropertyOrDefault("shipping_estimate");

        return new ProductDetailDto(
            id,
            name,
            price,
            categoryId,
            quantityAvailable,
            description,
            mainImage,
            gallery,
            rating,
            reviewCount,
            features,
            shippingType,
            shippingEstimate
        );
    }
}

internal static class JsonExtensions
{
    public static string? GetPropertyOrDefault(this JsonElement element, string propertyName)
    {
        if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(propertyName, out var value))
        {
            if (value.ValueKind == JsonValueKind.String) return value.GetString();
            if (value.ValueKind == JsonValueKind.Number) return value.ToString();
        }
        return null;
    }

    public static string? GetNestedStringOrDefault(this JsonElement element, string parentProperty, string childProperty)
    {
        if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(parentProperty, out var parent))
        {
            if (parent.ValueKind == JsonValueKind.Object && parent.TryGetProperty(childProperty, out var child))
            {
                if (child.ValueKind == JsonValueKind.String) return child.GetString();
            }
        }
        return null;
    }

    public static decimal? GetDecimalOrDefault(this JsonElement element, string propertyName)
    {
        if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(propertyName, out var value) && value.ValueKind == JsonValueKind.Number)
        {
            return value.GetDecimal();
        }
        return null;
    }

    public static decimal? GetNestedDecimalOrDefault(this JsonElement element, string parentProperty, string childProperty)
    {
        if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(parentProperty, out var parent))
        {
            if (parent.ValueKind == JsonValueKind.Object && parent.TryGetProperty(childProperty, out var child) && child.ValueKind == JsonValueKind.Number)
            {
                return child.GetDecimal();
            }
        }
        return null;
    }

    public static int? GetIntOrDefault(this JsonElement element, string propertyName)
    {
        if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(propertyName, out var value) && value.ValueKind == JsonValueKind.Number)
        {
            return value.GetInt32();
        }
        return null;
    }

    public static int? GetNestedIntOrDefault(this JsonElement element, string parentProperty, string childProperty)
    {
        if (element.ValueKind == JsonValueKind.Object && element.TryGetProperty(parentProperty, out var parent))
        {
            if (parent.ValueKind == JsonValueKind.Object && parent.TryGetProperty(childProperty, out var child) && child.ValueKind == JsonValueKind.Number)
            {
                return child.GetInt32();
            }
        }
        return null;
    }
}
