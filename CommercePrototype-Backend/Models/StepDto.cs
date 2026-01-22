namespace CommercePrototype_Backend.Models {
    /// <summary>
    /// Represents a single step in a route, including its position and an optional label.
    /// </summary>
    public class StepDto
    {
        /// <summary>
        /// The position of this step in the route.
        /// </summary>
        public PositionDto Position { get; set; }

        /// <summary>
        /// An optional description for the step (e.g., "start", "destination").
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Initializes a new instance of the <see cref="StepDto"/> class.
        /// </summary>
        /// <param name="position">The position of the step.</param>
        /// <param name="description">An optional description for the step.</param>
        public StepDto(PositionDto position, string? description = null)
        {
            Position = position;
            Description = description;
        }
    }
}
