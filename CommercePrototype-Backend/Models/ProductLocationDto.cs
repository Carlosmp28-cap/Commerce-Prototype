namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Represents a mock product with an optional position for testing and prototyping.
    /// </summary>
    public class ProductLocationDto
    {
        /// <summary>
        /// The unique identifier for the product.
        /// </summary>
        public string ProductId { get; set; } = string.Empty;

        /// <summary>
        /// The position of the product in the store (optional).
        /// </summary>
        public PositionDto? Position { get; set; }
    }
}
