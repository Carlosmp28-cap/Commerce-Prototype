namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Represents a store zone with position and dimensions.
    /// </summary>
    public class ZoneDto // (touched for rebuild)
    {
        /// <summary>
        /// Store identifier to which this zone belongs.
        /// </summary>
        public string StoreId { get; set; } = string.Empty;


        /// <summary>
        /// Unique identifier for the zone.
        /// </summary>
        public string ZoneId { get; set; } = string.Empty;

        /// <summary>
        /// Human-friendly name for the zone (e.g., "Bakery", "Produce").
        /// </summary>
        public string? ZoneName { get; set; }

        /// <summary>
        /// Position (X, Y) of the top-left or center of the zone (depends on convention).
        /// </summary>
        public PositionDto? Position { get; set; }

        /// <summary>
        /// Width of the zone in meters.
        /// </summary>
        public double Width { get; set; }

        /// <summary>
        /// Height of the zone in meters.
        /// </summary>
        public double Height { get; set; }
    }
}
