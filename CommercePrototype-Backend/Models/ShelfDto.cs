namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Represents a shelf (prateleira) in a store, with position and dimensions.
    /// </summary>
    public class ShelfDto
    {
        /// <summary>
        /// Unique identifier for the shelf.
        /// </summary>
        public string Id { get; set; } = string.Empty;

        /// <summary>
        /// Store identifier to which this shelf belongs.
        /// </summary>
        public string StoreId { get; set; } = string.Empty;

        /// <summary>
        /// Zone identifier where the shelf is located (optional).
        /// </summary>
        public string? ZoneId { get; set; }

        /// <summary>
        /// Position (X, Y) of the shelf (center or top-left, depending on convention).
        /// </summary>
        public PositionDto? Position { get; set; }

        /// <summary>
        /// Width of the shelf in meters.
        /// </summary>
        public double Width { get; set; }

        /// <summary>
        /// Height of the shelf in meters.
        /// </summary>
        public double Height { get; set; }
    }
}
