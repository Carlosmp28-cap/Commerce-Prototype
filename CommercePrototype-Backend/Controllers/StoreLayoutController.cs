using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using CommercePrototype_Backend.Services.Zone;
using CommercePrototype_Backend.Services.Sfcc.Shelf;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoreLayoutController : ControllerBase
    {
        private readonly IZoneService _zoneService;
        private readonly IShelfService _shelfService;
        private readonly IStoreFileReader _storeFileReader;
        private readonly string _mockDataDir;

        public StoreLayoutController(IZoneService zoneService, IShelfService shelfService, IStoreFileReader storeFileReader)
        {
            _zoneService = zoneService;
            _shelfService = shelfService;
            _storeFileReader = storeFileReader;

            // try common locations for mockData
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

        [HttpGet("{storeId}")]
        public async Task<IActionResult> GetStoreLayout(string storeId, CancellationToken cancellationToken)
        {
            // zones/shelves from services
            var zones = await _zoneService.GetAllAsync(cancellationToken) ?? new List<ZoneDto>();
            var shelves = await _shelfService.GetAllAsync(cancellationToken) ?? new List<ShelfDto>();
            var storeZones = zones.Where(z => z.Store__c == storeId || z.StoreId == storeId).ToList();
            var storeShelves = shelves.Where(s => s.Store__c == storeId || s.StoreId == storeId).ToList();

            // If SFCC services returned no data, fall back to local mock files
            if (storeZones.Count == 0)
            {
                var fileZones = await _storeFileReader.LoadStoreZonesAsync(_mockDataDir, cancellationToken);
                if (fileZones != null)
                    storeZones = fileZones.Where(z => string.Equals(z.StoreId, storeId, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            if (storeShelves.Count == 0)
            {
                var fileShelves = await _storeFileReader.LoadStoreShelvesAsync(_mockDataDir, cancellationToken);
                if (fileShelves != null)
                    storeShelves = fileShelves.Where(s => string.Equals(s.StoreId, storeId, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // load store dimensions from stores.json using file reader
            var stores = await _storeFileReader.LoadStoresAsync(_mockDataDir, cancellationToken);
            var storeDto = stores?.FirstOrDefault(s => string.Equals(s.StoreId, storeId, StringComparison.OrdinalIgnoreCase));
            var dimensions = storeDto?.GridDimensions;

            var result = new {
                StoreId = storeId,
                Zones = storeZones,
                Shelves = storeShelves,
                Dimensions = dimensions
            };

            return Ok(result);
        }

        [HttpGet("map/{storeId}")]
        public async Task<IActionResult> GetStoreMap(string storeId, CancellationToken cancellationToken)
        {
            // Provide consolidated layout for frontend map (zones, shelves, dimensions)
            var zones = await _zoneService.GetAllAsync(cancellationToken) ?? new List<ZoneDto>();
            var shelves = await _shelfService.GetAllAsync(cancellationToken) ?? new List<ShelfDto>();

            var storeZonesRaw = zones.Where(z => z.Store__c == storeId || z.StoreId == storeId).ToList();
            var storeShelvesRaw = shelves.Where(s => s.Store__c == storeId || s.StoreId == storeId).ToList();

            // Fallback to mock files when the SFCC services provide no data
            if (storeZonesRaw.Count == 0)
            {
                var fileZones = await _storeFileReader.LoadStoreZonesAsync(_mockDataDir, cancellationToken);
                if (fileZones != null)
                    storeZonesRaw = fileZones.Where(z => string.Equals(z.StoreId, storeId, StringComparison.OrdinalIgnoreCase)).ToList();
            }
            if (storeShelvesRaw.Count == 0)
            {
                var fileShelves = await _storeFileReader.LoadStoreShelvesAsync(_mockDataDir, cancellationToken);
                if (fileShelves != null)
                    storeShelvesRaw = fileShelves.Where(s => string.Equals(s.StoreId, storeId, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            var storeZones = storeZonesRaw.Select(z => new {
                Id = z.ZoneId ?? z.ZoneId,
                z.ZoneId,
                z.ZoneName,
                X = z.Position?.X ?? 0,
                Y = z.Position?.Y ?? 0,
                Width = z.Width,
                Height = z.Height
            }).ToList();

            var storeShelves = storeShelvesRaw.Select(s => new {
                Id = s.Id ?? s.Id,
                X = s.Position?.X ?? 0,
                Y = s.Position?.Y ?? 0,
                Width = s.Width,
                Height = s.Height,
                ZoneId = s.ZoneId ?? s.Zone__c
            }).ToList();

            var stores = await _storeFileReader.LoadStoresAsync(_mockDataDir, cancellationToken);
            var storeDto = stores?.FirstOrDefault(s => string.Equals(s.StoreId, storeId, StringComparison.OrdinalIgnoreCase));
            var dimensions = storeDto?.GridDimensions;

            var result = new {
                StoreId = storeId,
                Zones = storeZones,
                Shelves = storeShelves,
                Dimensions = dimensions
            };

            return Ok(result);
        }

        [HttpGet("product-zones")]
        public async Task<IActionResult> GetProductZones([FromQuery] string? storeId, CancellationToken cancellationToken)
        {
            // Load product-zone mappings from mock files (or SFCC if available via IStoreFileReader implementation)
            var all = await _storeFileReader.LoadStoreProductZonesAsync(_mockDataDir, cancellationToken) ?? new List<CommercePrototype_Backend.Models.StoreProductZoneDto>();

            var filtered = string.IsNullOrWhiteSpace(storeId)
                ? all
                : all.Where(pz => string.Equals(pz.StoreId, storeId, StringComparison.OrdinalIgnoreCase)).ToList();

            // Try to enrich with product names from products.json when available
            var nameById = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            // candidate paths to search for products.json
            var candidates = new[] {
                Path.Combine(_mockDataDir ?? string.Empty, "products.json"),
                Path.Combine(AppContext.BaseDirectory ?? string.Empty, "mockData", "products.json"),
                Path.Combine(Directory.GetCurrentDirectory() ?? string.Empty, "mockData", "products.json")
            };
            foreach (var prodPath in candidates.Where(p => !string.IsNullOrWhiteSpace(p)))
            {
                try
                {
                    if (!System.IO.File.Exists(prodPath)) continue;
                    await using var fs = System.IO.File.OpenRead(prodPath);
                    using var doc = await System.Text.Json.JsonDocument.ParseAsync(fs, cancellationToken: cancellationToken);
                    if (!doc.RootElement.TryGetProperty("products", out var productsNode) || productsNode.ValueKind != System.Text.Json.JsonValueKind.Array) continue;
                    foreach (var item in productsNode.EnumerateArray())
                    {
                        var id = item.TryGetProperty("productId", out var pid) && pid.ValueKind == System.Text.Json.JsonValueKind.String ? pid.GetString() : null;
                        var name = item.TryGetProperty("name", out var nm) && nm.ValueKind == System.Text.Json.JsonValueKind.String ? nm.GetString() : null;
                        if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) continue;
                        var key = id.Trim();
                        if (!nameById.ContainsKey(key)) nameById[key] = name.Trim();
                    }
                    // if we successfully parsed one file, break — prefer the first available
                    if (nameById.Count > 0) break;
                }
                catch { /* ignore parsing errors and try next candidate */ }
            }

            var result = filtered.Select(pz => {
                string? pn = null;
                if (!string.IsNullOrWhiteSpace(pz.ProductId))
                {
                    var key = pz.ProductId.Trim();
                    if (nameById.TryGetValue(key, out var nm) && !string.IsNullOrWhiteSpace(nm)) pn = nm;
                }
                return new
                {
                    productId = pz.ProductId,
                    shelfId = pz.ShelfId,
                    zoneId = pz.ZoneId,
                    productName = pn ?? pz.ProductName,
                    x = pz.X,
                    y = pz.Y
                };
            }).ToList();

            // Synthetic product generation disabled
            // Previously: add 4 synthetic products per shelf to result
            // Now: only return actual mappings from data files

            return Ok(result);
        }
    }
}