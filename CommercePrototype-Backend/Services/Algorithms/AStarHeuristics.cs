namespace CommercePrototype_Backend.Services.Algorithms
{
    public static class AStarHeuristics
    {

        /// <summary>
        /// Calculates the Octile heuristic distance between two points on a grid.
        /// This heuristic is suitable for grids where movement is allowed in 8 directions (orthogonal and diagonal).
        /// It estimates the minimum cost from (x, y) to (tx, ty), considering diagonal movement.
        /// </summary>
        /// <param name="x">The x-coordinate of the starting point.</param>
        /// <param name="y">The y-coordinate of the starting point.</param>
        /// <param name="tx">The x-coordinate of the target point.</param>
        /// <param name="ty">The y-coordinate of the target point.</param>
        /// <returns>The estimated cost to reach the target using octile distance.</returns>
        public static double Octile(int x, int y, int tx, int ty)
        {
            // Calculate the absolute difference in x and y between the current and target positions
            var dx = Math.Abs(tx - x);
            var dy = Math.Abs(ty - y);

            // Cost of moving horizontally or vertically (orthogonal movement)
            const double D = 1.0;
            
            // Cost of moving diagonally (diagonal movement)
            const double D2 = 1.4;

            // The minimum of dx and dy represents the maximum number of diagonal moves possible
            var min = Math.Min(dx, dy);

            // The formula combines diagonal and straight moves to estimate the shortest path
            // Octile distance = D * (dx + dy) + (D2 - 2 * D) * min
            // This ensures admissibility and consistency for A* on 8-directional grids
            return D * (dx + dy) + (D2 - 2 * D) * min;
        }
    }
}
