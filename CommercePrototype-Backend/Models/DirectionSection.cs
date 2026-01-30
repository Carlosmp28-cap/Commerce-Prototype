using System.Text.Json.Serialization;

namespace CommercePrototype_Backend.Models
{
    public class DirectionSection
    {
        public string Type { get; set; } = string.Empty;
        public int Steps { get; set; }
        public (int x, int y) From { get; set; }
        public (int x, int y) To { get; set; }
        public string? Text { get; set; }
        // Added fields used by instructions generator and UI
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? DistanceMeters { get; set; }
        public string? Area { get; set; }
    }
}
