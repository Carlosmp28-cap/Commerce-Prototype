using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services.Algorithms
{
    // <summary>
    // A* pathfinding implementation on a 2D grid.
    // </summary>
    public class AStarPathFinder : IAStarPathFinder
    {

        /// <summary>
        /// Finds a path from (sx,sy) to (tx,ty) on a walkable grid using the A* algorithm.
        /// Returns a list of PositionDto representing cell indices (not real coordinates).
        /// </summary>
        public List<PositionDto>? FindPath(bool[,] walkable, int sx, int sy, int tx, int ty)
        {
            // Get the grid dimensions
            int cols = walkable.GetLength(0);
            int rows = walkable.GetLength(1);

            // Priority queue for open set, sorted by estimated total cost (f = gscore + heuristic score)
            var open = new PriorityQueue<AStarCell, double>();

            // Create the start cell with g=0 and heuristic h to the target
            var start = new AStarCell(sx, sy, 0, AStarHeuristics.Octile(sx, sy, tx, ty), null);
            open.Enqueue(start, start.FScore);

            // gScore dictionary: maps (x, y) to the lowest cost from start found so far
            var gScore = new Dictionary<(int, int), double> { [(sx, sy)] = 0 };

            // Closed set: stores already evaluated cells
            var closed = new HashSet<(int, int)>();

            // All possible neighbor moves (4 orthogonal, 4 diagonal) with their movement costs
            var neighbors = new (int dx, int dy, double cost)[]
            {
                (1,0,1.0), (-1,0,1.0), (0,1,1.0), (0,-1,1.0), // orthogonal
                (1,1,1.4), (1,-1,1.4), (-1,1,1.4), (-1,-1,1.4) // diagonal
            };

            while (open.Count > 0)
            {
                // Get the cell with the lowest f-score from the open set
                var current = open.Dequeue();
                var curKey = (current.X, current.Y);

                // If this cell was already processed, skip it
                if (!closed.Add(curKey)) continue;

                // If the target is reached, reconstruct the path by following parent links
                if (current.X == tx && current.Y == ty)
                {
                    var path = new List<AStarCell>();
                    for (var cur = current; cur != null; cur = cur.Parent)
                        path.Add(cur); // Add each cell to the path

                    // Reverse to get path from start to target
                    path.Reverse();

                    // Convert the path of cells to a list of PositionDto
                    return path.ConvertAll(c => new PositionDto(c.X, c.Y));
                }

                // Explore all valid neighbors
                foreach (var (dxn, dyn, moveCost) in neighbors)
                {
                    int nx = current.X + dxn;
                    int ny = current.Y + dyn;

                    // Skip neighbors outside the grid
                    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
                    // Skip non-walkable cells
                    if (!walkable[nx, ny]) continue;

                    // Calculate tentative g-score for this neighbor
                    double tentativeG = current.GScore + moveCost;
                    var key = (nx, ny);

                    // Skip if neighbor is already in the closed set
                    if (closed.Contains(key)) continue;

                    // If this path to neighbor is better than any previous one, or it's new
                    if (!gScore.TryGetValue(key, out var knownG) || tentativeG < knownG)
                    {
                        gScore[key] = tentativeG; // Update best g-score
                        double h = AStarHeuristics.Octile(nx, ny, tx, ty); // Heuristic to target
                        var neighbor = new AStarCell(nx, ny, tentativeG, h, current); // Create neighbor cell
                        open.Enqueue(neighbor, neighbor.FScore); // Add to open set
                    }
                }
            }

            // No path found
            return null;
        }
    }
}
