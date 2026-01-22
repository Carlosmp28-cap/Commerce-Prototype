namespace CommercePrototype_Backend.Services.Algorithms
{
    /// <summary>
    /// Represents a node/cell in the grid for the A* algorithm.
    /// Each cell keeps its position, cost values, and a reference to its parent for path reconstruction.
    /// </summary>
    public class AStarCell
    {

        /// <summary>
        /// X coordinate (column) in the grid.
        /// </summary>
        public int X { get; }

        /// <summary>
        /// Y coordinate (row) in the grid.
        /// </summary>
        public int Y { get; }

        /// <summary>
        /// Cost from the start node to this cell (g score).
        /// </summary>
        public double GScore { get; }

        /// <summary>
        /// Heuristic cost estimate from this cell to the goal (h score).
        /// </summary>
        public double HScore { get; }

        /// <summary>
        /// Total estimated cost (G score + Heuristic score).
        /// </summary>
        public double FScore => GScore + HScore;

        /// <summary>
        /// Reference to the parent cell (used to reconstruct the path).
        /// </summary>
        public AStarCell? Parent { get; }

        /// <summary>
        /// Constructs a new AStarCell.
        /// </summary>
        /// <param name="x">X coordinate in the grid.</param>
        /// <param name="y">Y coordinate in the grid.</param>
        /// <param name="g">Cost from the start node to this cell.</param>
        /// <param name="h">Heuristic cost estimate to the goal.</param>
        /// <param name="parent">Reference to the parent cell.</param>
        public AStarCell(int x, int y, double gScore, double hScore, AStarCell? parent)
        {
            X = x; // Column index
            Y = y; // Row index
            GScore = gScore; // Cost from start to this cell
            HScore = hScore; // Heuristic estimate to goal
            Parent = parent; // Previous cell in the path
        }
    }
}
