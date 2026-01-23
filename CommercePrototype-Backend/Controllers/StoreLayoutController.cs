using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CommercePrototype_Backend.Services.Zone;
using CommercePrototype_Backend.Services.Sfcc.Shelf;

namespace CommercePrototype_Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StoreLayoutController : ControllerBase
    {
        private readonly IZoneService _zoneService;
        private readonly IShelfService _shelfService;

        public StoreLayoutController(IZoneService zoneService, IShelfService shelfService)
        {
            _zoneService = zoneService;
            _shelfService = shelfService;
        }

        [HttpGet("{storeId}")]
        public async Task<IActionResult> GetStoreLayout(string storeId, CancellationToken cancellationToken)
        {
            var zones = await _zoneService.GetAllAsync(cancellationToken);
            var shelves = await _shelfService.GetAllAsync(cancellationToken);

            var storeZones = zones.Where(z => z.Store__c == storeId).ToList();
            var storeShelves = shelves.Where(s => s.Store__c == storeId).ToList();

            var result = new {
                StoreId = storeId,
                Zones = storeZones,
                Shelves = storeShelves
            };

            return Ok(result);
        }
    }
}