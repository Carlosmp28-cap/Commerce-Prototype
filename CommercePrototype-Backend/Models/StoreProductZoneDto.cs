namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Represents a mapping between a product and its location (zone/shelf) in a store.
    /// </summary>
    public class StoreProductZoneDto
    {
        /// <summary>
        /// Product identifier.
        /// </summary>
        public string ProductId { get; set; } = string.Empty;

        /// <summary>
        /// Store identifier.
        /// </summary>
        public string StoreId { get; set; } = string.Empty;

        /// <summary>
        /// Zone identifier where the product is located (optional).
        /// </summary>
        public string? ZoneId { get; set; }

        /// <summary>
        /// Shelf identifier where the product is located (optional).
        /// </summary>
        public string? ShelfId { get; set; }
    }
}
