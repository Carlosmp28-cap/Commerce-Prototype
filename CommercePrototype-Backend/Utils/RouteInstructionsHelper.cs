namespace CommercePrototype_Backend.Utils
{
    public static class RouteInstructionsHelper
    {
        
        /// <summary>
        /// Generates a list of direction sections (zone-based instructions) from a path of grid coordinates.
        /// </summary>
        /// <param name="path">List of (x, y) grid coordinates representing the path.</param>
        /// <param name="zones">List of ZoneDto representing store zones.</param>
        /// <returns>List of DirectionSection objects with navigation instructions by zone.</returns>
        public static List<Models.DirectionSection> GenerateDirections(List<(int x, int y)> path, List<Models.ZoneDto> zones)
        {
            var directions = new List<Models.DirectionSection>();
            if (path == null || path.Count < 2 || zones == null || zones.Count == 0)
                return directions;

            string? prevZoneId = null;
            string? prevZoneName = null;
            int steps = 0;
            var from = path[0];
            var segmentStart = path[0];

            for (int i = 0; i < path.Count; i++)
            {
                var curr = path[i];
                var zone = GetZoneForCoordinate(curr, zones);
                if (zone == null)
                    continue;
                if (prevZoneId == null)
                {
                    // First zone
                    prevZoneId = zone.ZoneId;
                    prevZoneName = zone.ZoneName ?? zone.ZoneId;
                    steps = 1;
                    segmentStart = curr;
                }
                else if (zone.ZoneId == prevZoneId)
                {
                    steps++;
                }
                else
                {
                    // Zone changed, add previous segment
                    directions.Add(new Models.DirectionSection
                    {
                        Type = "zone",
                        Steps = steps,
                        From = segmentStart,
                        To = path[i - 1],
                        Text = $"Proceed through {prevZoneName} ({steps} step(s))"
                    });
                    // Start new segment
                    prevZoneId = zone.ZoneId;
                    prevZoneName = zone.ZoneName ?? zone.ZoneId;
                    steps = 1;
                    segmentStart = curr;
                }
            }
            // Add last segment
            if (steps > 0 && prevZoneName != null)
            {
                directions.Add(new Models.DirectionSection
                {
                    Type = "zone",
                    Steps = steps,
                    From = segmentStart,
                    To = path[^1],
                    Text = $"Proceed through {prevZoneName} ({steps} step(s))"
                });
            }
            // Arrival
            if (path.Count > 1)
            {
                directions.Add(new Models.DirectionSection
                {
                    Type = "arrive",
                    Steps = 0,
                    From = path[^2],
                    To = path[^1],
                    Text = "You have arrived at your destination"
                });
            }
            return directions;
        }

        /// <summary>
        /// Finds the zone for a given grid coordinate.
        /// </summary>
        private static Models.ZoneDto? GetZoneForCoordinate((int x, int y) coord, List<Models.ZoneDto> zones)
        {
            // This assumes grid coordinates map to zone bounding boxes (rounded to int)
            foreach (var zone in zones)
            {
                if (zone.Position == null) continue;
                int zx = (int)zone.Position.X;
                int zy = (int)zone.Position.Y;
                int zw = (int)zone.Width;
                int zh = (int)zone.Height;
                if (coord.x >= zx && coord.x < zx + zw && coord.y >= zy && coord.y < zy + zh)
                {
                    return zone;
                }
            }
            return null;
        }
    }
}
