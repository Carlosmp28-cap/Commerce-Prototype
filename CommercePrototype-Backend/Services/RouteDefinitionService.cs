using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Models.Salesforce;
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
                    // compute shelf bounds
                    var shelfX0 = s.Position.X - s.Width / 2.0;
                    var shelfY0 = s.Position.Y - s.Height / 2.0;
                    var shelfX1 = s.Position.X + s.Width / 2.0;
                    var shelfY1 = s.Position.Y + s.Height / 2.0;
                    // shrink shelf footprint slightly to avoid blocking narrow aisles due to rounding
                    var shrink = 0.1; // meters
                    // shrink X dimension if shelf is wide enough
                    if (shelfX1 - shelfX0 > 2.0 * shrink)
                    {
                        shelfX0 += shrink;
                        shelfX1 -= shrink;
                    }
                    // shrink Y dimension if shelf is tall enough
                    if (shelfY1 - shelfY0 > 2.0 * shrink)
                    {
                        shelfY0 += shrink;
                        shelfY1 -= shrink;
                    }
                    Console.WriteLine($"[RouteDef] Shelf {s.Id} shrunk to [{shelfX0:F2},{shelfY0:F2}] - [{shelfX1:F2},{shelfY1:F2}]");
                    // examine overlapping cells and only mark blocked when shelf covers >50% of cell area
                    // mark any cell that overlaps the shelf as blocked (shelves are solid obstacles)
                    var gx0 = Math.Clamp((int)Math.Floor(shelfX0 / resolutionMeters), 0, cols - 1);
                    var gy0 = Math.Clamp((int)Math.Floor(shelfY0 / resolutionMeters), 0, rows - 1);
                    var gx1 = Math.Clamp((int)Math.Floor(shelfX1 / resolutionMeters), 0, cols - 1);
                    var gy1 = Math.Clamp((int)Math.Floor(shelfY1 / resolutionMeters), 0, rows - 1);
                    for (int gx = gx0; gx <= gx1; gx++)
                    {
                        for (int gy = gy0; gy <= gy1; gy++)
                        {
                            // cell bounds in world units
                            var cellX0 = gx * resolutionMeters;
                            var cellY0 = gy * resolutionMeters;
                            var cellX1 = cellX0 + resolutionMeters;
                            var cellY1 = cellY0 + resolutionMeters;
                            var overlapW = Math.Max(0.0, Math.Min(cellX1, shelfX1) - Math.Max(cellX0, shelfX0));
                            var overlapH = Math.Max(0.0, Math.Min(cellY1, shelfY1) - Math.Max(cellY0, shelfY0));
                            var overlapArea = overlapW * overlapH;
                            if (overlapArea > 0.0)
                            {
                                grid[gx, gy] = false;
                            }
                        }
                    }
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
                if (store == null || zones == null)
                    return null;

                var productPos = GetProductPosition(routeDto.ProductId, product, store, productZones, shelves, zones);

                var gridResolution = Math.Max(1, routeDto.GridResolutionMeters);
                var (grid, cols, rows) = BuildGrid(store, shelves, gridResolution);
                var start = routeDto.StartPosition ?? new PositionDto(0, 0);

                var (sx, sy, dx, dy) = GetGridIndices(start, productPos, gridResolution, cols, rows);
                var debugMessages = new List<string>();
                _logger.LogInformation("Grid indices - start: ({sx},{sy}) dest: ({dx},{dy})", sx, sy, dx, dy);
                Console.WriteLine($"[RouteDef] Grid indices - start: ({sx},{sy}) dest: ({dx},{dy})");

                // log a small neighborhood around destination to help debugging
                var sb = new System.Text.StringBuilder();
                for (int vy = Math.Max(0, dy - 2); vy <= Math.Min(rows - 1, dy + 2); vy++)
                {
                    for (int vx = Math.Max(0, dx - 2); vx <= Math.Min(cols - 1, dx + 2); vx++)
                    {
                        if (vx == dx && vy == dy) sb.Append('D');
                        else sb.Append(grid[vx, vy] ? '.' : '#');
                    }
                    sb.AppendLine();
                }
                _logger.LogInformation("Destination neighborhood:\n{GridSnippet}", sb.ToString());
                Console.WriteLine("[RouteDef] Destination neighborhood:\n" + sb.ToString());

                // Ensure destination cell is walkable. If the destination cell is blocked by a shelf,
                // carve a small square of cells centered at the destination to provide access to the product
                // (product is always located on a shelf). Record debug messages for diagnostics.
                if (!grid[dx, dy])
                {
                    // Find the shelf that contains the product position
                    ShelfDto? targetShelf = null;
                    if (shelves != null)
                    {
                        targetShelf = shelves.FirstOrDefault(s =>
                            s.Position != null &&
                            productPos.X >= (s.Position.X - s.Width / 2.0) && productPos.X <= (s.Position.X + s.Width / 2.0) &&
                            productPos.Y >= (s.Position.Y - s.Height / 2.0) && productPos.Y <= (s.Position.Y + s.Height / 2.0)
                        );
                    }

                    int carveRadius = 1; // creates a (2*carveRadius+1) square; change if you want larger access
                    var carvedCells = new List<(int x, int y)>();

                    // helper to compute shrunk bounds like BuildGrid (same shrink value)
                    double shrink = 0.1;
                    double shelfX0 = 0, shelfY0 = 0, shelfX1 = 0, shelfY1 = 0;
                    double origShelfX0 = 0, origShelfY0 = 0, origShelfX1 = 0, origShelfY1 = 0;
                    if (targetShelf != null && targetShelf.Position != null)
                    {
                        origShelfX0 = targetShelf.Position.X - targetShelf.Width / 2.0;
                        origShelfY0 = targetShelf.Position.Y - targetShelf.Height / 2.0;
                        origShelfX1 = targetShelf.Position.X + targetShelf.Width / 2.0;
                        origShelfY1 = targetShelf.Position.Y + targetShelf.Height / 2.0;

                        shelfX0 = origShelfX0;
                        shelfY0 = origShelfY0;
                        shelfX1 = origShelfX1;
                        shelfY1 = origShelfY1;

                        if (shelfX1 - shelfX0 > 2.0 * shrink)
                        {
                            shelfX0 += shrink;
                            shelfX1 -= shrink;
                        }
                        if (shelfY1 - shelfY0 > 2.0 * shrink)
                        {
                            shelfY0 += shrink;
                            shelfY1 -= shrink;
                        }
                    }

                    // compute grid cell span for the (shrunk) target shelf
                    var gx0Shelf = Math.Clamp((int)Math.Floor(shelfX0 / gridResolution), 0, cols - 1);
                    var gy0Shelf = Math.Clamp((int)Math.Floor(shelfY0 / gridResolution), 0, rows - 1);
                    var gx1Shelf = Math.Clamp((int)Math.Floor(shelfX1 / gridResolution), 0, cols - 1);
                    var gy1Shelf = Math.Clamp((int)Math.Floor(shelfY1 / gridResolution), 0, rows - 1);

                    int shelfWidthCells = Math.Max(0, gx1Shelf - gx0Shelf + 1);
                    int shelfHeightCells = Math.Max(0, gy1Shelf - gy0Shelf + 1);

                    // If we have a valid target shelf, carve a thin corridor inside it aligned with its longer axis.
                    // The corridor will be 1 cell thick in the smaller axis and span the full length in the larger axis.
                    if (targetShelf != null && shelfWidthCells > 0 && shelfHeightCells > 0)
                    {
                        // existing corridor carving logic (unchanged)
                        if (shelfWidthCells >= shelfHeightCells)
                        {
                            var carveRow = Math.Clamp(dy, gy0Shelf, gy1Shelf);
                            for (int gx = gx0Shelf; gx <= gx1Shelf; gx++)
                            {
                                var cellX0 = gx * gridResolution;
                                var cellY0 = carveRow * gridResolution;
                                var cellX1 = cellX0 + gridResolution;
                                var cellY1 = cellY0 + gridResolution;

                                var overlapW = Math.Max(0.0, Math.Min(cellX1, shelfX1) - Math.Max(cellX0, shelfX0));
                                var overlapH = Math.Max(0.0, Math.Min(cellY1, shelfY1) - Math.Max(cellY0, shelfY0));
                                if (overlapW * overlapH <= 0.0) continue;

                                bool overlappedByOther = false;
                                if (shelves != null)
                                {
                                    foreach (var s in shelves)
                                    {
                                        if (s == targetShelf) continue;
                                        if (s.Position == null) continue;
                                        var sx0 = s.Position.X - s.Width / 2.0;
                                        var sy0 = s.Position.Y - s.Height / 2.0;
                                        var sx1 = s.Position.X + s.Width / 2.0;
                                        var sy1 = s.Position.Y + s.Height / 2.0;
                                        if (sx1 - sx0 > 2.0 * shrink) { sx0 += shrink; sx1 -= shrink; }
                                        if (sy1 - sy0 > 2.0 * shrink) { sy0 += shrink; sy1 -= shrink; }
                                        var oW = Math.Max(0.0, Math.Min(cellX1, sx1) - Math.Max(cellX0, sx0));
                                        var oH = Math.Max(0.0, Math.Min(cellY1, sy1) - Math.Max(cellY0, sy0));
                                        if (oW * oH > 0.0)
                                        {
                                            overlappedByOther = true;
                                            break;
                                        }
                                    }
                                }

                                if (overlappedByOther) continue;

                                if (!grid[gx, carveRow])
                                {
                                    grid[gx, carveRow] = true; // temporary carve
                                    carvedCells.Add((gx, carveRow));
                                }
                            }
                        }
                        else
                        {
                            var carveCol = Math.Clamp(dx, gx0Shelf, gx1Shelf);
                            for (int gy = gy0Shelf; gy <= gy1Shelf; gy++)
                            {
                                var cellX0 = carveCol * gridResolution;
                                var cellY0 = gy * gridResolution;
                                var cellX1 = cellX0 + gridResolution;
                                var cellY1 = cellY0 + gridResolution;

                                var overlapW = Math.Max(0.0, Math.Min(cellX1, shelfX1) - Math.Max(cellX0, shelfX0));
                                var overlapH = Math.Max(0.0, Math.Min(cellY1, shelfY1) - Math.Max(cellY0, shelfY0));
                                if (overlapW * overlapH <= 0.0) continue;

                                bool overlappedByOther = false;
                                if (shelves != null)
                                {
                                    foreach (var s in shelves)
                                    {
                                        if (s == targetShelf) continue;
                                        if (s.Position == null) continue;
                                        var sx0 = s.Position.X - s.Width / 2.0;
                                        var sy0 = s.Position.Y - s.Height / 2.0;
                                        var sx1 = s.Position.X + s.Width / 2.0;
                                        var sy1 = s.Position.Y + s.Height / 2.0;
                                        if (sx1 - sx0 > 2.0 * shrink) { sx0 += shrink; sx1 -= shrink; }
                                        if (sy1 - sy0 > 2.0 * shrink) { sy0 += shrink; sy1 -= shrink; }
                                        var oW = Math.Max(0.0, Math.Min(cellX1, sx1) - Math.Max(cellX0, sx0));
                                        var oH = Math.Max(0.0, Math.Min(cellY1, sy1) - Math.Max(cellY0, sy0));
                                        if (oW * oH > 0.0)
                                        {
                                            overlappedByOther = true;
                                            break;
                                        }
                                    }
                                }

                                if (overlappedByOther) continue;

                                if (!grid[carveCol, gy])
                                {
                                    grid[carveCol, gy] = true; // temporary carve
                                    carvedCells.Add((carveCol, gy));
                                }
                            }
                        }

                        // If corridor carve didn't find any cells (possible when shrunk shelf spans >0 cells mas carveRow/Col had none),
                        // fall through to try narrower fallback below.
                    }

                    // If targetShelf exists mas shrunk footprint produced zero cells (narrow shelf), try carving a safe cell inside the original shelf footprint.
                    if (targetShelf != null && carvedCells.Count == 0)
                    {
                        // compute original integer cell span for the shelf (no shrink) to find candidate cells
                        var cgx0 = Math.Clamp((int)Math.Floor(origShelfX0 / gridResolution), 0, cols - 1);
                        var cgy0 = Math.Clamp((int)Math.Floor(origShelfY0 / gridResolution), 0, rows - 1);
                        var cgx1 = Math.Clamp((int)Math.Floor(origShelfX1 / gridResolution), 0, cols - 1);
                        var cgy1 = Math.Clamp((int)Math.Floor(origShelfY1 / gridResolution), 0, rows - 1);

                        var candidates = new List<(int gx, int gy)>();
                        for (int gx = cgx0; gx <= cgx1; gx++)
                        {
                            for (int gy = cgy0; gy <= cgy1; gy++)
                            {
                                // cell bounds
                                var cellX0 = gx * gridResolution;
                                var cellY0 = gy * gridResolution;
                                var cellX1 = cellX0 + gridResolution;
                                var cellY1 = cellY0 + gridResolution;
                                var overlapW = Math.Max(0.0, Math.Min(cellX1, origShelfX1) - Math.Max(cellX0, origShelfX0));
                                var overlapH = Math.Max(0.0, Math.Min(cellY1, origShelfY1) - Math.Max(cellY0, origShelfY0));
                                if (overlapW * overlapH <= 0.0) continue; // cell doesn't intersect original shelf

                                // ensure not overlapped by another shelf (use shrunk other shelves for safety)
                                bool overlappedByOther = false;
                                if (shelves != null)
                                {
                                    foreach (var s in shelves)
                                    {
                                        if (s == targetShelf) continue;
                                        if (s.Position == null) continue;
                                        var sx0 = s.Position.X - s.Width / 2.0;
                                        var sy0 = s.Position.Y - s.Height / 2.0;
                                        var sx1 = s.Position.X + s.Width / 2.0;
                                        var sy1 = s.Position.Y + s.Height / 2.0;
                                        if (sx1 - sx0 > 2.0 * shrink) { sx0 += shrink; sx1 -= shrink; }
                                        if (sy1 - sy0 > 2.0 * shrink) { sy0 += shrink; sy1 -= shrink; }
                                        var oW = Math.Max(0.0, Math.Min(cellX1, sx1) - Math.Max(cellX0, sx0));
                                        var oH = Math.Max(0.0, Math.Min(cellY1, sy1) - Math.Max(cellY0, sy0));
                                        if (oW * oH > 0.0)
                                        {
                                            overlappedByOther = true;
                                            break;
                                        }
                                    }
                                }
                                if (overlappedByOther) continue;

                                candidates.Add((gx, gy));
                            }
                        }

                        if (candidates.Count > 0)
                        {
                            // pick candidate closest to destination cell (dx,dy)
                            var best = candidates.OrderBy(c => (c.gx - dx) * (c.gx - dx) + (c.gy - dy) * (c.gy - dy)).First();
                            if (!grid[best.gx, best.gy])
                            {
                                grid[best.gx, best.gy] = true;
                                carvedCells.Add((best.gx, best.gy));
                                var cmsg = $"Carved narrow-shelf fallback cell ({best.gx},{best.gy}) inside original shelf footprint to allow access";
                                debugMessages.Add(cmsg);
                                _logger.LogInformation(cmsg);
                                Console.WriteLine("[RouteDef] " + cmsg);
                            }
                        }
                    }

                    // If still nothing carved, fallback to previous behaviour: carve small square around destination
                    if (carvedCells.Count == 0 && (targetShelf == null || (targetShelf != null && (shelfWidthCells == 0 || shelfHeightCells == 0))))
                    {
                        for (int cx = dx - carveRadius; cx <= dx + carveRadius; cx++)
                        {
                            for (int cy = dy - carveRadius; cy <= dy + carveRadius; cy++)
                            {
                                if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) continue;
                                if (!grid[cx, cy])
                                {
                                    grid[cx, cy] = true;
                                    carvedCells.Add((cx, cy));
                                }
                            }
                        }
                    }

                    if (carvedCells.Count > 0)
                    {
                        var cmsg = $"Carved corridor/area to allow access: {string.Join(';', carvedCells.Select(c => $"({c.x},{c.y})"))}";
                        debugMessages.Add(cmsg);
                        _logger.LogInformation(cmsg);
                        Console.WriteLine("[RouteDef] " + cmsg);
                    }
                    else
                    {
                        var fmsg = $"No carve performed for destination ({dx},{dy}); leaving destination cell as blocked";
                        debugMessages.Add(fmsg);
                        _logger.LogInformation(fmsg);
                        Console.WriteLine("[RouteDef] " + fmsg);
                        // keep destination blocked here; connectivity check will fail and we will return null
                    }
                }
                if (!grid[sx, sy])
                {
                    _logger.LogWarning("Start grid cell ({sx},{sy}) is blocked - cannot find route", sx, sy);
                    Console.WriteLine($"[RouteDef] Start grid cell ({sx},{sy}) is blocked - cannot find route");
                    return null;
                }

                // Quick connectivity check before running A*: helps diagnose full blockage
                var reachable = IsReachable(grid, sx, sy, dx, dy);
                _logger.LogInformation("Connectivity check - reachable: {Reachable}", reachable);
                Console.WriteLine($"[RouteDef] Connectivity check - reachable: {reachable}");
                if (!reachable)
                {
                    _logger.LogWarning("Destination not reachable from start (connectivity check failed) - aborting (exact target required)");
                    Console.WriteLine("[RouteDef] Destination not reachable from start (connectivity check failed) - aborting (exact target required)");
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

            if (!string.IsNullOrWhiteSpace(routeDto.StoreId))
            {
                if (zones != null)
                    zones = zones.Where(z => string.Equals(z.StoreId, routeDto.StoreId, StringComparison.OrdinalIgnoreCase)).ToList();
                if (shelves != null)
                    shelves = shelves.Where(s => string.Equals(s.StoreId, routeDto.StoreId, StringComparison.OrdinalIgnoreCase)).ToList();
                if (productZones != null)
                    productZones = productZones.Where(pz => string.Equals(pz.StoreId, routeDto.StoreId, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Ensure productZones list is non-null for synthetic append
            productZones ??= new List<StoreProductZoneDto>();
            // Append synthetic product mappings for all shelves to support many new products
            // AppendSyntheticProductZonesForShelves(routeDto.StoreId, shelves, productZones);
            // Synthetic generation disabled
            
            var store = stores?.FirstOrDefault(s => string.Equals(s.StoreId, routeDto.StoreId, StringComparison.OrdinalIgnoreCase));
            var product = products?.FirstOrDefault(p => string.Equals(p.ProductId, routeDto.ProductId, StringComparison.OrdinalIgnoreCase));
            return (store, product, zones, shelves, productZones);
        }

        private void AppendSyntheticProductZonesForShelves(string? storeId, List<ShelfDto>? shelves, List<StoreProductZoneDto>? productZones)
        {
            if (shelves == null) return;
            if (productZones == null) return;
            var shelvesForScope = string.IsNullOrWhiteSpace(storeId)
                ? shelves
                : shelves.Where(s => string.Equals(s.StoreId, storeId, StringComparison.OrdinalIgnoreCase)).ToList();
            foreach (var shelf in shelvesForScope)
            {
                if (shelf == null || shelf.Position == null || string.IsNullOrWhiteSpace(shelf.Id) || string.IsNullOrWhiteSpace(shelf.StoreId)) continue;
                double[] offs = new double[] { -0.3, -0.1, 0.1, 0.3 };
                double[] xoffs = new double[] { -0.05, 0.05, -0.1, 0.1 };
                for (int i = 0; i < 4; i++)
                {
                    var idx = i + 1;
                    var pid = $"SKU_SYN_{shelf.Id}_{idx:D2}";
                    // coordinates inside shelf bounds
                    var px = shelf.Position.X;
                    var py = shelf.Position.Y;
                    if (shelf.Width > 0 && shelf.Height > 0)
                    {
                        var oy = offs[i] * Math.Max(0.4, shelf.Height / 2.0 - 0.1);
                        var ox = xoffs[i] * Math.Max(0.4, shelf.Width / 2.0 - 0.05);
                        py = Math.Clamp(shelf.Position.Y + oy, shelf.Position.Y - shelf.Height / 2.0 + 0.05, shelf.Position.Y + shelf.Height / 2.0 - 0.05);
                        px = Math.Clamp(shelf.Position.X + ox, shelf.Position.X - shelf.Width / 2.0 + 0.05, shelf.Position.X + shelf.Width / 2.0 - 0.05);
                    }
                    productZones.Add(new StoreProductZoneDto
                    {
                        ProductId = pid,
                        StoreId = shelf.StoreId,
                        ShelfId = shelf.Id,
                        ZoneId = shelf.ZoneId,
                        X = px,
                        Y = py,
                        ProductName = $"Produto {shelf.Id} #{idx}"
                    });
                }
            }
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
        private PositionDto GetProductPosition(string productId, ProductLocationDto? product, StoreDto store, List<StoreProductZoneDto>? productZones, List<ShelfDto>? shelves, List<ZoneDto>? zones)
        {
            if (product?.Position is not null)
                return product.Position;
            if (productZones != null)
            {
                var mapping = productZones.FirstOrDefault(m => string.Equals(m.ProductId, productId, StringComparison.OrdinalIgnoreCase)
                                                           && string.Equals(m.StoreId, store.StoreId, StringComparison.OrdinalIgnoreCase));
                if (mapping != null)
                {
                    if (!string.IsNullOrEmpty(mapping.ShelfId) && shelves != null)
                    {
                        var shelf = shelves.FirstOrDefault(s => s.Id == mapping.ShelfId);
                        if (shelf != null && shelf.Position != null)
                        {
                            // if mapping has explicit X/Y, use them if they fall inside the shelf bounds
                            if (mapping.X.HasValue && mapping.Y.HasValue)
                            {
                                var sx0 = shelf.Position.X - shelf.Width / 2.0;
                                var sy0 = shelf.Position.Y - shelf.Height / 2.0;
                                var sx1 = shelf.Position.X + shelf.Width / 2.0;
                                var sy1 = shelf.Position.Y + shelf.Height / 2.0;
                                var px = mapping.X.Value;
                                var py = mapping.Y.Value;
                                if (px >= sx0 && px <= sx1 && py >= sy0 && py <= sy1)
                                {
                                    return new PositionDto(px, py);
                                }
                            }
                            // fallback: use shelf center
                            return shelf.Position;
                        }
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
        /// <returns>An object with Path, Directions and DebugMessages, or null if no route is found.</returns>
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
                _logger.LogInformation("GetRouteWithInstructionsAsync start - Store={StoreId} Product={ProductId}", routeDto.StoreId, routeDto.ProductId);
                Console.WriteLine($"[RouteDef] GetRouteWithInstructionsAsync start - Store={routeDto.StoreId} Product={routeDto.ProductId}");

                var (store, product, zones, shelves, productZones) = await LoadDataAsync(routeDto, cancellationToken);
                _logger.LogInformation("Loaded data - store present: {HasStore}, product present: {HasProduct}, zones: {ZonesCount}, shelves: {ShelvesCount}, mappings: {MappingsCount}",
                    store != null, product != null, zones?.Count ?? 0, shelves?.Count ?? 0, productZones?.Count ?? 0);
                Console.WriteLine($"[RouteDef] Loaded data - store:{store != null} product:{product != null} zones:{zones?.Count ?? 0} shelves:{shelves?.Count ?? 0} mappings:{productZones?.Count ?? 0}");

                if (store == null || product == null || zones == null)
                {
                    _logger.LogWarning("Missing required data - aborting route generation");
                    return null;
                }

                var productPos = GetProductPosition(routeDto.ProductId, product, store, productZones, shelves, zones);
                _logger.LogInformation("Product position determined: {X},{Y}", productPos?.X, productPos?.Y);
                Console.WriteLine($"[RouteDef] Product position: {productPos?.X},{productPos?.Y}");

                var gridResolution = Math.Max(1, routeDto.GridResolutionMeters);
                var (grid, cols, rows) = BuildGrid(store, shelves, gridResolution);
                _logger.LogInformation("Grid built - cols: {Cols}, rows: {Rows}, resolution: {Res}", cols, rows, gridResolution);
                Console.WriteLine($"[RouteDef] Grid built - cols:{cols} rows:{rows} resolution:{gridResolution}");

                var start = routeDto.StartPosition ?? new PositionDto(0, 0);
                _logger.LogInformation("Start position: {SX},{SY}", start.X, start.Y);
                Console.WriteLine($"[RouteDef] Start position: {start.X},{start.Y}");

                var (sx, sy, dx, dy) = GetGridIndices(start, productPos, gridResolution, cols, rows);
                var debugMessages = new List<string>();
                _logger.LogInformation("Grid indices - start: ({sx},{sy}) dest: ({dx},{dy})", sx, sy, dx, dy);
                Console.WriteLine($"[RouteDef] Grid indices - start: ({sx},{sy}) dest: ({dx},{dy})");

                // log a small neighborhood around destination to help debugging
                var sb = new System.Text.StringBuilder();
                for (int vy = Math.Max(0, dy - 2); vy <= Math.Min(rows - 1, dy + 2); vy++)
                {
                    for (int vx = Math.Max(0, dx - 2); vx <= Math.Min(cols - 1, dx + 2); vx++)
                    {
                        if (vx == dx && vy == dy) sb.Append('D');
                        else sb.Append(grid[vx, vy] ? '.' : '#');
                    }
                    sb.AppendLine();
                }
                _logger.LogInformation("Destination neighborhood:\n{GridSnippet}", sb.ToString());
                Console.WriteLine("[RouteDef] Destination neighborhood:\n" + sb.ToString());

                // Ensure destination cell is walkable. If the destination cell is blocked by a shelf,
                // carve a small square of cells centered at the destination to provide access to the product
                // (product is always located on a shelf). Record debug messages for diagnostics.
                if (!grid[dx, dy])
                {
                    // Find the shelf that contains the product position
                    ShelfDto? targetShelf = null;
                    if (shelves != null)
                    {
                        targetShelf = shelves.FirstOrDefault(s =>
                            s.Position != null &&
                            productPos.X >= (s.Position.X - s.Width / 2.0) && productPos.X <= (s.Position.X + s.Width / 2.0) &&
                            productPos.Y >= (s.Position.Y - s.Height / 2.0) && productPos.Y <= (s.Position.Y + s.Height / 2.0)
                        );
                    }

                    int carveRadius = 1; // creates a (2*carveRadius+1) square; change if you want larger access
                    var carvedCells = new List<(int x, int y)>();

                    // helper to compute shrunk bounds like BuildGrid (same shrink value)
                    double shrink = 0.1;
                    double shelfX0 = 0, shelfY0 = 0, shelfX1 = 0, shelfY1 = 0;
                    double origShelfX0 = 0, origShelfY0 = 0, origShelfX1 = 0, origShelfY1 = 0;
                    if (targetShelf != null && targetShelf.Position != null)
                    {
                        origShelfX0 = targetShelf.Position.X - targetShelf.Width / 2.0;
                        origShelfY0 = targetShelf.Position.Y - targetShelf.Height / 2.0;
                        origShelfX1 = targetShelf.Position.X + targetShelf.Width / 2.0;
                        origShelfY1 = targetShelf.Position.Y + targetShelf.Height / 2.0;

                        shelfX0 = origShelfX0;
                        shelfY0 = origShelfY0;
                        shelfX1 = origShelfX1;
                        shelfY1 = origShelfY1;

                        if (shelfX1 - shelfX0 > 2.0 * shrink)
                        {
                            shelfX0 += shrink;
                            shelfX1 -= shrink;
                        }
                        if (shelfY1 - shelfY0 > 2.0 * shrink)
                        {
                            shelfY0 += shrink;
                            shelfY1 -= shrink;
                        }
                    }

                    // compute grid cell span for the (shrunk) target shelf
                    var gx0Shelf = Math.Clamp((int)Math.Floor(shelfX0 / gridResolution), 0, cols - 1);
                    var gy0Shelf = Math.Clamp((int)Math.Floor(shelfY0 / gridResolution), 0, rows - 1);
                    var gx1Shelf = Math.Clamp((int)Math.Floor(shelfX1 / gridResolution), 0, cols - 1);
                    var gy1Shelf = Math.Clamp((int)Math.Floor(shelfY1 / gridResolution), 0, rows - 1);

                    int shelfWidthCells = Math.Max(0, gx1Shelf - gx0Shelf + 1);
                    int shelfHeightCells = Math.Max(0, gy1Shelf - gy0Shelf + 1);

                    // If we have a valid target shelf, carve a thin corridor inside it aligned with its longer axis.
                    // The corridor will be 1 cell thick in the smaller axis and span the full length in the larger axis.
                    if (targetShelf != null && shelfWidthCells > 0 && shelfHeightCells > 0)
                    {
                        // existing corridor carving logic (unchanged)
                        if (shelfWidthCells >= shelfHeightCells)
                        {
                            var carveRow = Math.Clamp(dy, gy0Shelf, gy1Shelf);
                            for (int gx = gx0Shelf; gx <= gx1Shelf; gx++)
                            {
                                var cellX0 = gx * gridResolution;
                                var cellY0 = carveRow * gridResolution;
                                var cellX1 = cellX0 + gridResolution;
                                var cellY1 = cellY0 + gridResolution;

                                var overlapW = Math.Max(0.0, Math.Min(cellX1, shelfX1) - Math.Max(cellX0, shelfX0));
                                var overlapH = Math.Max(0.0, Math.Min(cellY1, shelfY1) - Math.Max(cellY0, shelfY0));
                                if (overlapW * overlapH <= 0.0) continue;

                                bool overlappedByOther = false;
                                if (shelves != null)
                                {
                                    foreach (var s in shelves)
                                    {
                                        if (s == targetShelf) continue;
                                        if (s.Position == null) continue;
                                        var sx0 = s.Position.X - s.Width / 2.0;
                                        var sy0 = s.Position.Y - s.Height / 2.0;
                                        var sx1 = s.Position.X + s.Width / 2.0;
                                        var sy1 = s.Position.Y + s.Height / 2.0;
                                        if (sx1 - sx0 > 2.0 * shrink) { sx0 += shrink; sx1 -= shrink; }
                                        if (sy1 - sy0 > 2.0 * shrink) { sy0 += shrink; sy1 -= shrink; }
                                        var oW = Math.Max(0.0, Math.Min(cellX1, sx1) - Math.Max(cellX0, sx0));
                                        var oH = Math.Max(0.0, Math.Min(cellY1, sy1) - Math.Max(cellY0, sy0));
                                        if (oW * oH > 0.0)
                                        {
                                            overlappedByOther = true;
                                            break;
                                        }
                                    }
                                }

                                if (overlappedByOther) continue;

                                if (!grid[gx, carveRow])
                                {
                                    grid[gx, carveRow] = true; // temporary carve
                                    carvedCells.Add((gx, carveRow));
                                }
                            }
                        }
                        else
                        {
                            var carveCol = Math.Clamp(dx, gx0Shelf, gx1Shelf);
                            for (int gy = gy0Shelf; gy <= gy1Shelf; gy++)
                            {
                                var cellX0 = carveCol * gridResolution;
                                var cellY0 = gy * gridResolution;
                                var cellX1 = cellX0 + gridResolution;
                                var cellY1 = cellY0 + gridResolution;

                                var overlapW = Math.Max(0.0, Math.Min(cellX1, shelfX1) - Math.Max(cellX0, shelfX0));
                                var overlapH = Math.Max(0.0, Math.Min(cellY1, shelfY1) - Math.Max(cellY0, shelfY0));
                                if (overlapW * overlapH <= 0.0) continue;

                                bool overlappedByOther = false;
                                if (shelves != null)
                                {
                                    foreach (var s in shelves)
                                    {
                                        if (s == targetShelf) continue;
                                        if (s.Position == null) continue;
                                        var sx0 = s.Position.X - s.Width / 2.0;
                                        var sy0 = s.Position.Y - s.Height / 2.0;
                                        var sx1 = s.Position.X + s.Width / 2.0;
                                        var sy1 = s.Position.Y + s.Height / 2.0;
                                        if (sx1 - sx0 > 2.0 * shrink) { sx0 += shrink; sx1 -= shrink; }
                                        if (sy1 - sy0 > 2.0 * shrink) { sy0 += shrink; sy1 -= shrink; }
                                        var oW = Math.Max(0.0, Math.Min(cellX1, sx1) - Math.Max(cellX0, sx0));
                                        var oH = Math.Max(0.0, Math.Min(cellY1, sy1) - Math.Max(cellY0, sy0));
                                        if (oW * oH > 0.0)
                                        {
                                            overlappedByOther = true;
                                            break;
                                        }
                                    }
                                }

                                if (overlappedByOther) continue;

                                if (!grid[carveCol, gy])
                                {
                                    grid[carveCol, gy] = true; // temporary carve
                                    carvedCells.Add((carveCol, gy));
                                }
                            }
                        }

                        // If corridor carve didn't find any cells (possible when shrunk shelf spans >0 cells mas carveRow/Col had none),
                        // fall through to try narrower fallback below.
                    }

                    // If targetShelf exists mas shrunk footprint produced zero cells (narrow shelf), try carving a safe cell inside the original shelf footprint.
                    if (targetShelf != null && carvedCells.Count == 0)
                    {
                        // compute original integer cell span for the shelf (no shrink) to find candidate cells
                        var cgx0 = Math.Clamp((int)Math.Floor(origShelfX0 / gridResolution), 0, cols - 1);
                        var cgy0 = Math.Clamp((int)Math.Floor(origShelfY0 / gridResolution), 0, rows - 1);
                        var cgx1 = Math.Clamp((int)Math.Floor(origShelfX1 / gridResolution), 0, cols - 1);
                        var cgy1 = Math.Clamp((int)Math.Floor(origShelfY1 / gridResolution), 0, rows - 1);

                        var candidates = new List<(int gx, int gy)>();
                        for (int gx = cgx0; gx <= cgx1; gx++)
                        {
                            for (int gy = cgy0; gy <= cgy1; gy++)
                            {
                                // cell bounds
                                var cellX0 = gx * gridResolution;
                                var cellY0 = gy * gridResolution;
                                var cellX1 = cellX0 + gridResolution;
                                var cellY1 = cellY0 + gridResolution;
                                var overlapW = Math.Max(0.0, Math.Min(cellX1, origShelfX1) - Math.Max(cellX0, origShelfX0));
                                var overlapH = Math.Max(0.0, Math.Min(cellY1, origShelfY1) - Math.Max(cellY0, origShelfY0));
                                if (overlapW * overlapH <= 0.0) continue; // cell doesn't intersect original shelf

                                // ensure not overlapped by another shelf (use shrunk other shelves for safety)
                                bool overlappedByOther = false;
                                if (shelves != null)
                                {
                                    foreach (var s in shelves)
                                    {
                                        if (s == targetShelf) continue;
                                        if (s.Position == null) continue;
                                        var sx0 = s.Position.X - s.Width / 2.0;
                                        var sy0 = s.Position.Y - s.Height / 2.0;
                                        var sx1 = s.Position.X + s.Width / 2.0;
                                        var sy1 = s.Position.Y + s.Height / 2.0;
                                        if (sx1 - sx0 > 2.0 * shrink) { sx0 += shrink; sx1 -= shrink; }
                                        if (sy1 - sy0 > 2.0 * shrink) { sy0 += shrink; sy1 -= shrink; }
                                        var oW = Math.Max(0.0, Math.Min(cellX1, sx1) - Math.Max(cellX0, sx0));
                                        var oH = Math.Max(0.0, Math.Min(cellY1, sy1) - Math.Max(cellY0, sy0));
                                        if (oW * oH > 0.0)
                                        {
                                            overlappedByOther = true;
                                            break;
                                        }
                                    }
                                }
                                if (overlappedByOther) continue;

                                candidates.Add((gx, gy));
                            }
                        }

                        if (candidates.Count > 0)
                        {
                            // pick candidate closest to destination cell (dx,dy)
                            var best = candidates.OrderBy(c => (c.gx - dx) * (c.gx - dx) + (c.gy - dy) * (c.gy - dy)).First();
                            if (!grid[best.gx, best.gy])
                            {
                                grid[best.gx, best.gy] = true;
                                carvedCells.Add((best.gx, best.gy));
                                var cmsg = $"Carved narrow-shelf fallback cell ({best.gx},{best.gy}) inside original shelf footprint to allow access";
                                debugMessages.Add(cmsg);
                                _logger.LogInformation(cmsg);
                                Console.WriteLine("[RouteDef] " + cmsg);
                            }
                        }
                    }

                    // If still nothing carved, fallback to previous behaviour: carve small square around destination
                    if (carvedCells.Count == 0 && (targetShelf == null || (targetShelf != null && (shelfWidthCells == 0 || shelfHeightCells == 0))))
                    {
                        for (int cx = dx - carveRadius; cx <= dx + carveRadius; cx++)
                        {
                            for (int cy = dy - carveRadius; cy <= dy + carveRadius; cy++)
                            {
                                if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) continue;
                                if (!grid[cx, cy])
                                {
                                    grid[cx, cy] = true;
                                    carvedCells.Add((cx, cy));
                                }
                            }
                        }
                    }

                    if (carvedCells.Count > 0)
                    {
                        var cmsg = $"Carved corridor/area to allow access: {string.Join(';', carvedCells.Select(c => $"({c.x},{c.y})"))}";
                        debugMessages.Add(cmsg);
                        _logger.LogInformation(cmsg);
                        Console.WriteLine("[RouteDef] " + cmsg);
                    }
                    else
                    {
                        var fmsg = $"No carve performed for destination ({dx},{dy}); leaving destination cell as blocked";
                        debugMessages.Add(fmsg);
                        _logger.LogInformation(fmsg);
                        Console.WriteLine("[RouteDef] " + fmsg);
                        // keep destination blocked here; connectivity check will fail and we will return null
                    }
                }
                if (!grid[sx, sy])
                {
                    _logger.LogWarning("Start grid cell ({sx},{sy}) is blocked - cannot find route", sx, sy);
                    Console.WriteLine($"[RouteDef] Start grid cell ({sx},{sy}) is blocked - cannot find route");
                    return null;
                }

                // Quick connectivity check before running A*: helps diagnose full blockage
                var reachable = IsReachable(grid, sx, sy, dx, dy);
                _logger.LogInformation("Connectivity check - reachable: {Reachable}", reachable);
                Console.WriteLine($"[RouteDef] Connectivity check - reachable: {reachable}");
                if (!reachable)
                {
                    _logger.LogWarning("Destination not reachable from start (connectivity check failed) - aborting (exact target required)");
                    Console.WriteLine("[RouteDef] Destination not reachable from start (connectivity check failed) - aborting (exact target required)");
                    return null;
                }

                var path = FindPath(grid, sx, sy, dx, dy);
                if (path == null)
                {
                    _logger.LogWarning("Pathfinder returned null");
                    Console.WriteLine("[RouteDef] Pathfinder returned null");
                    return null;
                }
                _logger.LogInformation("Path found with {Count} nodes", path.Count);
                Console.WriteLine($"[RouteDef] Path found with {path.Count} nodes");

                // Convert grid indices to real-world positions (use cell centers)
                var realPath = path.Select(p => new PositionDto((p.X + 0.5) * gridResolution, (p.Y + 0.5) * gridResolution)).ToList();

                // For directions, convert path to List<(int x, int y)>
                var gridPath = path.Select(p => ((int)p.X, (int)p.Y)).ToList();
                var directions = RouteInstructionsHelper.GenerateDirections(gridPath, zones);

                // Build response object
                _logger.LogInformation("GetRouteWithInstructionsAsync completed successfully");
                Console.WriteLine("[RouteDef] GetRouteWithInstructionsAsync completed successfully");
                return new {
                    StoreId = routeDto.StoreId,
                    ProductId = routeDto.ProductId,
                    Path = realPath,
                    Directions = directions,
                    DebugMessages = debugMessages
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating route instructions for product {ProductId} in store {StoreId}", routeDto?.ProductId, routeDto?.StoreId);
                return null;
            }
        }

        private bool IsReachable(bool[,] grid, int sx, int sy, int dx, int dy)
        {
            int cols = grid.GetLength(0);
            int rows = grid.GetLength(1);
            var visited = new bool[cols, rows];
            var q = new Queue<(int x, int y)>();
            if (!grid[sx, sy] || !grid[dx, dy]) return false;
            q.Enqueue((sx, sy));
            visited[sx, sy] = true;
            int reachableCount = 0;
            var dirs = new (int dx, int dy)[] { (1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1) };
            while (q.Count > 0)
            {
                var (x,y) = q.Dequeue();
                reachableCount++;
                if (x == dx && y == dy)
                    return true;
                foreach (var d in dirs)
                {
                    var nx = x + d.dx;
                    var ny = y + d.dy;
                    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
                    if (visited[nx, ny]) continue;
                    if (!grid[nx, ny]) continue;
                    visited[nx, ny] = true;
                    q.Enqueue((nx, ny));
                }
            }
            return false;
        }
    }
}
