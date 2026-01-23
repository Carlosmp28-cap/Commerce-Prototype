
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Services.Sfcc.ShopApi;
using CommercePrototype_Backend.Services;

namespace CommercePrototype_Backend.Controllers{

    /// <summary>
    /// Controller for store route and navigation endpoints.
    /// </summary>
    [ApiController]
    [Route("api/routes")]
    public sealed class RouteDefinitionController : ControllerBase
    {
        private readonly ISfccShopService _shopService;
        private readonly IRouteDefinitionService _routeDefinitionService;
        private readonly ILogger<RouteDefinitionController> _logger;

        public RouteDefinitionController(
            ISfccShopService shopService,
            IRouteDefinitionService routeDefinitionService,
            ILogger<RouteDefinitionController> logger)
        {
            _shopService = shopService;
            _routeDefinitionService = routeDefinitionService;
            _logger = logger;
        }

        /// <summary>
        /// Validates that all required string parameters are not null or whitespace.
        /// </summary>
        /// <param name="values">Array of parameter values to validate.</param>
        /// <returns>BadRequest if any parameter is missing, otherwise null.</returns>
        private IActionResult? ValidateParams(params string[] values){
            if (values.Any(string.IsNullOrWhiteSpace))
                return BadRequest("Required parameters are missing.");
            return null;
        }

        /// <summary>
        /// Endpoint to get the optimal route from the tablet (initial position) to a product in a store.
        /// </summary>
        /// <param name="routeDto">RouteDto containing storeId, productId, and initialPosition coordinates.</param>
        /// <returns>List of nodes/coordinates representing the optimal route.</returns>
        [HttpPost("route")]
        public async Task<IActionResult> GetRoute([FromBody] RouteRequestDto routeDto){
            var validation = ValidateParams(routeDto?.StoreId ?? string.Empty, routeDto?.ProductId ?? string.Empty);
            if (validation != null) return validation;

            try
            {
                var path = await _routeDefinitionService.CalculateRouteAsync(routeDto!);
                if(path == null)
                    return NotFound("No route found.");
                return Ok(path);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting route for product {ProductId} in store {StoreId}", routeDto?.ProductId, routeDto?.StoreId);
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Endpoint to get  navigation instructions to a product location.
        /// </summary>
        /// <param name="routeDto">RouteRequestDto containing storeId, productId, and initialPosition coordinates.</param>
        /// <returns>Path and step-by-step navigation instructions.</returns>
        [HttpPost("instructions")]
        public async Task<IActionResult> GetRouteInstructions([FromBody] RouteRequestDto routeDto)
        {
            var validation = ValidateParams(routeDto?.StoreId ?? string.Empty, routeDto?.ProductId ?? string.Empty);
            if (validation != null) return validation;

            try
            {
                var result = await _routeDefinitionService.GetRouteWithInstructionsAsync(routeDto!);
                if (result == null)
                    return NotFound("No route found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting route instructions for product {ProductId} in store {StoreId}", routeDto?.ProductId, routeDto?.StoreId);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}

