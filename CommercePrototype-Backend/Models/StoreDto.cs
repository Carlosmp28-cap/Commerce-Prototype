namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Represents a store with its grid layout.
    /// </summary>
    public class StoreDto
    {
        /// <summary>
        /// Store identifier.
        /// </summary>
        public string StoreId { get; set; } = string.Empty;

        /// <summary>
        /// Grid dimensions and center for the store layout.
        /// </summary>
        public GridDto? GridDimensions { get; set; }
    }
}
