
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CommercePrototype_Backend.Models
{
    public class ProductLocationDto
    {
        // Primary canonical properties (internal)
        [JsonIgnore]
        public string Product__c { get; set; } = string.Empty;

        [JsonIgnore]
        public string Shelf__c { get; set; } = string.Empty;

        [JsonIgnore]
        public int Quantity__c { get; set; }

        [JsonIgnore]
        public int? Level__c { get; set; }

        [JsonIgnore]
        public string? Product_Name__c { get; set; }

        [JsonIgnore]
        public PositionDto? Position { get; set; } // Populated from a variety of Salesforce shapes

        // Convenience properties used by backend code (non-JSON mapped)
        public string ProductId { get => Product__c; set => Product__c = value ?? string.Empty; }
        public string ShelfId { get => Shelf__c; set => Shelf__c = value ?? string.Empty; }
        public int Quantity { get => Quantity__c; set => Quantity__c = value; }
        public int? Level { get => Level__c; set => Level__c = value; }
        public string? ProductName { get => Product_Name__c; set => Product_Name__c = value; }

        // Compatibility and JSON mapping: accept common Salesforce API field names by exposing
        // properties decorated with JsonPropertyName that forward into the canonical properties.

        [JsonPropertyName("Product__c")]
        public string Product__c_Api { get => Product__c; set => Product__c = value ?? string.Empty; }

        [JsonPropertyName("ProductId")]
        public string ProductId_Api { get => Product__c; set => Product__c = value ?? string.Empty; }

        [JsonPropertyName("ProductId__c")]
        public string ProductId__c_Api { get => Product__c; set => Product__c = value ?? string.Empty; }

        [JsonPropertyName("Shelf__c")]
        public string Shelf__c_Api { get => Shelf__c; set => Shelf__c = value ?? string.Empty; }

        [JsonPropertyName("ShelfId")]
        public string ShelfId_Api { get => Shelf__c; set => Shelf__c = value ?? string.Empty; }

        [JsonPropertyName("ShelfId__c")]
        public string ShelfId__c_Api { get => Shelf__c; set => Shelf__c = value ?? string.Empty; }

        [JsonPropertyName("Quantity__c")]
        public int Quantity__c_Api { get => Quantity__c; set => Quantity__c = value; }

        [JsonPropertyName("Quantity")]
        public int Quantity_Api { get => Quantity__c; set => Quantity__c = value; }

        [JsonPropertyName("Level__c")]
        public int? Level__c_Api { get => Level__c; set => Level__c = value; }

        [JsonPropertyName("Level")]
        public int? Level_Api { get => Level__c; set => Level__c = value; }

        [JsonPropertyName("Product_Name__c")]
        public string? Product_Name__c_Api { get => Product_Name__c; set => Product_Name__c = value; }

        [JsonPropertyName("ProductName")]
        public string? ProductName_Api { get => Product_Name__c; set => Product_Name__c = value; }

        // Position handling: Salesforce may return a nested JSON object called `Position` or separate X/Y fields.
        // Accept multiple shapes and populate the canonical Position property accordingly.

        [JsonPropertyName("Position")]
        public JsonElement? PositionJson
        {
            set
            {
                if (value == null || value?.ValueKind != JsonValueKind.Object) return;
                var obj = value.Value;
                double x = 0, y = 0; bool has = false;
                if (obj.TryGetProperty("X", out var xp) && xp.TryGetDouble(out var xd)) { x = xd; has = true; }
                if (obj.TryGetProperty("Y", out var yp) && yp.TryGetDouble(out var yd)) { y = yd; has = true; }
                if (!has)
                {
                    if (obj.TryGetProperty("x", out var xp2) && xp2.TryGetDouble(out var xd2)) { x = xd2; has = true; }
                    if (obj.TryGetProperty("y", out var yp2) && yp2.TryGetDouble(out var yd2)) { y = yd2; has = true; }
                }
                if (has) Position = new PositionDto(x, y);
            }
        }

        [JsonPropertyName("X__c")]
        public double? X__c_Api { set { if (value.HasValue) Position = new PositionDto(value.Value, Position?.Y ?? 0); } }

        [JsonPropertyName("Y__c")]
        public double? Y__c_Api { set { if (value.HasValue) Position = new PositionDto(Position?.X ?? 0, value.Value); } }

        [JsonPropertyName("x")]
        public double? x_Api { set { if (value.HasValue) Position = new PositionDto(value.Value, Position?.Y ?? 0); } }

        [JsonPropertyName("y")]
        public double? y_Api { set { if (value.HasValue) Position = new PositionDto(Position?.X ?? 0, value.Value); } }
    }
}
