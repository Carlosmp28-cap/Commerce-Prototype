using System.Net;
using System.Text.Json;
using CommercePrototype_Backend.Models.Basket;
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

        var basket = MapBasket(basketJson.Value);
        return await EnrichBasketAsync(basket, cancellationToken);
    }

    public async Task<BasketDto?> AddItemToBasketAsync(string basketId, string productId, int quantity = 1, CancellationToken cancellationToken = default)
    {
        productId = productId?.Trim() ?? string.Empty;
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity), "Quantity must be > 0");

        // SFCC does not allow adding master products to a basket. If we receive a master id,
        // try to resolve a concrete (orderable) variant id.
        var orderableProductId = await ResolveOrderableProductIdAsync(productId, cancellationToken);

        var basketJson = await GetBasketJsonOrNullAsync(basketId, cancellationToken);
        if (basketJson is null) return null;

        var existing = FindBasketItemByProductId(basketJson.Value, orderableProductId);
        var desiredQuantity = existing is null ? quantity : existing.Value.Quantity + quantity;

        await ValidateInventoryAsync(orderableProductId, desiredQuantity, cancellationToken);

        var updated = default(JsonElement);
        if (existing is not null)
        {
            updated = await _apiClient.PatchAsync<JsonElement>($"/baskets/{basketId}/items/{existing.Value.ItemId}", new { quantity = desiredQuantity }, cancellationToken);
        }
        else
        {
            updated = await _apiClient.PostAsync<JsonElement>(
                $"/baskets/{basketId}/items",
                new[] { new { product_id = orderableProductId, quantity } },
                cancellationToken);
        }

        if (updated.ValueKind == JsonValueKind.Undefined) return null;
        var mapped = MapBasket(updated);
        return await EnrichBasketAsync(mapped, cancellationToken);
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
        if (updated.ValueKind == JsonValueKind.Undefined) return null;
        var mapped = MapBasket(updated);
        return await EnrichBasketAsync(mapped, cancellationToken);
    }

    public async Task<BasketDto?> RemoveItemFromBasketAsync(string basketId, string itemId, CancellationToken cancellationToken = default)
    {
        try
        {
            var updated = await _apiClient.DeleteAsync<JsonElement>($"/baskets/{basketId}/items/{itemId}", cancellationToken);
            if (updated.ValueKind == JsonValueKind.Undefined) return null;
            var mapped = MapBasket(updated);
            return await EnrichBasketAsync(mapped, cancellationToken);
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

    private async Task<string> ResolveOrderableProductIdAsync(string productId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(productId)) return productId;

        // Heuristic: variants are directly orderable; masters are not.
        // Use expand=variations so we can see variant ids.
        try
        {
            var json = await _apiClient.GetAsync<JsonElement>($"/products/{Uri.EscapeDataString(productId)}?expand=variations", cancellationToken);

            var type = json.GetPropertyOrDefault("type") ?? json.GetPropertyOrDefault("product_type");
            var isMaster = string.Equals(type, "master", StringComparison.OrdinalIgnoreCase);

            if (!isMaster)
            {
                // Some SFCC responses may omit type; assume it's already orderable.
                return productId;
            }

            if (json.TryGetProperty("variants", out var variants) && variants.ValueKind == JsonValueKind.Array)
            {
                var allIds = new List<string>();
                var orderableIds = new List<string>();
                foreach (var v in variants.EnumerateArray())
                {
                    if (v.ValueKind != JsonValueKind.Object) continue;

                    var id = v.GetPropertyOrDefault("product_id") ?? v.GetPropertyOrDefault("id");
                    if (string.IsNullOrWhiteSpace(id)) continue;

                    allIds.Add(id);

                    // Prefer orderable variants when the flag exists.
                    if (v.TryGetProperty("orderable", out var orderableNode) && orderableNode.ValueKind == JsonValueKind.True)
                    {
                        orderableIds.Add(id);
                    }
                }

                // Hybrid rule:
                // - If there's exactly 1 orderable variant, auto-select it.
                // - If there are variants but multiple orderable (or unknown), force selection.
                if (orderableIds.Count == 1) return orderableIds[0];

                if (allIds.Count == 1) return allIds[0];

                if (allIds.Count > 1)
                {
                    throw new VariantSelectionRequiredException(productId, allIds);
                }
            }

            return productId;
        }
        catch (HttpRequestException)
        {
            // If we can't resolve, fall back to original id.
            return productId;
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

    private BasketDto MapBasket(JsonElement node)
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

    private BasketItemDto? MapBasketItem(JsonElement node)
    {
        var itemId = node.GetPropertyOrDefault("item_id") ?? node.GetPropertyOrDefault("id");
        var productId = node.GetPropertyOrDefault("product_id")?.Trim();
        if (string.IsNullOrWhiteSpace(itemId) || string.IsNullOrWhiteSpace(productId)) return null;

        var productName = node.GetPropertyOrDefault("product_name") ?? node.GetPropertyOrDefault("item_text");
        var quantity = node.GetIntOrDefault("quantity") ?? 0;

        var price = node.GetNestedDecimalOrDefault("price", "value")
             ?? node.GetDecimalOrDefault("price")
             ?? node.GetNestedDecimalOrDefault("price_after_item_discount", "value")
             ?? node.GetDecimalOrDefault("price_after_item_discount")
             ?? node.GetNestedDecimalOrDefault("price_adjusted", "value")
             ?? node.GetDecimalOrDefault("price_adjusted")
             ?? node.GetNestedDecimalOrDefault("unit_price", "value")
             ?? node.GetDecimalOrDefault("unit_price")
             ?? node.GetNestedDecimalOrDefault("tax_basis", "value")
             ?? node.GetDecimalOrDefault("tax_basis");

        var basePrice = node.GetNestedDecimalOrDefault("base_price", "value")
                 ?? node.GetDecimalOrDefault("base_price")
                 ?? node.GetNestedDecimalOrDefault("unit_price", "value")
                 ?? node.GetDecimalOrDefault("unit_price");

        var imageUrl = ExtractAndNormalizeImageUrl(node);

        return new BasketItemDto(itemId, productId, productName, quantity, price, basePrice, imageUrl);
    }

    private async Task<BasketDto> EnrichBasketAsync(BasketDto basket, CancellationToken cancellationToken)
    {
        // Some SFCC configurations omit/zero out per-item prices in basket payloads for certain categories.
        // To keep the frontend consistent, fill missing/zero prices (and missing images) using product detail.
        var changed = false;
        var items = basket.Items.ToList();

        for (var i = 0; i < items.Count; i++)
        {
            var item = items[i];
            var hasPrice = (item.Price ?? 0m) > 0m || (item.BasePrice ?? 0m) > 0m;
            var hasImage = !string.IsNullOrWhiteSpace(item.ImageUrl);

            if (hasPrice && hasImage) continue;

            try
            {
                var product = await GetProductAsync(item.ProductId, cancellationToken);
                if (product is null) continue;

                var newPrice = hasPrice ? item.Price : (product.Price > 0m ? product.Price : item.Price);
                var newBasePrice = hasPrice ? item.BasePrice : (product.Price > 0m ? product.Price : item.BasePrice);
                var newImage = hasImage ? item.ImageUrl : product.ImageUrl;

                var updated = item with { Price = newPrice, BasePrice = newBasePrice, ImageUrl = newImage };

                if (!Equals(updated, item))
                {
                    items[i] = updated;
                    changed = true;
                }
            }
            catch
            {
                // Best-effort: don't fail basket calls if enrichment can't be done.
            }
        }

        return changed ? basket with { Items = items } : basket;
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
