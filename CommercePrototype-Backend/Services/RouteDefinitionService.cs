using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Services.Algorithms;
using CommercePrototype_Backend.Utils;

namespace CommercePrototype_Backend.Services
{
    /// <summary>
    /// Service responsible for calculating routes between a start position and a product in a store, using grid and obstacle data.
    /// </summary>
    public class RouteDefinitionService : IRouteDefinitionService
    {
        private readonly IAStarPathFinder _aStarPathFinder;
        private readonly ILogger<RouteDefinitionService> _logger;
        private readonly IStoreFileReader _storeFileReader;
        private readonly string _mockDataDir;

        /// <summary>
        /// Initializes a new instance of the <see cref="RouteDefinitionService"/> class.
        /// </summary>
        /// <param name="aStarPathFinder">The pathfinding algorithm implementation.</param>
        /// <param name="logger">Logger for diagnostics and errors.</param>
        /// <param name="storeFileReader">Service for reading store and product data from files.</param>
        public RouteDefinitionService(IAStarPathFinder aStarPathFinder, ILogger<RouteDefinitionService> logger, IStoreFileReader storeFileReader)
        {
            _aStarPathFinder = aStarPathFinder;
            _logger = logger;
            _storeFileReader = storeFileReader;
            _mockDataDir = Path.Combine(AppContext.BaseDirectory, "mockData");
        }

        /// <summary>
        /// Constrói a grade (grid) de walkability da loja, marcando obstáculos (prateleiras).
        /// </summary>
        /// <param name="store">A loja.</param>
        /// <param name="shelves">Lista de prateleiras.</param>
        /// <param name="resolutionMeters">Resolução da grid em metros.</param>
        /// <returns>Tupla: grid[cols,rows], cols, rows</returns>
        private (bool[,], int, int) BuildGrid(StoreDto store, List<ShelfDto>? shelves, int resolutionMeters)
        {
            var width = (int)Math.Ceiling(store.GridDimensions?.Width ?? 10);
            var height = (int)Math.Ceiling(store.GridDimensions?.Height ?? 10);
            var cols = Math.Max(1, (int)Math.Ceiling(width / (double)resolutionMeters));
            var rows = Math.Max(1, (int)Math.Ceiling(height / (double)resolutionMeters));
            var grid = new bool[cols, rows];
            for (int x = 0; x < cols; x++)
                for (int y = 0; y < rows; y++)
                    grid[x, y] = true;
            if (shelves != null)
            {
                foreach (var s in shelves)
                {
                    if (s.Position == null) continue;
                    var sx0 = (int)Math.Floor((s.Position.X - s.Width / 2.0) / resolutionMeters);
                    var sy0 = (int)Math.Floor((s.Position.Y - s.Height / 2.0) / resolutionMeters);
                    var sx1 = (int)Math.Ceiling((s.Position.X + s.Width / 2.0) / resolutionMeters) - 1;
                    var sy1 = (int)Math.Ceiling((s.Position.Y + s.Height / 2.0) / resolutionMeters) - 1;
                    sx0 = Math.Clamp(sx0, 0, cols - 1);
                    sy0 = Math.Clamp(sy0, 0, rows - 1);
                    sx1 = Math.Clamp(sx1, 0, cols - 1);
                    sy1 = Math.Clamp(sy1, 0, rows - 1);
                    for (int gx = sx0; gx <= sx1; gx++)
                        for (int gy = sy0; gy <= sy1; gy++)
                            grid[gx, gy] = false;
                }
            }
            return (grid, cols, rows);
        }

        /// <summary>
        /// Converte posições reais para índices de grid.
        /// </summary>
        /// <param name="start">Posição inicial.</param>
        /// <param name="dest">Posição destino.</param>
        /// <param name="resolutionMeters">Resolução da grid.</param>
        /// <param name="cols">Colunas da grid.</param>
        /// <param name="rows">Linhas da grid.</param>
        /// <returns>Tupla: sx, sy, dx, dy</returns>
        private (int, int, int, int) GetGridIndices(PositionDto start, PositionDto dest, int resolutionMeters, int cols, int rows)
        {
            int sx = Math.Clamp((int)Math.Floor(start.X / resolutionMeters), 0, cols - 1);
            int sy = Math.Clamp((int)Math.Floor(start.Y / resolutionMeters), 0, rows - 1);
            int dx = Math.Clamp((int)Math.Floor(dest.X / resolutionMeters), 0, cols - 1);
            int dy = Math.Clamp((int)Math.Floor(dest.Y / resolutionMeters), 0, rows - 1);
            return (sx, sy, dx, dy);
        }

        /// <summary>
        /// Calculates a route from a starting position to a product in a store, considering obstacles and grid resolution.
        /// </summary>
        /// <param name="routeDto">The route request containing store, product, start position, grid, and resolution.</param>
        /// <param name="cancellationToken">Token for cancelling the async operation.</param>
        /// <returns>A <see cref="RouteDto"/> with the calculated path, or null if not possible.</returns>
        public async Task<RouteDto?> CalculateRouteAsync(RouteRequestDto routeDto, CancellationToken cancellationToken = default)
        {
            if (routeDto == null)
                throw new ArgumentNullException(nameof(routeDto), "Route request cannot be null.");
            if (string.IsNullOrWhiteSpace(routeDto.StoreId))
                throw new ArgumentException("StoreId is required.", nameof(routeDto.StoreId));
            if (string.IsNullOrWhiteSpace(routeDto.ProductId))
                throw new ArgumentException("ProductId is required.", nameof(routeDto.ProductId));

            try
            {
                var (store, product, zones, shelves, productZones) = await LoadDataAsync(routeDto, cancellationToken);
                if (store == null || product == null) return null;

                var productPos = GetProductPosition(product, store, productZones, shelves, zones);

                var gridResolution = Math.Max(1, routeDto.GridResolutionMeters);

                var (grid, cols, rows) = BuildGrid(store, shelves, gridResolution);

                var start = routeDto.StartPosition ?? new PositionDto(0, 0);

                var (sx, sy, dx, dy) = GetGridIndices(start, productPos, gridResolution, cols, rows);

                for (int vy = dy - 1; vy <= dy + 1; vy++)
                {
                    string linha = "";
                    for (int vx = dx - 1; vx <= dx + 1; vx++)
                    {
                        if (vx < 0 || vy < 0 || vx >= cols || vy >= rows)
                        {
                            linha += "X";
                        }
                        else if (vx == dx && vy == dy)
                        {
                            linha += "D";
                        }
                        else
                        {
                            linha += grid[vx, vy] ? "." : "#";
                        }
                    }
                    Console.WriteLine(linha);
                }


                if (!grid[dx, dy])
                {
                    grid[dx, dy] = true;
                }
                if (!grid[sx, sy])
                {
                    return null;
                }

                var path = FindPath(grid, sx, sy, dx, dy);
                if (path == null || path.Count == 0)
                {
                    return null;
                }

                double distance = CalculateDistance(path);
                var steps = BuildSteps(path);
                return new RouteDto(routeDto.StoreId, routeDto.ProductId, path);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating route for product {ProductId} in store {StoreId}", routeDto?.ProductId, routeDto?.StoreId);
                return null;
            }
        }


        /// <summary>
        /// Loads all necessary data for route calculation from the file reader service.
        /// </summary>
        /// <param name="routeDto">The route request containing store and product IDs.</param>
        /// <param name="cancellationToken">Token for cancelling the async operation.</param>
        /// <returns>Tuple with store, product, zones, shelves, and product-zone mappings.</returns>
        private async Task<(
            StoreDto? store,
            ProductLocationDto? product,
            List<ZoneDto>? zones,
            List<ShelfDto>? shelves,
            List<StoreProductZoneDto>? productZones
            )> LoadDataAsync(RouteRequestDto routeDto, CancellationToken cancellationToken)
        {
            var stores = await _storeFileReader.LoadStoresAsync(_mockDataDir, cancellationToken);
            var products = await _storeFileReader.LoadProductsAsync(_mockDataDir, cancellationToken);
            var zones = await _storeFileReader.LoadStoreZonesAsync(_mockDataDir, cancellationToken);
            var shelves = await _storeFileReader.LoadStoreShelvesAsync(_mockDataDir, cancellationToken);
            var productZones = await _storeFileReader.LoadStoreProductZonesAsync(_mockDataDir, cancellationToken);
            var store = stores?.FirstOrDefault(s => string.Equals(s.StoreId, routeDto.StoreId, StringComparison.OrdinalIgnoreCase));
            var product = products?.FirstOrDefault(p => string.Equals(p.ProductId, routeDto.ProductId, StringComparison.OrdinalIgnoreCase));
            return (store, product, zones, shelves, productZones);
        }

        /// <summary>
        /// Determines the position of the product in the store, using direct coordinates, shelf, zone, or fallback.
        /// </summary>
        /// <param name="product">The product to locate.</param>
        /// <param name="store">The store context.</param>
        /// <param name="productZones">Mappings of products to zones/shelves.</param>
        /// <param name="shelves">List of shelves in the store.</param>
        /// <param name="zones">List of zones in the store.</param>
        /// <returns>The determined position of the product.</returns>
        private PositionDto GetProductPosition(ProductLocationDto product, StoreDto store, List<StoreProductZoneDto>? productZones, List<ShelfDto>? shelves, List<ZoneDto>? zones)
        {
            if (product.Position is not null)
                return product.Position;
            if (productZones != null)
            {
                var mapping = productZones.FirstOrDefault(m => string.Equals(m.ProductId, product.ProductId, StringComparison.OrdinalIgnoreCase)
                                                           && string.Equals(m.StoreId, store.StoreId, StringComparison.OrdinalIgnoreCase));
                if (mapping != null)
                {
                    if (!string.IsNullOrEmpty(mapping.ShelfId) && shelves != null)
                    {
                        var shelf = shelves.FirstOrDefault(s => s.Id == mapping.ShelfId);
                        if (shelf != null && shelf.Position != null)
                            return shelf.Position;
                    }
                    if (!string.IsNullOrEmpty(mapping.ZoneId) && zones != null)
                    {
                        var zone = zones.FirstOrDefault(z => z.ZoneId == mapping.ZoneId);
                        if (zone != null && zone.Position != null)
                            return zone.Position;
                    }
                }
            }
            if (store.GridDimensions != null && store.GridDimensions.Center != null)
                return store.GridDimensions.Center;
            return new PositionDto(0, 0);
        }

        /// <param name="dx">Destination X index.</param>
        /// <param name="dy">Destination Y index.</param>
        /// <returns>List of positions representing the path, or null if not found.</returns>
        private List<PositionDto>? FindPath(bool[,] grid, int sx, int sy, int dx, int dy)
        {
            return _aStarPathFinder.FindPath(grid, sx, sy, dx, dy);
        }

        // Método removido: ConvertPathToPositions não é mais necessário pois FindPath já retorna List<PositionDto>.

        /// <summary>
        /// Calculates the total distance of a path in real-world coordinates.
        /// </summary>
        /// <param name="realPath">List of positions in real-world coordinates.</param>
        /// <returns>Total distance in meters.</returns>
        private double CalculateDistance(List<PositionDto> realPath)
        {
            double distance = 0;
            for (int i = 1; i < realPath.Count; i++)
            {
                var dxm = realPath[i].X - realPath[i - 1].X;
                var dym = realPath[i].Y - realPath[i - 1].Y;
                distance += Math.Sqrt(dxm * dxm + dym * dym);
            }
            return distance;
        }

        /// <summary>
        /// Builds a list of step instructions from a path of positions.
        /// </summary>
        /// <param name="realPath">List of positions in real-world coordinates.</param>
        /// <returns>List of step instructions for the route.</returns>
        private List<StepDto> BuildSteps(List<PositionDto> realPath)
        {
            var steps = new List<StepDto>();
            for (int i = 0; i < realPath.Count; i++)
            {
                var description = i == 0 ? "start" : i == realPath.Count - 1 ? "destination" : null;
                steps.Add(new StepDto(realPath[i], description));
            }
            return steps;
        }

        /// <summary>
        /// Calculates the optimal route and returns both the path and zone-based navigation instructions.
        /// </summary>
        /// <param name="routeDto">The route request containing the store ID, product ID, and initial position.</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>An object with path and directions, or null if no route is found.</returns>
        public async Task<object?> GetRouteWithInstructionsAsync(RouteRequestDto routeDto, CancellationToken cancellationToken = default)
        {
            if (routeDto == null)
                throw new ArgumentNullException(nameof(routeDto), "Route request cannot be null.");
            if (string.IsNullOrWhiteSpace(routeDto.StoreId))
                throw new ArgumentException("StoreId is required.", nameof(routeDto.StoreId));
            if (string.IsNullOrWhiteSpace(routeDto.ProductId))
                throw new ArgumentException("ProductId is required.", nameof(routeDto.ProductId));

            try
            {
                var (store, product, zones, shelves, productZones) = await LoadDataAsync(routeDto, cancellationToken);
                if (store == null || product == null || zones == null) return null;

                var productPos = GetProductPosition(product, store, productZones, shelves, zones);
                var gridResolution = Math.Max(1, routeDto.GridResolutionMeters);
                var (grid, cols, rows) = BuildGrid(store, shelves, gridResolution);
                var start = routeDto.StartPosition ?? new PositionDto(0, 0);
                var (sx, sy, dx, dy) = GetGridIndices(start, productPos, gridResolution, cols, rows);

                // Ensure destination is walkable for pathfinding
                if (!grid[dx, dy]) grid[dx, dy] = true;
                if (!grid[sx, sy]) return null;

                var path = FindPath(grid, sx, sy, dx, dy);
                if (path == null || path.Count == 0) return null;

                // Convert grid indices to real-world positions
                var realPath = path.Select(p => new PositionDto(p.X * gridResolution, p.Y * gridResolution)).ToList();

                // For directions, convert path to List<(int x, int y)>
                var gridPath = path.Select(p => ((int)p.X, (int)p.Y)).ToList();
                var directions = RouteInstructionsHelper.GenerateDirections(gridPath, zones);

                // Build response object
                return new {
                    StoreId = routeDto.StoreId,
                    ProductId = routeDto.ProductId,
                    Path = realPath,
                    Directions = directions
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating route instructions for product {ProductId} in store {StoreId}", routeDto?.ProductId, routeDto?.StoreId);
                return null;
            }
        }
    }
}
