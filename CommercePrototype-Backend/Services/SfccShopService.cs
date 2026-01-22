using System.Net;
using System.Text.Json;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services;

public interface ISfccShopService
{
    Task<CategoryNodeDto?> GetCategoryTreeAsync(string rootId = "root", int levels = 2, CancellationToken cancellationToken = default);
    Task<ProductSearchResultDto> SearchProductsAsync(string? query, string? categoryId, int limit = 12, int offset = 0, CancellationToken cancellationToken = default);
    Task<ProductDetailDto?> GetProductAsync(string productId, CancellationToken cancellationToken = default);

    Task<BasketDto> CreateBasketAsync(string? currency = null, CancellationToken cancellationToken = default);
    Task<BasketDto?> GetBasketAsync(string basketId, CancellationToken cancellationToken = default);
    Task<BasketDto?> AddItemToBasketAsync(string basketId, string productId, int quantity = 1, CancellationToken cancellationToken = default);
    Task<BasketDto?> UpdateBasketItemQuantityAsync(string basketId, string itemId, int quantity, CancellationToken cancellationToken = default);
    Task<BasketDto?> RemoveItemFromBasketAsync(string basketId, string itemId, CancellationToken cancellationToken = default);
    Task ClearBasketAsync(string basketId, CancellationToken cancellationToken = default);
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

    public async Task<BasketDto> CreateBasketAsync(string? currency = null, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            currency = string.IsNullOrWhiteSpace(currency) ? "EUR" : currency
        };

        var json = await _apiClient.PostAsync<JsonElement>("/baskets", payload);
        return MapBasket(json);
    }

    public async Task<BasketDto?> GetBasketAsync(string basketId, CancellationToken cancellationToken = default)
    {
        var path = $"/baskets/{basketId}";

        try
        {
            var json = await _apiClient.GetAsync<JsonElement>(path);
            return MapBasket(json);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning("SFCC basket not found for id {BasketId}", basketId);
            return null;
        }
    }

    public async Task<BasketDto?> AddItemToBasketAsync(string basketId, string productId, int quantity = 1, CancellationToken cancellationToken = default)
    {
        productId = productId?.Trim() ?? string.Empty;
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be > 0");

        var basketJson = await GetBasketJsonOrNullAsync(basketId);
        if (basketJson is null) return null;

        var existing = FindBasketItemByProductId(basketJson.Value, productId);
        var desiredQuantity = existing is null ? quantity : existing.Value.Quantity + quantity;

        await ValidateInventoryAsync(productId, desiredQuantity, cancellationToken);

        JsonElement updated;
        if (existing is not null)
        {
            updated = await _apiClient.PatchAsync<JsonElement>($"/baskets/{basketId}/items/{existing.Value.ItemId}", new { quantity = desiredQuantity });
        }
        else
        {
            // OCAPI expects an array payload for /baskets/{basketId}/items
            updated = await _apiClient.PostAsync<JsonElement>(
                $"/baskets/{basketId}/items",
                new[] { new { product_id = productId, quantity } });
        }

        return MapBasket(updated);
    }

    public async Task<BasketDto?> UpdateBasketItemQuantityAsync(string basketId, string itemId, int quantity, CancellationToken cancellationToken = default)
    {
        if (quantity < 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be >= 0");

        if (quantity == 0)
        {
            return await RemoveItemFromBasketAsync(basketId, itemId, cancellationToken);
        }

        var basketJson = await GetBasketJsonOrNullAsync(basketId);
        if (basketJson is null) return null;

        var item = FindBasketItemByItemId(basketJson.Value, itemId);
        if (item is null)
        {
            _logger.LogWarning("Basket item not found. Basket {BasketId}, Item {ItemId}", basketId, itemId);
            return null;
        }

        await ValidateInventoryAsync(item.Value.ProductId?.Trim() ?? string.Empty, quantity, cancellationToken);

        var updated = await _apiClient.PatchAsync<JsonElement>($"/baskets/{basketId}/items/{itemId}", new { quantity });
        return MapBasket(updated);
    }

    public async Task<BasketDto?> RemoveItemFromBasketAsync(string basketId, string itemId, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await _apiClient.DeleteAsync<JsonElement>($"/baskets/{basketId}/items/{itemId}");
            return updated.ValueKind == JsonValueKind.Undefined ? null : MapBasket(updated);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Basket or item not found. Basket {BasketId}, Item {ItemId}", basketId, itemId);
            return null;
        }
    }

    public async Task ClearBasketAsync(string basketId, CancellationToken cancellationToken = default)
    {
        await _apiClient.DeleteAsync($"/baskets/{basketId}");
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

    private async Task<JsonElement?> GetBasketJsonOrNullAsync(string basketId)
    {
        try
        {
            return await _apiClient.GetAsync<JsonElement>($"/baskets/{basketId}");
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    private async Task ValidateInventoryAsync(string productId, int desiredQuantity, CancellationToken cancellationToken)
    {
        productId = productId?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(productId))
        {
            throw new HttpRequestException("Product not found", null, HttpStatusCode.NotFound);
        }

        // Prefer the dedicated availability endpoint; /products/{id} often does NOT include inventory data.
        var available = await GetProductAvailableToSellAsync(productId, cancellationToken);
        if (available is null)
        {
            // Fallback to product detail inventory (best-effort).
            var product = await GetProductAsync(productId, cancellationToken);
            if (product is null)
            {
                throw new HttpRequestException("Product not found", null, HttpStatusCode.NotFound);
            }

            available = product.QuantityAvailable;

            // If inventory still isn't provided, don't block add-to-basket on a false 0.
            if (available <= 0)
            {
                _logger.LogWarning(
                    "Inventory not available for product {ProductId}. Allowing basket operation without stock validation.",
                    productId);
                return;
            }
        }

        if (available <= 0 || desiredQuantity > available.Value)
        {
            throw new OutOfStockException(productId, desiredQuantity, available.Value);
        }
    }

    private async Task<int?> GetProductAvailableToSellAsync(string productId, CancellationToken cancellationToken)
    {
        try
        {
            var json = await _apiClient.GetAsync<JsonElement>($"/products/{Uri.EscapeDataString(productId)}/availability");

            if (json.ValueKind == JsonValueKind.Object)
            {
                // Common shapes: { inventory: { ats: 3 } } or { inventory: { available_to_sell: 3 } }
                var ats = json.GetNestedIntOrDefault("inventory", "ats")
                       ?? json.GetNestedIntOrDefault("inventory", "available_to_sell")
                       ?? json.GetIntOrDefault("ats")
                       ?? json.GetIntOrDefault("available_to_sell");

                if (ats is not null) return ats;

                // Sometimes returned as an array of inventory records
                if (json.TryGetProperty("inventory_records", out var records) && records.ValueKind == JsonValueKind.Array)
                {
                    foreach (var record in records.EnumerateArray())
                    {
                        var recordAts = record.GetIntOrDefault("ats") ?? record.GetIntOrDefault("available_to_sell");
                        if (recordAts is not null) return recordAts;
                    }
                }
            }

            return null;
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.Forbidden)
        {
            _logger.LogWarning(
                "SFCC client is not allowed to call /products/{ProductId}/availability (403). Falling back to best-effort inventory validation.",
                productId);
            return null;
        }
    }

    private static BasketDto MapBasket(JsonElement node)
    {
        var basketId = node.GetPropertyOrDefault("basket_id")
                      ?? node.GetPropertyOrDefault("id")
                      ?? string.Empty;

        var currency = node.GetPropertyOrDefault("currency")
                     ?? node.GetPropertyOrDefault("currency_mnemonic")
                     ?? "";

        var items = new List<BasketItemDto>();
        if (node.TryGetProperty("product_items", out var productItemsNode) && productItemsNode.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in productItemsNode.EnumerateArray())
            {
                var mapped = MapBasketItem(item);
                if (mapped is not null) items.Add(mapped);
            }
        }

        var itemCount = node.GetIntOrDefault("product_items_count")
                     ?? node.GetIntOrDefault("item_count")
                     ?? items.Sum(i => i.Quantity);

        var productTotal = node.GetNestedDecimalOrDefault("product_total", "value")
                        ?? node.GetDecimalOrDefault("product_total");

        var shippingTotal = node.GetNestedDecimalOrDefault("shipping_total", "value")
                         ?? node.GetDecimalOrDefault("shipping_total");

        var taxTotal = node.GetNestedDecimalOrDefault("tax_total", "value")
                    ?? node.GetDecimalOrDefault("tax_total");

        var orderTotal = node.GetNestedDecimalOrDefault("order_total", "value")
                      ?? node.GetDecimalOrDefault("order_total");

        return new BasketDto(
            basketId,
            currency,
            items,
            itemCount,
            productTotal,
            shippingTotal,
            taxTotal,
            orderTotal
        );
    }

    private static BasketItemDto? MapBasketItem(JsonElement node)
    {
        var itemId = node.GetPropertyOrDefault("item_id") ?? node.GetPropertyOrDefault("id");
        var productId = node.GetPropertyOrDefault("product_id")?.Trim();
        if (string.IsNullOrWhiteSpace(itemId) || string.IsNullOrWhiteSpace(productId)) return null;

        var productName = node.GetPropertyOrDefault("product_name") ?? node.GetPropertyOrDefault("item_text");
        var quantity = node.GetIntOrDefault("quantity") ?? 0;

        var price = node.GetNestedDecimalOrDefault("price", "value")
                 ?? node.GetDecimalOrDefault("price");

        var basePrice = node.GetNestedDecimalOrDefault("base_price", "value")
                     ?? node.GetDecimalOrDefault("base_price");

        var imageUrl = node.GetNestedStringOrDefault("image", "link")
                    ?? node.GetNestedStringOrDefault("c_image", "link");

        return new BasketItemDto(itemId, productId, productName, quantity, price, basePrice, imageUrl);
    }

    private static (string ItemId, string ProductId, int Quantity)? FindBasketItemByProductId(JsonElement basket, string productId)
    {
        productId = productId?.Trim() ?? string.Empty;
        if (basket.TryGetProperty("product_items", out var productItemsNode) && productItemsNode.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in productItemsNode.EnumerateArray())
            {
                var pid = item.GetPropertyOrDefault("product_id")?.Trim();
                if (!string.Equals(pid, productId, StringComparison.OrdinalIgnoreCase)) continue;

                var itemId = item.GetPropertyOrDefault("item_id") ?? item.GetPropertyOrDefault("id") ?? "";
                var qty = item.GetIntOrDefault("quantity") ?? 0;
                if (!string.IsNullOrWhiteSpace(itemId)) return (itemId, productId, qty);
            }
        }
        return null;
    }

    private static (string ItemId, string ProductId, int Quantity)? FindBasketItemByItemId(JsonElement basket, string itemId)
    {
        if (basket.TryGetProperty("product_items", out var productItemsNode) && productItemsNode.ValueKind == JsonValueKind.Array)
        {
            foreach (var item in productItemsNode.EnumerateArray())
            {
                var iid = item.GetPropertyOrDefault("item_id") ?? item.GetPropertyOrDefault("id");
                if (!string.Equals(iid, itemId, StringComparison.OrdinalIgnoreCase)) continue;

                var pid = item.GetPropertyOrDefault("product_id") ?? "";
                var qty = item.GetIntOrDefault("quantity") ?? 0;
                if (!string.IsNullOrWhiteSpace(iid) && !string.IsNullOrWhiteSpace(pid)) return (iid, pid, qty);
            }
        }
        return null;
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
