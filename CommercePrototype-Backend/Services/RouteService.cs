using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models;
using Microsoft.Extensions.Logging;

namespace CommercePrototype_Backend.Services
{
    public sealed class RouteService : IRouteService
    {
        private readonly ILogger<RouteService> _logger;
        private readonly string _mockDataDir;

        public RouteService(ILogger<RouteService> logger)
        {
            _logger = logger;
            // Try common locations for mockData when running from different working directories
            var baseDir = AppContext.BaseDirectory;
            var candidate = Path.Combine(baseDir, "mockData");
            if (Directory.Exists(candidate))
            {
                _mockDataDir = candidate;
            }
            else
            {
                candidate = Path.Combine(Directory.GetCurrentDirectory(), "mockData");
                _mockDataDir = Directory.Exists(candidate) ? candidate : Path.Combine(baseDir, "..");
            }
        }

        public async Task<RouteResultDto?> CalculateRouteAsync(RouteRequestDto request, CancellationToken cancellationToken = default)
        {
            if (request is null) return null;

            try
            {
                var stores = await LoadStoresAsync(cancellationToken);
                var products = await LoadProductsAsync(cancellationToken);

                var store = stores?.FirstOrDefault(s => string.Equals(s.StoreId, request.StoreId, StringComparison.OrdinalIgnoreCase));
                if (store == null) return null;

                var product = products?.FirstOrDefault(p => string.Equals(p.ProductId, request.ProductId, StringComparison.OrdinalIgnoreCase));
                if (product == null) return null;

                // load zones, shelves and product->zone mapping
                var zones = await LoadStoreZonesAsync(cancellationToken);
                var shelves = await LoadStoreShelvesAsync(cancellationToken);
                var productZones = await LoadStoreProductZonesAsync(cancellationToken);

                // Determine product position: prefer explicit product position -> shelf position from mapping -> zone center from mapping
                var productPos = GetProductPositionInStore(store, product, zones, shelves, productZones) ?? CalculateProductPositionInStore(store, product.ProductId);

                var start = request.Start ?? new PositionDto(0, 0);

                var debugMessages = new List<string>();

                if (request.UseAStar)
                {
                    var gridResolution = Math.Max(1, request.GridResolutionMeters);
                    var path = await CalculateAStarPathAsync(store, zones, shelves, start, productPos, gridResolution, cancellationToken, debugMessages);
                    if (path != null && path.Count > 0)
                    {
                        var distance = PathDistance(path);
                        var steps = CompressPathToDirections(path);
                        // Label start/destination
                        if (steps.Count > 0) steps[0].Label = "início";
                        if (steps.Count > 1) steps[^1].Label = "destino";

                        // ensure we pass an explicit copy of the waypoints (rounded) to the DTO
                        var waypoints = path.Select(p => new PositionDto(Math.Round(p.X, 1), Math.Round(p.Y, 1))).ToList();
                        _logger.LogDebug("Returning route with {StepCount} steps and {WaypointCount} waypoints", steps.Count, waypoints.Count);

                        // also return raw waypoints
                        var routeResultDto = new RouteResultDto(request.StoreId, request.ProductId, distance, steps, waypoints);
                        if (debugMessages.Count > 0) routeResultDto.DebugMessages.AddRange(debugMessages);
                        return routeResultDto;
                    }
                }

                // fallback linear route
                var dx = productPos.X - start.X;
                var dy = productPos.Y - start.Y;
                var distanceLinear = Math.Sqrt(dx * dx + dy * dy);

                var stepsLinear = new List<RouteStepDto>();
                var nSteps = (int)Math.Ceiling(distanceLinear);
                nSteps = Math.Min(Math.Max(nSteps, 1), 500); // cap

                for (var i = 0; i <= nSteps; i++)
                {
                    var t = nSteps == 0 ? 1.0 : (double)i / nSteps;
                    var x = start.X + dx * t;
                    var y = start.Y + dy * t;
                    var label = i == 0 ? "início" : i == nSteps ? "destino" : null;
                    stepsLinear.Add(new RouteStepDto(new PositionDto(Math.Round(x, 1), Math.Round(y, 1)), label));
                }

                // Note: include any debug messages discovered during A* preparation so clients can inspect obstacles
                // (the linear fallback will also include them in the response below when created)
                var resultDto = new RouteResultDto(request.StoreId, request.ProductId, distanceLinear, stepsLinear);
                if (debugMessages.Count > 0) resultDto.DebugMessages.AddRange(debugMessages);
                return resultDto;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating route");
                return null;
            }
        }

        private double PathDistance(List<PositionDto> path)
        {
            double d = 0;
            for (var i = 1; i < path.Count; i++)
            {
                var dx = path[i].X - path[i - 1].X;
                var dy = path[i].Y - path[i - 1].Y;
                d += Math.Sqrt(dx * dx + dy * dy);
            }
            return d;
        }

        private PositionDto? GetProductPositionInStore(StoreMock store, ProductMock product, List<ZoneMock>? zones, List<ShelfMock>? shelves, List<StoreProductZoneMock>? productZones)
        {
            if (product == null) return null;

            // 1) explicit coordinates on product
            if (product.PositionX.HasValue && product.PositionY.HasValue)
            {
                return new PositionDto(product.PositionX.Value, product.PositionY.Value);
            }

            // 2) mapping in store-product-zones -> shelf center
            if (productZones != null)
            {
                var mapping = productZones.FirstOrDefault(m => string.Equals(m.ProductId, product.ProductId, StringComparison.OrdinalIgnoreCase)
                                                               && string.Equals(m.StoreId, store.StoreId, StringComparison.OrdinalIgnoreCase));
                if (mapping != null)
                {
                    if (!string.IsNullOrWhiteSpace(mapping.ShelfId) && shelves != null)
                    {
                        var shelf = shelves.FirstOrDefault(s => string.Equals(s.Id, mapping.ShelfId, StringComparison.OrdinalIgnoreCase) && string.Equals(s.StoreId, store.StoreId, StringComparison.OrdinalIgnoreCase));
                        if (shelf != null) return new PositionDto(shelf.X, shelf.Y);
                    }

                    if (!string.IsNullOrWhiteSpace(mapping.ZoneId) && zones != null)
                    {
                        var zone = zones.FirstOrDefault(z => string.Equals(z.StoreId, store.StoreId, StringComparison.OrdinalIgnoreCase) && string.Equals(z.ZoneId, mapping.ZoneId, StringComparison.OrdinalIgnoreCase));
                        if (zone != null) return new PositionDto(zone.X + zone.Width / 2.0, zone.Y + zone.Height / 2.0);
                    }
                }
            }

            return null;
        }

        private async Task<List<StoreProductZoneMock>?> LoadStoreProductZonesAsync(CancellationToken cancellationToken)
        {
            var path = Path.Combine(_mockDataDir, "store-product-zones.json");
            if (!File.Exists(path))
            {
                _logger.LogInformation("store-product-zones.json not found at {Path}", path);
                return null;
            }

            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("storeProductZones", out var node) || node.ValueKind != JsonValueKind.Array)
                return null;

            var list = new List<StoreProductZoneMock>();
            foreach (var n in node.EnumerateArray())
            {
                var productId = n.GetPropertyOrDefault("productId") ?? "";
                var storeId = n.GetPropertyOrDefault("storeId") ?? "";
                // zoneId in file might be short (like "A1") or full; accept either
                var zoneId = n.GetPropertyOrDefault("zoneId");
                var shelfId = n.GetPropertyOrDefault("shelfId") ?? n.GetPropertyOrDefault("shelf");
                list.Add(new StoreProductZoneMock { ProductId = productId, StoreId = storeId, ZoneId = zoneId, ShelfId = shelfId });
            }

            return list;
        }

        private async Task<List<ZoneMock>?> LoadStoreZonesAsync(CancellationToken cancellationToken)
        {
            var path = Path.Combine(_mockDataDir, "store-zones.json");
            if (!File.Exists(path))
            {
                _logger.LogWarning("store-zones.json not found at {Path}", path);
                return null;
            }

            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("storeZones", out var zonesNode) || zonesNode.ValueKind != JsonValueKind.Array)
                return null;

            var list = new List<ZoneMock>();
            foreach (var z in zonesNode.EnumerateArray())
            {
                var storeId = z.GetPropertyOrDefault("storeId") ?? "";
                var zoneId = z.GetPropertyOrDefault("zoneId") ?? z.GetPropertyOrDefault("id") ?? "";
                var x = z.TryGetProperty("x", out var xp) && xp.ValueKind == JsonValueKind.Number ? xp.GetDouble() : 0;
                var y = z.TryGetProperty("y", out var yp) && yp.ValueKind == JsonValueKind.Number ? yp.GetDouble() : 0;
                var w = z.TryGetProperty("width", out var wp) && wp.ValueKind == JsonValueKind.Number ? wp.GetDouble() : 1;
                var h = z.TryGetProperty("height", out var hp) && hp.ValueKind == JsonValueKind.Number ? hp.GetDouble() : 1;
                list.Add(new ZoneMock { StoreId = storeId, ZoneId = zoneId, X = x, Y = y, Width = w, Height = h });
            }

            return list;
        }

        private async Task<List<ShelfMock>?> LoadStoreShelvesAsync(CancellationToken cancellationToken)
        {
            var path = Path.Combine(_mockDataDir, "store-shelves.json");
            if (!File.Exists(path))
            {
                _logger.LogInformation("store-shelves.json not found at {Path}", path);
                return null;
            }

            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("shelves", out var shelvesNode) || shelvesNode.ValueKind != JsonValueKind.Array)
                return null;

            var list = new List<ShelfMock>();
            foreach (var s in shelvesNode.EnumerateArray())
            {
                var id = s.GetPropertyOrDefault("id") ?? s.GetPropertyOrDefault("shelfId") ?? "";
                var storeId = s.GetPropertyOrDefault("storeId") ?? "";
                var zoneId = s.GetPropertyOrDefault("zoneId") ?? s.GetPropertyOrDefault("zone") ?? "";
                var x = s.TryGetProperty("x", out var xp) && xp.ValueKind == JsonValueKind.Number ? xp.GetDouble() : 0;
                var y = s.TryGetProperty("y", out var yp) && yp.ValueKind == JsonValueKind.Number ? yp.GetDouble() : 0;
                var w = s.TryGetProperty("width", out var wp) && wp.ValueKind == JsonValueKind.Number ? wp.GetDouble() : 1;
                var h = s.TryGetProperty("height", out var hp) && hp.ValueKind == JsonValueKind.Number ? hp.GetDouble() : 1;
                list.Add(new ShelfMock { Id = id, StoreId = storeId, ZoneId = zoneId, X = x, Y = y, Width = w, Height = h });
            }

            return list;
        }

        private async Task<List<StoreMock>?> LoadStoresAsync(CancellationToken cancellationToken)
        {
            var path = Path.Combine(_mockDataDir, "stores.json");
            if (!File.Exists(path))
            {
                _logger.LogWarning("stores.json not found at {Path}", path);
                return null;
            }

            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("stores", out var storesNode) || storesNode.ValueKind != JsonValueKind.Array)
                return null;

            var list = new List<StoreMock>();
            foreach (var s in storesNode.EnumerateArray())
            {
                var id = s.GetPropertyOrDefault("storeId") ?? s.GetPropertyOrDefault("storeID") ?? "";
                var grid = s.TryGetProperty("gridDimensions", out var g) ? g : default;
                double width = 10, height = 10;
                if (grid.ValueKind == JsonValueKind.Object)
                {
                    if (grid.TryGetProperty("width", out var w) && w.ValueKind == JsonValueKind.Number) width = w.GetDouble();
                    if (grid.TryGetProperty("height", out var h) && h.ValueKind == JsonValueKind.Number) height = h.GetDouble();
                }
                list.Add(new StoreMock { StoreId = id, GridDimensions = new Grid { Width = width, Height = height } });
            }

            return list;
        }

        private async Task<List<ProductMock>?> LoadProductsAsync(CancellationToken cancellationToken)
        {
            var path = Path.Combine(_mockDataDir, "products.json");
            if (!File.Exists(path))
            {
                _logger.LogWarning("products.json not found at {Path}", path);
                return null;
            }

            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("products", out var productsNode) || productsNode.ValueKind != JsonValueKind.Array)
                return null;

            var list = new List<ProductMock>();
            foreach (var p in productsNode.EnumerateArray())
            {
                var id = p.GetPropertyOrDefault("productId") ?? p.GetPropertyOrDefault("id") ?? "";
                double? posX = null, posY = null;
                if (p.TryGetProperty("position", out var posNode) && posNode.ValueKind == JsonValueKind.Object)
                {
                    if (posNode.TryGetProperty("x", out var xp) && xp.ValueKind == JsonValueKind.Number) posX = xp.GetDouble();
                    if (posNode.TryGetProperty("y", out var yp) && yp.ValueKind == JsonValueKind.Number) posY = yp.GetDouble();
                }

                list.Add(new ProductMock { ProductId = id, PositionX = posX, PositionY = posY });
            }

            return list;
        }

        private PositionDto CalculateProductPositionInStore(StoreMock? store, string productId)
        {
            // Use a deterministic hash to place a product inside the store grid
            var width = Math.Max(1, (int)Math.Round(store?.GridDimensions?.Width ?? 10));
            var height = Math.Max(1, (int)Math.Round(store?.GridDimensions?.Height ?? 10));

            var hash = Math.Abs(productId.GetHashCode());
            var x = (hash % width) + 0.5; // center of meter tile
            var y = ((hash / Math.Max(1, width)) % height) + 0.5;

            return new PositionDto(x, y);
        }

        private async Task<List<PositionDto>?> CalculateAStarPathAsync(StoreMock store, List<ZoneMock>? zones, List<ShelfMock>? shelves, PositionDto start, PositionDto dest, int resolutionMeters, CancellationToken cancellationToken, List<string> debugMessages)
        {
            // Build grid using store gridDimensions and resolution
            var width = (int)Math.Ceiling(store.GridDimensions?.Width ?? 10);
            var height = (int)Math.Ceiling(store.GridDimensions?.Height ?? 10);

            var cols = Math.Max(1, (int)Math.Ceiling(width / (double)resolutionMeters));
            var rows = Math.Max(1, (int)Math.Ceiling(height / (double)resolutionMeters));

            var grid = new bool[cols, rows]; // true = walkable
            for (var x = 0; x < cols; x++)
            {
                for (var y = 0; y < rows; y++)
                {
                    grid[x, y] = true;
                }
            }

            // Mark obstacles from shelves (shelf X/Y treated as center coordinates)
            if (shelves != null)
            {
                foreach (var s in shelves.Where(s => string.Equals(s.StoreId, store.StoreId, StringComparison.OrdinalIgnoreCase)))
                {
                    // mark cells that intersect shelf bounding box
                    var sx0 = (int)Math.Floor((s.X - s.Width / 2.0) / resolutionMeters);
                    var sy0 = (int)Math.Floor((s.Y - s.Height / 2.0) / resolutionMeters);
                    var sx1 = (int)Math.Ceiling((s.X + s.Width / 2.0) / resolutionMeters) - 1;
                    var sy1 = (int)Math.Ceiling((s.Y + s.Height / 2.0) / resolutionMeters) - 1;

                    sx0 = Math.Clamp(sx0, 0, cols - 1);
                    sy0 = Math.Clamp(sy0, 0, rows - 1);
                    sx1 = Math.Clamp(sx1, 0, cols - 1);
                    sy1 = Math.Clamp(sy1, 0, rows - 1);

                    for (var gx = sx0; gx <= sx1; gx++)
                    {
                        for (var gy = sy0; gy <= sy1; gy++)
                        {
                            if (grid[gx, gy])
                            {
                                grid[gx, gy] = false;
                                var realX = Math.Round((gx + 0.5) * resolutionMeters, 1);
                                var realY = Math.Round((gy + 0.5) * resolutionMeters, 1);
                                debugMessages?.Add($"obstáculo (prateleira) em X={realX} Y={realY}");
                            }
                        }
                    }
                }
            }

            // Convert start/dest to grid cells
            int sx = Math.Clamp((int)Math.Floor(start.X / resolutionMeters), 0, cols - 1);
            int sy = Math.Clamp((int)Math.Floor(start.Y / resolutionMeters), 0, rows - 1);
            int dx = Math.Clamp((int)Math.Floor(dest.X / resolutionMeters), 0, cols - 1);
            int dy = Math.Clamp((int)Math.Floor(dest.Y / resolutionMeters), 0, rows - 1);

            // If destination cell is blocked, try to find nearest walkable cell inside its zone area
            if (!grid[dx, dy])
            {
                // Destination is on an obstacle (shelf). The caller expects the destination to be the chosen shelf.
                // Do NOT search for an alternative — keep the destination as requested. Make the destination
                // cell temporarily walkable so the A* algorithm can target it, but leave other obstacle cells blocked.
                debugMessages?.Add($"destino está num obstáculo (prateleira) em X={Math.Round((dx + 0.5) * resolutionMeters, 1)} Y={Math.Round((dy + 0.5) * resolutionMeters, 1)} - mantendo destino escolhido");
                grid[dx, dy] = true;
            }

            var path = AStar(grid, sx, sy, dx, dy);
            if (path == null) return null;

            // Convert grid path to real coordinates (center of cells) with one decimal
            var result = path.Select(c => new PositionDto(
                Math.Round((c.X + 0.5) * resolutionMeters, 1),
                Math.Round((c.Y + 0.5) * resolutionMeters, 1)
            )).ToList();
            return result;
        }

        private List<Cell>? AStar(bool[,] walkable, int sx, int sy, int tx, int ty)
        {
            var cols = walkable.GetLength(0);
            var rows = walkable.GetLength(1);

            var open = new PriorityQueue<Cell, double>();
            var start = new Cell(sx, sy, 0, Heuristic(sx, sy, tx, ty), null);
            open.Enqueue(start, start.FScore);

            var gScore = new Dictionary<(int, int), double> { [(sx, sy)] = 0 };
            var closed = new HashSet<(int, int)>();

            // 8-directional movement with costs
            var neighbors = new (int dx, int dy, double cost)[]
            {
                (1,0,1.0), (-1,0,1.0), (0,1,1.0), (0,-1,1.0),
                (1,1,1.6), (1,-1,1.6), (-1,1,1.6), (-1,-1,1.6)
            };

            while (open.Count > 0)
            {
                var current = open.Dequeue();
                var curKey = (current.X, current.Y);
                if (closed.Contains(curKey)) continue;
                closed.Add(curKey);

                if (current.X == tx && current.Y == ty)
                {
                    var path = new List<Cell>();
                    var cur = current;
                    while (cur != null) { path.Add(cur); cur = cur.Parent; }
                    path.Reverse();
                    return path;
                }

                foreach (var (dxn, dyn, moveCost) in neighbors)
                {
                    var nx = current.X + dxn;
                    var ny = current.Y + dyn;
                    if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
                    if (!walkable[nx, ny]) continue;

                    var tentativeG = current.G + moveCost; // cost per move
                    var key = (nx, ny);
                    if (closed.Contains(key)) continue;

                    if (!gScore.TryGetValue(key, out var knownG) || tentativeG < knownG)
                    {
                        gScore[key] = tentativeG;
                        var h = Heuristic(nx, ny, tx, ty);
                        var neighbor = new Cell(nx, ny, tentativeG, h, current);
                        open.Enqueue(neighbor, neighbor.FScore);
                    }
                }
            }

            return null;
        }

        private double Heuristic(int x, int y, int tx, int ty)
        {
            // Octile heuristic using straight cost = 1 and diagonal cost = 1.6 (penalize diagonals slightly)
            var dx = Math.Abs(tx - x);
            var dy = Math.Abs(ty - y);
            const double D = 1.0;
            const double D2 = 1.6;
            var min = Math.Min(dx, dy);
            return D * (dx + dy) + (D2 - 2 * D) * min;
        }

        // internal lightweight mocks used only by this service to read JSON
        private class StoreMock
        {
            public string StoreId { get; set; } = string.Empty;
            public Grid? GridDimensions { get; set; }
        }

        private class Grid
        {
            public double Width { get; set; }
            public double Height { get; set; }
            public string? Unit { get; set; }
        }

        private class ProductMock
        {
            public string ProductId { get; set; } = string.Empty;
            public double? PositionX { get; set; }
            public double? PositionY { get; set; }
        }

        private class ZoneMock
        {
            public string StoreId { get; set; } = string.Empty;
            public string ZoneId { get; set; } = string.Empty;
            public double X { get; set; }
            public double Y { get; set; }
            public double Width { get; set; }
            public double Height { get; set; }
        }

        private class Cell
        {
            public int X { get; }
            public int Y { get; }
            public double G { get; }
            public double H { get; }
            public double FScore => G + H;
            public Cell? Parent { get; }
            public Cell(int x, int y, double g, double h, Cell? parent)
            {
                X = x; Y = y; G = g; H = h; Parent = parent;
            }
        }

        private class ShelfMock
        {
            public string Id { get; set; } = string.Empty;
            public string StoreId { get; set; } = string.Empty;
            public string? ZoneId { get; set; }
            public double X { get; set; }
            public double Y { get; set; }
            public double Width { get; set; }
            public double Height { get; set; }
        }

        private class StoreProductZoneMock
        {
            public string ProductId { get; set; } = string.Empty;
            public string StoreId { get; set; } = string.Empty;
            public string? ZoneId { get; set; }
            public string? ShelfId { get; set; }
        }

        private List<RouteStepDto> CompressPathToDirections(List<PositionDto> path)
        {
            var result = new List<RouteStepDto>();
            if (path == null || path.Count == 0) return result;

            // start
            result.Add(new RouteStepDto(new PositionDto(Math.Round(path[0].X, 1), Math.Round(path[0].Y, 1)), "início"));

            if (path.Count == 1)
            {
                result.Add(new RouteStepDto(new PositionDto(path[0].X, path[0].Y), "destino"));
                return result;
            }

            // Helper to get direction sign pair
            static (int dxSign, int dySign) DirSign(PositionDto from, PositionDto to)
            {
                var dx = to.X - from.X;
                var dy = to.Y - from.Y;
                // normalize to -1,0,1 by axis
                int sx = Math.Sign(Math.Round(dx, 3));
                int sy = Math.Sign(Math.Round(dy, 3));
                return (sx, sy);
            }

            int idx = 1;
            var currentDir = DirSign(path[0], path[1]);
            double accDist = DistanceBetween(path[0], path[1]);
            PositionDto lastPos = path[1];

            for (idx = 2; idx < path.Count; idx++)
            {
                var dir = DirSign(path[idx - 1], path[idx]);
                var segDist = DistanceBetween(path[idx - 1], path[idx]);
                if (dir == currentDir)
                {
                    accDist += segDist;
                    lastPos = path[idx];
                }
                else
                {
                    // flush accumulated segment
                    var dirName = DirectionPhrase(currentDir.dxSign, currentDir.dySign);
                    var label = $"Andar {Math.Round(accDist, 1)} m {dirName}";
                    result.Add(new RouteStepDto(new PositionDto(Math.Round(lastPos.X, 1), Math.Round(lastPos.Y, 1)), label));

                    // start new accumulation
                    currentDir = dir;
                    accDist = segDist;
                    lastPos = path[idx];
                }
            }

            // flush last
            var finalPhrase = DirectionPhrase(currentDir.dxSign, currentDir.dySign);
            var finalLabel = $"Andar {Math.Round(accDist, 1)} m {finalPhrase}";
            result.Add(new RouteStepDto(new PositionDto(Math.Round(lastPos.X, 1), Math.Round(lastPos.Y, 1)), finalLabel));

            // ensure destination is explicitly present
            var dest = path[^1];
            if (result.Count == 0 || result[^1].Position.X != Math.Round(dest.X, 1) || result[^1].Position.Y != Math.Round(dest.Y, 1))
            {
                result.Add(new RouteStepDto(new PositionDto(Math.Round(dest.X, 1), Math.Round(dest.Y, 1)), "destino"));
            }

            return result;
        }

        private static double DistanceBetween(PositionDto a, PositionDto b)
        {
            var dx = b.X - a.X;
            var dy = b.Y - a.Y;
            return Math.Sqrt(dx * dx + dy * dy);
        }

        private static string DirectionPhrase(int sx, int sy)
        {
            // Map sign pair to relative Portuguese phrase
            if (sx == 0 && sy == 0) return "parado";
            if (sx == 0 && sy > 0) return "para a frente";
            if (sx == 0 && sy < 0) return "para trás";
            if (sx > 0 && sy == 0) return "para a direita";
            if (sx < 0 && sy == 0) return "para a esquerda";
            if (sx > 0 && sy > 0) return "para a frente e à direita";
            if (sx < 0 && sy > 0) return "para a frente e à esquerda";
            if (sx > 0 && sy < 0) return "para trás e à direita";
            if (sx < 0 && sy < 0) return "para trás e à esquerda";
            return "direção desconhecida";
        }
    }
}
