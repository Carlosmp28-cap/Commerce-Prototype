using System.Text.Json;
using CommercePrototype_Backend.Services.Json;

namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

public sealed partial class SfccShopService
{
    // Image handling notes:
    // - SFCC may return protocol-relative links, http links, or relative paths.
    // - iOS/ATS may block cleartext images, so we normalize to https where possible.
    // - The gallery intentionally prefers a single best-resolution set to avoid duplicates.

    private List<string> BuildNormalizedDistinctGallery(JsonElement node, string? mainImage)
    {
        var gallery = new List<string>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (!string.IsNullOrWhiteSpace(mainImage))
        {
            seen.Add(mainImage);
        }

        foreach (var url in ExtractGalleryUrls(node))
        {
            var normalized = NormalizeImageUrl(url);
            if (string.IsNullOrWhiteSpace(normalized)) continue;
            if (seen.Add(normalized)) gallery.Add(normalized);
        }

        return gallery;
    }

    private string? ExtractAndNormalizeImageUrl(JsonElement node)
    {
        var url =
            node.GetNestedStringOrDefault("image", "link")
            ?? node.GetNestedStringOrDefault("c_image", "link")
            ?? ExtractFirstImageGroupLink(node)
            ?? node.GetPropertyOrDefault("image");

        return NormalizeImageUrl(url);
    }

    private List<string> ExtractGalleryUrls(JsonElement node)
    {
        var result = new List<string>();

        // Newer Shop API product responses commonly use `image_groups`.
        // Fallback to older `images.large[]` shape.
        if (node.TryGetProperty("image_groups", out var groups) && groups.ValueKind == JsonValueKind.Array)
        {
            // IMPORTANT (gallery sizing / web quality):
            // SFCC commonly returns the same product images in multiple `image_groups` (by size / view_type),
            // e.g. `large`, `medium`, `small`, `swatch`, etc.
            //
            // If we return ALL of them, the frontend gallery ends up with duplicates of the same image at
            // different resolutions. On web, if a smaller image is rendered into a large container it will
            // be upscaled and look soft/blurry.
            //
            // Therefore we intentionally choose ONE best-resolution set for the gallery:
            // - Prefer `large`, else `medium`, else `small`.
            // - Exclude `swatch`/`thumbnail` groups entirely.
            //
            // If you ever want the frontend to choose sizes dynamically (responsive images), change this
            // method to return structured data (e.g., grouped by view_type) instead of a flat URL list.
            foreach (var viewType in new[] { "large", "medium", "small" })
            {
                var links = ExtractImageGroupLinksForViewType(groups, viewType);
                if (links.Count > 0) return links;
            }

            // Fallback: return everything except swatch/thumbnail groups.
            var allNonSwatch = ExtractAllImageGroupLinks(node).ToList();
            if (allNonSwatch.Count > 0) return allNonSwatch;
        }

        if (node.TryGetProperty("images", out var imagesNode) && imagesNode.ValueKind == JsonValueKind.Object)
        {
            if (imagesNode.TryGetProperty("large", out var largeArray) && largeArray.ValueKind == JsonValueKind.Array)
            {
                foreach (var image in largeArray.EnumerateArray())
                {
                    var link = image.GetPropertyOrDefault("link");
                    if (!string.IsNullOrWhiteSpace(link)) result.Add(link);
                }
            }
        }

        return result;
    }

    private static string? ExtractFirstImageGroupLink(JsonElement node)
    {
        if (!node.TryGetProperty("image_groups", out var groups) || groups.ValueKind != JsonValueKind.Array)
        {
            return null;
        }

        // Prefer large -> medium -> small -> first available.
        var preferredViewTypes = new[] { "large", "medium", "small" };

        foreach (var viewType in preferredViewTypes)
        {
            var found = TryGetFirstImageLinkForViewType(groups, viewType);
            if (!string.IsNullOrWhiteSpace(found)) return found;
        }

        // Any group
        foreach (var group in groups.EnumerateArray())
        {
            var link = TryGetFirstImageLinkFromGroup(group);
            if (!string.IsNullOrWhiteSpace(link)) return link;
        }

        return null;
    }

    private static IEnumerable<string> ExtractAllImageGroupLinks(JsonElement node)
    {
        if (!node.TryGetProperty("image_groups", out var groups) || groups.ValueKind != JsonValueKind.Array)
        {
            yield break;
        }

        foreach (var group in groups.EnumerateArray())
        {
            var viewType = group.GetPropertyOrDefault("view_type");
            if (IsLowValueImageGroup(viewType))
            {
                continue;
            }

            if (group.TryGetProperty("images", out var images) && images.ValueKind == JsonValueKind.Array)
            {
                foreach (var img in images.EnumerateArray())
                {
                    var link = img.GetPropertyOrDefault("link");
                    if (!string.IsNullOrWhiteSpace(link)) yield return link;
                }
            }
        }
    }

    private static List<string> ExtractImageGroupLinksForViewType(JsonElement groups, string viewType)
    {
        var result = new List<string>();

        foreach (var group in groups.EnumerateArray())
        {
            var vt = group.GetPropertyOrDefault("view_type");
            if (!string.Equals(vt, viewType, StringComparison.OrdinalIgnoreCase)) continue;
            if (IsLowValueImageGroup(vt)) continue;

            if (group.TryGetProperty("images", out var images) && images.ValueKind == JsonValueKind.Array)
            {
                foreach (var img in images.EnumerateArray())
                {
                    var link = img.GetPropertyOrDefault("link");
                    if (!string.IsNullOrWhiteSpace(link)) result.Add(link);
                }
            }
        }

        return result;
    }

    private static bool IsLowValueImageGroup(string? viewType)
    {
        if (string.IsNullOrWhiteSpace(viewType)) return false;

        // These groups are usually tiny helper assets (e.g., color swatches) or very low resolution,
        // and they frequently duplicate the same base image.
        return viewType.Equals("swatch", StringComparison.OrdinalIgnoreCase)
            || viewType.Equals("swatches", StringComparison.OrdinalIgnoreCase)
            || viewType.Equals("thumbnail", StringComparison.OrdinalIgnoreCase)
            || viewType.Equals("thumbnails", StringComparison.OrdinalIgnoreCase);
    }

    private static string? TryGetFirstImageLinkForViewType(JsonElement groups, string viewType)
    {
        foreach (var group in groups.EnumerateArray())
        {
            var vt = group.GetPropertyOrDefault("view_type");
            if (!string.Equals(vt, viewType, StringComparison.OrdinalIgnoreCase)) continue;

            var link = TryGetFirstImageLinkFromGroup(group);
            if (!string.IsNullOrWhiteSpace(link)) return link;
        }
        return null;
    }

    private static string? TryGetFirstImageLinkFromGroup(JsonElement group)
    {
        if (group.TryGetProperty("images", out var images) && images.ValueKind == JsonValueKind.Array)
        {
            foreach (var img in images.EnumerateArray())
            {
                var link = img.GetPropertyOrDefault("link");
                if (!string.IsNullOrWhiteSpace(link)) return link;
            }
        }
        return null;
    }

    private string? NormalizeImageUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url)) return null;

        var trimmed = url.Trim();

        // Protocol-relative URL
        if (trimmed.StartsWith("//"))
        {
            return "https:" + trimmed;
        }

        // iOS/ATS will often block cleartext images.
        if (trimmed.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
        {
            trimmed = "https://" + trimmed.Substring("http://".Length);
        }

        // Relative path -> prefix the SFCC instance.
        if (trimmed.StartsWith("/"))
        {
            var host = _sfccOptions.CurrentValue.InstanceName;
            if (!string.IsNullOrWhiteSpace(host))
            {
                return $"https://{host.TrimEnd('/')}{trimmed}";
            }

            var baseUrl = _sfccOptions.CurrentValue.ApiBaseUrl?.TrimEnd('/');
            if (!string.IsNullOrWhiteSpace(baseUrl))
            {
                return baseUrl + trimmed;
            }
        }

        return trimmed;
    }
}
