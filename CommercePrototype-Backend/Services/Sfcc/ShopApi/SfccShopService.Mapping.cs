using System.Text.Json;
using CommercePrototype_Backend.Models.Categories;
using CommercePrototype_Backend.Models.Products;
using CommercePrototype_Backend.Services.Json;

namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

public sealed partial class SfccShopService
{
    // Mapping notes:
    // - SFCC Shop API payloads vary by configuration and installed cartridges.
    // - This mapping layer is intentionally defensive (null checks and defaults)
    //   to keep the API contract stable for the frontend.

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

    private ProductSummaryDto? MapProductSummary(JsonElement node)
    {
        // Search hits commonly use `product_id` and `product_name`.
        // Some setups return `id`/`name` instead; support both.
        var id = node.GetPropertyOrDefault("product_id") ?? node.GetPropertyOrDefault("id");
        if (string.IsNullOrWhiteSpace(id)) return null;

        var name = node.GetPropertyOrDefault("product_name") ?? node.GetPropertyOrDefault("name") ?? id;
        var categoryId = node.GetPropertyOrDefault("primary_category_id");
        var price = node.GetNestedDecimalOrDefault("price", "value")
                    ?? node.GetDecimalOrDefault("price")
                    ?? node.GetNestedDecimalOrDefault("price_min", "value")
                    ?? node.GetDecimalOrDefault("price_min")
                    ?? node.GetNestedDecimalOrDefault("price_max", "value")
                    ?? node.GetDecimalOrDefault("price_max")
                    ?? 0m;

        var image = ExtractAndNormalizeImageUrl(node);
        var rating = node.GetDecimalOrDefault("c_average_rating");
        var reviewCount = node.GetIntOrDefault("c_review_count");

        return new ProductSummaryDto(id, name, price, categoryId, image, rating, reviewCount);
    }

    private ProductDetailDto? MapProductDetail(JsonElement node)
    {
        // Product detail responses can use either `id` or `product_id`.
        var id = node.GetPropertyOrDefault("id") ?? node.GetPropertyOrDefault("product_id");
        if (string.IsNullOrWhiteSpace(id)) return null;

        var name = node.GetPropertyOrDefault("name") ?? node.GetPropertyOrDefault("product_name") ?? id;
        var categoryId = node.GetPropertyOrDefault("primary_category_id");
        var price = node.GetNestedDecimalOrDefault("price", "value")
                    ?? node.GetDecimalOrDefault("price")
                    ?? 0m;
        var description = node.GetPropertyOrDefault("long_description") ?? node.GetPropertyOrDefault("short_description");

        // Inventory shapes differ per SFCC configuration; keep a safe default (0).
        var quantityAvailable = node.GetNestedIntOrDefault("inventory", "ats")
                               ?? node.GetNestedIntOrDefault("inventory", "available_to_sell")
                               ?? 0;

        var mainImage = ExtractAndNormalizeImageUrl(node);
        var gallery = BuildNormalizedDistinctGallery(node, mainImage);

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
