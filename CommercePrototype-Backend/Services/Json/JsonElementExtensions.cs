using System.Globalization;
using System.Text.Json;

namespace CommercePrototype_Backend.Services.Json;

/// <summary>
/// Convenience helpers for safely reading values from <see cref="JsonElement"/>.
/// </summary>
/// <remarks>
/// SFCC payloads are not strongly typed in this prototype. These helpers reduce repetitive
/// <c>TryGetProperty</c> and <c>ValueKind</c> checks while keeping parsing resilient.
/// </remarks>
public static class JsonElementExtensions
{
    /// <summary>
    /// Reads a property as a string, returning <see langword="null"/> when the property doesn't exist.
    /// </summary>
    /// <param name="node">JSON object to read from.</param>
    /// <param name="propertyName">Property name to read.</param>
    /// <returns>The property value as a string (best-effort), or <see langword="null"/>.</returns>
    public static string? GetPropertyOrDefault(this JsonElement node, string propertyName)
    {
        if (node.ValueKind != JsonValueKind.Object) return null;
        if (!node.TryGetProperty(propertyName, out var value)) return null;

        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number => value.GetRawText(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            JsonValueKind.Null => null,
            JsonValueKind.Undefined => null,
            _ => value.GetRawText(),
        };
    }

    /// <summary>
    /// Reads a nested string property from an object-of-object shape.
    /// </summary>
    /// <param name="node">JSON object to read from.</param>
    /// <param name="parentProperty">Parent property name that must be an object.</param>
    /// <param name="childProperty">Child property name to read from the parent object.</param>
    /// <returns>The child property value, or <see langword="null"/>.</returns>
    public static string? GetNestedStringOrDefault(this JsonElement node, string parentProperty, string childProperty)
    {
        if (node.ValueKind != JsonValueKind.Object) return null;
        if (!node.TryGetProperty(parentProperty, out var parent)) return null;
        if (parent.ValueKind != JsonValueKind.Object) return null;

        return parent.GetPropertyOrDefault(childProperty);
    }

    /// <summary>
    /// Reads a property as a decimal.
    /// </summary>
    /// <param name="node">JSON object to read from.</param>
    /// <param name="propertyName">Property name to read.</param>
    /// <returns>The decimal value, or <see langword="null"/> if missing/unparseable.</returns>
    public static decimal? GetDecimalOrDefault(this JsonElement node, string propertyName)
    {
        if (node.ValueKind != JsonValueKind.Object) return null;
        if (!node.TryGetProperty(propertyName, out var value)) return null;

        return value.ValueKind switch
        {
            JsonValueKind.Number => value.TryGetDecimal(out var d) ? d : null,
            JsonValueKind.String => TryParseDecimal(value.GetString()),
            _ => null,
        };
    }

    /// <summary>
    /// Reads a nested decimal property from an object-of-object shape.
    /// </summary>
    /// <param name="node">JSON object to read from.</param>
    /// <param name="parentProperty">Parent property name that must be an object.</param>
    /// <param name="childProperty">Child property name to read from the parent object.</param>
    /// <returns>The decimal value, or <see langword="null"/> if missing/unparseable.</returns>
    public static decimal? GetNestedDecimalOrDefault(this JsonElement node, string parentProperty, string childProperty)
    {
        if (node.ValueKind != JsonValueKind.Object) return null;
        if (!node.TryGetProperty(parentProperty, out var parent)) return null;
        if (parent.ValueKind != JsonValueKind.Object) return null;

        return parent.GetDecimalOrDefault(childProperty);
    }

    /// <summary>
    /// Reads a property as an integer.
    /// </summary>
    /// <param name="node">JSON object to read from.</param>
    /// <param name="propertyName">Property name to read.</param>
    /// <returns>The integer value, or <see langword="null"/> if missing/unparseable.</returns>
    public static int? GetIntOrDefault(this JsonElement node, string propertyName)
    {
        if (node.ValueKind != JsonValueKind.Object) return null;
        if (!node.TryGetProperty(propertyName, out var value)) return null;

        return value.ValueKind switch
        {
            JsonValueKind.Number => value.TryGetInt32(out var i) ? i : null,
            JsonValueKind.String => TryParseInt(value.GetString()),
            _ => null,
        };
    }

    /// <summary>
    /// Reads a nested integer property from an object-of-object shape.
    /// </summary>
    /// <param name="node">JSON object to read from.</param>
    /// <param name="parentProperty">Parent property name that must be an object.</param>
    /// <param name="childProperty">Child property name to read from the parent object.</param>
    /// <returns>The integer value, or <see langword="null"/> if missing/unparseable.</returns>
    public static int? GetNestedIntOrDefault(this JsonElement node, string parentProperty, string childProperty)
    {
        if (node.ValueKind != JsonValueKind.Object) return null;
        if (!node.TryGetProperty(parentProperty, out var parent)) return null;
        if (parent.ValueKind != JsonValueKind.Object) return null;

        return parent.GetIntOrDefault(childProperty);
    }

    private static decimal? TryParseDecimal(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        // SFCC values are typically JSON numbers, but some custom attributes can be strings.
        return decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var d)
            ? d
            : null;
    }

    private static int? TryParseInt(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;

        return int.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out var i)
            ? i
            : null;
    }
}
