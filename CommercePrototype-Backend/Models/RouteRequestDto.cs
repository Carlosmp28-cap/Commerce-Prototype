namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Represents a request for a route calculation, including store, product, and starting position.
    /// </summary>
    public class RouteRequestDto
    {
        /// <summary>
        /// Optional grid dimensions for the route calculation. If not provided, default dimensions will be used.
        /// </summary>
        public GridDto? Grid { get; set; }
        /// <summary>
        /// Gets or sets the unique identifier of the store.
        /// </summary>
        public string StoreId { get; set; } = string.Empty;

        /// <summary>
        /// Gets or sets the unique identifier of the product.
        /// </summary>
        public string ProductId { get; set; } = string.Empty;


        /// <summary>
        /// Gets or sets the starting position (coordinates) for the route calculation.
        /// </summary>
        public PositionDto StartPosition { get; set; } = new PositionDto(0, 0);

        /// <summary>
        /// Gets or sets the grid resolution in meters for the route calculation. Default is 1 meter.
        /// </summary>
        public int GridResolutionMeters { get; set; } = 1;

        /// <summary>
        /// Initializes a new instance of the <see cref="RouteRequestDto"/> class.
        /// </summary>
        /// <param name="StoreId">The unique identifier of the store.</param>
        /// <param name="ProductId">The unique identifier of the product.</param>
        /// <param name="StartPosition">The starting position for the route calculation.</param>
        public RouteRequestDto(string storeId, string productId, PositionDto StartPosition)
        {
            this.StoreId = storeId;
            this.ProductId = productId;
            this.StartPosition = StartPosition;
        }
    }
}
