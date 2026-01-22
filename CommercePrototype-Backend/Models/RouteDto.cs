namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Data transfer object for route information, including store, product, and path positions.
    /// </summary>
    public class RouteDto
    {
        /// <summary>
        /// The unique identifier of the store.
        /// </summary>
        public string StoreId { get; set; } = string.Empty;

        /// <summary>
        /// The unique identifier of the product.
        /// </summary>
        public string ProductId { get; set; } = string.Empty;

        /// <summary>
        /// The list of positions (nodes) representing the route from the start to the product.
        /// </summary>
        public List<PositionDto> positions { get; set; } = new List<PositionDto>();

        /// <summary>
        /// Initializes a new instance of the <see cref="RouteDto"/> class.
        /// </summary>
        /// <param name="storeId">The unique identifier of the store.</param>
        /// <param name="productId">The unique identifier of the product.</param>
        /// <param name="positions">The list of positions representing the route.</param>
        public RouteDto(string storeId, string productId, List<PositionDto> positions)
        {
            this.StoreId = storeId;
            this.ProductId = productId;
            this.positions = positions;
        }
    }
}