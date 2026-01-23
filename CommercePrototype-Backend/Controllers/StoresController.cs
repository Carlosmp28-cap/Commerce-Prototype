using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers
{
    [ApiController]
    [Route("api/stores")]
    public sealed class StoresController : ControllerBase
    {
        private readonly IStoreFileReader _storeFileReader;
        private readonly ILogger<StoresController> _logger;

        public StoresController(IStoreFileReader storeFileReader, ILogger<StoresController> logger)
        {
            _storeFileReader = storeFileReader;
            _logger = logger;
        }

        /// <summary>
        /// Returns all stores from mock data.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetStores(CancellationToken cancellationToken)
        {
            var mockDataDir = Path.Combine(AppContext.BaseDirectory, "mockData");
            var stores = await _storeFileReader.LoadStoresAsync(mockDataDir, cancellationToken);
            if (stores == null || stores.Count == 0) return NotFound();
            return Ok(stores);
        }

        /// <summary>
        /// Returns a single store by id (case-insensitive).
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStore(string id, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Store id is required.");
            var mockDataDir = Path.Combine(AppContext.BaseDirectory, "mockData");
            var stores = await _storeFileReader.LoadStoresAsync(mockDataDir, cancellationToken);
            var store = stores?.FirstOrDefault(s => string.Equals(s.StoreId, id, StringComparison.OrdinalIgnoreCase));
            if (store == null) return NotFound();
            return Ok(store);
        }
    }
}
