namespace CommercePrototype_Backend.Models
{

    public class RouteStepDto
    {
        public PositionDto Position { get; set; }
        public string? Label { get; set; }

        public RouteStepDto(PositionDto position, string? label = null)
        {
            Position = position;
            Label = label;
        }
    }

    public class RouteResultDto
    {
        public string StoreId { get; set; } = string.Empty;
        public string ProductId { get; set; } = string.Empty;
        public double DistanceMeters { get; set; }
        public List<RouteStepDto> Steps { get; set; } = new List<RouteStepDto>();
        // Full list of waypoints (raw A* path or linear waypoints) as positions
        public List<PositionDto> Waypoints { get; set; } = new List<PositionDto>();

        // Debug messages (e.g. obstacles encountered) included in JSON for debugging
        public List<string> DebugMessages { get; set; } = new List<string>();

        public RouteResultDto() { }

        public RouteResultDto(string storeId, string productId, double distanceMeters, List<RouteStepDto> steps, List<PositionDto>? waypoints = null)
        {
            StoreId = storeId;
            ProductId = productId;
            DistanceMeters = distanceMeters;
            Steps = steps;
            Waypoints = waypoints ?? new List<PositionDto>();
        }
    }
}
