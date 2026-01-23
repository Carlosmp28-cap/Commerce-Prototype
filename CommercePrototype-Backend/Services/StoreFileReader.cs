using CommercePrototype_Backend.Services.Json;
using System.Text.Json;
using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Models.Salesforce;

namespace CommercePrototype_Backend.Services
{
    /// <summary>
    /// Utility class for reading store, product, zone, shelf, and product-zone data from JSON files.
    /// Returns lists of DTOs (StoreDto, ProductMockDto, ZoneDto, ShelfDto, StoreProductZoneDto) for use in route calculation and testing.
    /// </summary>
    public class StoreFileReader : IStoreFileReader
    {
        private readonly ILogger<StoreFileReader> _logger;

        public StoreFileReader(ILogger<StoreFileReader> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Loads all stores from stores.json as a list of StoreDto objects.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Cancellation token for async operation.</param>
        /// <returns>List of StoreDto or null if file not found or invalid.</returns>
        public async Task<List<StoreDto>?> LoadStoresAsync(string mockDataDir, CancellationToken cancellationToken = default)
        {
            var path = Path.Combine(mockDataDir, "stores.json");
            if (!File.Exists(path))
            {
                _logger.LogWarning("stores.json not found at {Path}", path);
                return null;
            }
            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("stores", out var storesNode) || storesNode.ValueKind != JsonValueKind.Array)
                return null;
            var list = new List<StoreDto>();
            foreach (var s in storesNode.EnumerateArray())
            {
                var id = s.GetPropertyOrDefault("storeId") ?? s.GetPropertyOrDefault("storeID") ?? string.Empty;
                var grid = s.TryGetProperty("gridDimensions", out var g) ? g : default;
                double width = 10, height = 10;
                PositionDto? center = null;
                string? unit = null;
                if (grid.ValueKind == JsonValueKind.Object)
                {
                    if (grid.TryGetProperty("width", out var w) && w.ValueKind == JsonValueKind.Number) width = w.GetDouble();
                    if (grid.TryGetProperty("height", out var h) && h.ValueKind == JsonValueKind.Number) height = h.GetDouble();
                    if (grid.TryGetProperty("center", out var c) && c.ValueKind == JsonValueKind.Object)
                    {
                        var x = c.TryGetProperty("x", out var cx) && cx.ValueKind == JsonValueKind.Number ? cx.GetDouble() : 0;
                        var y = c.TryGetProperty("y", out var cy) && cy.ValueKind == JsonValueKind.Number ? cy.GetDouble() : 0;
                        center = new PositionDto(x, y);
                    }
                    if (grid.TryGetProperty("unit", out var u) && u.ValueKind == JsonValueKind.String) unit = u.GetString();
                }
                list.Add(new StoreDto
                {
                    StoreId = id,
                    GridDimensions = new GridDto
                    {
                        Width = width,
                        Height = height,
                        Center = center,
                        Unit = unit
                    }
                });
            }
            return list;
        }

        /// <summary>
        /// Loads all products from products.json as a list of ProductMockDto objects.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Cancellation token for async operation.</param>
        /// <returns>List of ProductMockDto or null if file not found or invalid.</returns>
        public async Task<List<ProductLocationDto>?> LoadProductsAsync(string mockDataDir, CancellationToken cancellationToken = default)
        {
            var path = Path.Combine(mockDataDir, "products.json");
            if (!File.Exists(path)) {
                _logger.LogWarning("products.json not found at {Path}", path);
                return null;
            }
            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("products", out var productsNode) || productsNode.ValueKind != JsonValueKind.Array)
                return null;
            var list = new List<ProductLocationDto>();
            foreach (var p in productsNode.EnumerateArray())
            {
                var id = p.GetPropertyOrDefault("productId") ?? p.GetPropertyOrDefault("id") ?? string.Empty;
                PositionDto? position = null;
                if (p.TryGetProperty("position", out var posNode) && posNode.ValueKind == JsonValueKind.Object)
                {
                    var x = posNode.TryGetProperty("x", out var xp) && xp.ValueKind == JsonValueKind.Number ? xp.GetDouble() : 0;
                    var y = posNode.TryGetProperty("y", out var yp) && yp.ValueKind == JsonValueKind.Number ? yp.GetDouble() : 0;
                    position = new PositionDto(x, y);
                }
                list.Add(new ProductLocationDto { ProductId = id, Position = position });
            }
            return list;
        }

        /// <summary>
        /// Loads all store zones from store-zones.json as a list of ZoneDto objects.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Cancellation token for async operation.</param>
        /// <returns>List of ZoneDto or null if file not found or invalid.</returns>
        public async Task<List<ZoneDto>?> LoadStoreZonesAsync(string mockDataDir, CancellationToken cancellationToken = default)
        {
            var path = Path.Combine(mockDataDir, "store-zones.json");
            if (!File.Exists(path))
            {
                _logger.LogWarning("store-zones.json not found at {Path}", path);
                return null;
            }
            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("storeZones", out var zonesNode) || zonesNode.ValueKind != JsonValueKind.Array)
                return null;
            var list = new List<ZoneDto>();
            foreach (var z in zonesNode.EnumerateArray())
            {
                var storeId = z.GetPropertyOrDefault("storeId") ?? string.Empty;
                var zoneId = z.GetPropertyOrDefault("zoneId") ?? z.GetPropertyOrDefault("id") ?? string.Empty;
                var zoneName = z.GetPropertyOrDefault("zoneName");
                var x = z.TryGetProperty("x", out var xp) && xp.ValueKind == JsonValueKind.Number ? xp.GetDouble() : 0;
                var y = z.TryGetProperty("y", out var yp) && yp.ValueKind == JsonValueKind.Number ? yp.GetDouble() : 0;
                var w = z.TryGetProperty("width", out var wp) && wp.ValueKind == JsonValueKind.Number ? wp.GetDouble() : 1;
                var h = z.TryGetProperty("height", out var hp) && hp.ValueKind == JsonValueKind.Number ? hp.GetDouble() : 1;
                list.Add(new ZoneDto
                {
                    StoreId = storeId,
                    ZoneId = zoneId,
                    ZoneName = zoneName,
                    Position = new PositionDto(x, y),
                    Width = w,
                    Height = h
                });
            }
            return list;
        }

        /// <summary>
        /// Loads all shelves from store-shelves.json as a list of ShelfDto objects.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Cancellation token for async operation.</param>
        /// <returns>List of ShelfDto or null if file not found or invalid.</returns>
        public async Task<List<ShelfDto>?> LoadStoreShelvesAsync(string mockDataDir, CancellationToken cancellationToken = default)
        {
            var path = Path.Combine(mockDataDir, "store-shelves.json");
            if (!File.Exists(path))
            {
                _logger.LogInformation("store-shelves.json not found at {Path}", path);
                return null;
            }
            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("shelves", out var shelvesNode) || shelvesNode.ValueKind != JsonValueKind.Array)
                return null;
            var list = new List<ShelfDto>();
            foreach (var s in shelvesNode.EnumerateArray())
            {
                var id = s.GetPropertyOrDefault("id") ?? s.GetPropertyOrDefault("shelfId") ?? string.Empty;
                var storeId = s.GetPropertyOrDefault("storeId") ?? string.Empty;
                var zoneId = s.GetPropertyOrDefault("zoneId") ?? s.GetPropertyOrDefault("zone") ?? null;
                var x = s.TryGetProperty("x", out var xp) && xp.ValueKind == JsonValueKind.Number ? xp.GetDouble() : 0;
                var y = s.TryGetProperty("y", out var yp) && yp.ValueKind == JsonValueKind.Number ? yp.GetDouble() : 0;
                var w = s.TryGetProperty("width", out var wp) && wp.ValueKind == JsonValueKind.Number ? wp.GetDouble() : 1;
                var h = s.TryGetProperty("height", out var hp) && hp.ValueKind == JsonValueKind.Number ? hp.GetDouble() : 1;
                list.Add(new ShelfDto
                {
                    Id = id,
                    StoreId = storeId,
                    ZoneId = zoneId,
                    Position = new PositionDto(x, y),
                    Width = w,
                    Height = h
                });
            }
            return list;
        }

        /// <summary>
        /// Loads all product-zone mappings from store-product-zones.json as a list of StoreProductZoneDto objects.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Cancellation token for async operation.</param>
        /// <returns>List of StoreProductZoneDto or null if file not found or invalid.</returns>
        public async Task<List<StoreProductZoneDto>?> LoadStoreProductZonesAsync(string mockDataDir, CancellationToken cancellationToken = default)
        {
            var path = Path.Combine(mockDataDir, "store-product-zones.json");
            if (!File.Exists(path))
            {
                _logger.LogInformation("store-product-zones.json not found at {Path}", path);
                return null;
            }
            await using var fs = File.OpenRead(path);
            var doc = await JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
            if (!doc.RootElement.TryGetProperty("storeProductZones", out var node) || node.ValueKind != JsonValueKind.Array)
                return null;
            var list = new List<StoreProductZoneDto>();
            foreach (var n in node.EnumerateArray())
            {
                var productId = n.GetPropertyOrDefault("productId") ?? string.Empty;
                var storeId = n.GetPropertyOrDefault("storeId") ?? string.Empty;
                var zoneId = n.GetPropertyOrDefault("zoneId") ?? null;
                var shelfId = n.GetPropertyOrDefault("shelfId") ?? n.GetPropertyOrDefault("shelf") ?? null;
                list.Add(new StoreProductZoneDto
                {
                    ProductId = productId,
                    StoreId = storeId,
                    ZoneId = zoneId,
                    ShelfId = shelfId
                });
            }
            return list;
        }
    }
}
