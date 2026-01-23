using System.Net;
using System.Text.Json;
using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Services.Json;

namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

public sealed partial class SfccShopService
{
    public async Task<BasketDto> CreateBasketAsync(string? currency = null, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            currency = string.IsNullOrWhiteSpace(currency) ? "EUR" : currency
        };

        var json = await _apiClient.PostAsync<JsonElement>("/baskets", payload, cancellationToken);
        if (json.ValueKind == JsonValueKind.Undefined)
        {
            throw new InvalidOperationException("SFCC returned an empty response for basket creation");
        }
        return MapBasket(json);
    }

    public async Task<BasketDto?> GetBasketAsync(string basketId, CancellationToken cancellationToken = default)
    {
        var basketJson = await GetBasketJsonOrNullAsync(basketId, cancellationToken);
        if (basketJson is null)
        {
            _logger.LogWarning("SFCC basket not found for id {BasketId}", basketId);
            return null;
        }

        return MapBasket(basketJson.Value);
    }

    public async Task<BasketDto?> AddItemToBasketAsync(string basketId, string productId, int quantity = 1, CancellationToken cancellationToken = default)
    {
        productId = productId?.Trim() ?? string.Empty;
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be > 0");

        var basketJson = await GetBasketJsonOrNullAsync(basketId, cancellationToken);
        if (basketJson is null) return null;

        var existing = FindBasketItemByProductId(basketJson.Value, productId);
        var desiredQuantity = existing is null ? quantity : existing.Value.Quantity + quantity;

        await ValidateInventoryAsync(productId, desiredQuantity, cancellationToken);

        var updated = default(JsonElement);
        if (existing is not null)
        {
            updated = await _apiClient.PatchAsync<JsonElement>($"/baskets/{basketId}/items/{existing.Value.ItemId}", new { quantity = desiredQuantity }, cancellationToken);
        }
        else
        {
            updated = await _apiClient.PostAsync<JsonElement>(
                $"/baskets/{basketId}/items",
                new[] { new { product_id = productId, quantity } },
                cancellationToken);
        }

        return updated.ValueKind == JsonValueKind.Undefined ? null : MapBasket(updated);
    }

    public async Task<BasketDto?> UpdateBasketItemQuantityAsync(string basketId, string itemId, int quantity, CancellationToken cancellationToken = default)
    {
        if (quantity < 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be >= 0");

        if (quantity == 0)
        {
            return await RemoveItemFromBasketAsync(basketId, itemId, cancellationToken);
        }

        var basketJson = await GetBasketJsonOrNullAsync(basketId, cancellationToken);
        if (basketJson is null) return null;

        var item = FindBasketItemByItemId(basketJson.Value, itemId);
        if (item is null)
        {
            _logger.LogWarning("Basket item not found. Basket {BasketId}, Item {ItemId}", basketId, itemId);
            return null;
        }

        await ValidateInventoryAsync(item.Value.ProductId?.Trim() ?? string.Empty, quantity, cancellationToken);

        var updated = await _apiClient.PatchAsync<JsonElement>($"/baskets/{basketId}/items/{itemId}", new { quantity }, cancellationToken);
        return updated.ValueKind == JsonValueKind.Undefined ? null : MapBasket(updated);
    }

    public async Task<BasketDto?> RemoveItemFromBasketAsync(string basketId, string itemId, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await _apiClient.DeleteAsync<JsonElement>($"/baskets/{basketId}/items/{itemId}", cancellationToken);
            return updated.ValueKind == JsonValueKind.Undefined ? null : MapBasket(updated);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            _logger.LogWarning("Basket or item not found. Basket {BasketId}, Item {ItemId}", basketId, itemId);
            return null;
        }
    }

    public Task ClearBasketAsync(string basketId, CancellationToken cancellationToken = default)
        => _apiClient.DeleteAsync($"/baskets/{basketId}", cancellationToken);

    private async Task<JsonElement?> GetBasketJsonOrNullAsync(string basketId, CancellationToken cancellationToken)
    {
        try
        {
            return await _apiClient.GetAsync<JsonElement>($"/baskets/{basketId}", cancellationToken);
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

        var available = await GetProductAvailableToSellAsync(productId, cancellationToken);
        if (available is null)
        {
            var product = await GetProductAsync(productId, cancellationToken);
            if (product is null)
            {
                throw new HttpRequestException("Product not found", null, HttpStatusCode.NotFound);
            }

            available = product.QuantityAvailable;

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
            var json = await _apiClient.GetAsync<JsonElement>($"/products/{Uri.EscapeDataString(productId)}/availability", cancellationToken);

            if (json.ValueKind == JsonValueKind.Object)
            {
                var ats = json.GetNestedIntOrDefault("inventory", "ats")
                       ?? json.GetNestedIntOrDefault("inventory", "available_to_sell")
                       ?? json.GetIntOrDefault("ats")
                       ?? json.GetIntOrDefault("available_to_sell");

                if (ats is not null) return ats;

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
            orderTotal);
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
