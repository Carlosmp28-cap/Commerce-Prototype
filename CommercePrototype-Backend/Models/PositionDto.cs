namespace CommercePrototype_Backend.Models
{
    /// <summary>
    /// Represents a position in 2D space with X and Y coordinates.
    /// </summary>
    public class PositionDto
    {
        /// <summary>
        /// Gets or sets the X coordinate.
        /// </summary>
        public double X { get; set; }

        /// <summary>
        /// Gets or sets the Y coordinate.
        /// </summary>
        public double Y { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="PositionDto"/> class with the specified coordinates.
        /// </summary>
        /// <param name="x">The X coordinate.</param>
        /// <param name="y">The Y coordinate.</param>
        public PositionDto(double x, double y)
        {
            this.X = x;
            this.Y = y;
        }
    }
}