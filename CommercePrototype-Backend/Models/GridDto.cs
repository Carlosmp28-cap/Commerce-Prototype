namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Represents grid dimensions and center for a store layout.
    /// </summary>
    public class GridDto
    {
        /// <summary>
        /// Width of the grid in meters.
        /// </summary>
        public double Width { get; set; }

        /// <summary>
        /// Height of the grid in meters.
        /// </summary>
        public double Height { get; set; }

        /// <summary>
        /// Center position of the grid (optional).
        /// </summary>
        public PositionDto? Center { get; set; }

        /// <summary>
        /// Unit of measurement (optional).
        /// </summary>
        public string? Unit { get; set; }
    }
}
