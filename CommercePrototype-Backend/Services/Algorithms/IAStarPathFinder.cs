using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services.Algorithms
{
    public interface IAStarPathFinder
    {
        /// <summary>
        /// Finds a path from (sx,sy) to (tx,ty) on a walkable grid using the A* algorithm.
        /// Returns a list of PositionDto representing cell indices.
        /// </summary>
        List<PositionDto>? FindPath(bool[,] walkable, int sx, int sy, int tx, int ty);
    }
}