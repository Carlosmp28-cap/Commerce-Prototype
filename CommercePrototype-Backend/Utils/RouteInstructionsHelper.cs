namespace CommercePrototype_Backend.Utils
{
    public static class RouteInstructionsHelper
    {
        /// <summary>
        /// Generates human-friendly movement directions from a path of grid coordinates.
        /// Produces Portuguese sentences like "Ande 9 m para a direita" or "Ande 2 m para baixo e direita".
        /// </summary>
        /// <param name="path">List of (x, y) grid coordinates representing the path.</param>
        /// <param name="zones">List of ZoneDto representing store zones (optional, used only to add area hints when available).</param>
        /// <returns>List of DirectionSection objects with navigation instructions.</returns>
        public static List<Models.DirectionSection> GenerateDirections(List<(int x, int y)> path, List<Models.ZoneDto> zones)
        {
            var directions = new List<Models.DirectionSection>();
            if (path == null || path.Count < 2) return directions;

            // Build step deltas
            var steps = new List<(int dx, int dy, double dist)>();
            for (int i = 0; i < path.Count - 1; i++)
            {
                var dx = path[i + 1].x - path[i].x;
                var dy = path[i + 1].y - path[i].y;
                var dist = Math.Sqrt(dx * dx + dy * dy);
                steps.Add((dx, dy, dist));
            }

            // Compress collinear segments (same primary direction)
            var compressed = new List<(double dx, double dy, double dist)>();
            foreach (var s in steps)
            {
                var norm = (double v) => Math.Abs(v) < 1e-9 ? 0.0 : v;
                var dirX = Math.Sign(norm(s.dx));
                var dirY = Math.Sign(norm(s.dy));
                if (compressed.Count > 0)
                {
                    var last = compressed[^1];
                    var lastDirX = Math.Sign(norm(last.dx));
                    var lastDirY = Math.Sign(norm(last.dy));
                    if (dirX == lastDirX && dirY == lastDirY)
                    {
                        // merge
                        compressed[^1] = (last.dx + s.dx, last.dy + s.dy, last.dist + s.dist);
                        continue;
                    }
                }
                compressed.Add((s.dx, s.dy, s.dist));
            }

            string ToText(double dx, double dy)
            {
                var absX = Math.Abs(dx);
                var absY = Math.Abs(dy);
                var dirX = dx > 0 ? "direita" : dx < 0 ? "esquerda" : "";
                var dirY = dy > 0 ? "baixo" : dy < 0 ? "cima" : "";
                if (absX > 0 && absY > 0)
                {
                    // diagonal: mention both
                    var mainFirst = absX >= absY;
                    return mainFirst ? $"para {dirX} e {dirY}" : $"para {dirY} e {dirX}";
                }
                if (absX > 0) return $"para {dirX}";
                if (absY > 0) return $"para {dirY}";
                return "em frente";
            }

            // Optionally add zone hint for destination
            string? destArea = null;
            if (zones != null && zones.Count > 0)
            {
                var dest = path[^1];
                var zone = GetZoneForCoordinate(dest, zones);
                if (zone != null)
                    destArea = zone.ZoneName ?? zone.ZoneId;
            }

            foreach (var c in compressed)
            {
                var distM = Math.Round(c.dist); // each grid cell is 1 m
                var text = $"Ande {distM} m {ToText(c.dx, c.dy)}";
                var section = new Models.DirectionSection
                {
                    Type = "move",
                    Steps = 0,
                    From = default,
                    To = default,
                    Text = text,
                    DistanceMeters = (int)distM,
                    Area = null
                };
                directions.Add(section);
            }

            // Arrival hint: send only a text line, omit DistanceMeters and Area
            string arrivalText = "Chegou ao seu destino";
            directions.Add(new Models.DirectionSection
            {
                Type = "arrive",
                Steps = 0,
                From = default,
                To = default,
                Text = arrivalText,
                DistanceMeters = null,
                Area = null
            });

            return directions;
        }

        /// <summary>
        /// Finds the zone for a given grid coordinate.
        /// </summary>
        private static Models.ZoneDto? GetZoneForCoordinate((int x, int y) coord, List<Models.ZoneDto> zones)
        {
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
