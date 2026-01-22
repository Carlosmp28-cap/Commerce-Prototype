using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services
{
    /// <summary>
    /// Service interface for calculating optimal routes and navigation instructions within a store.
    /// </summary>
    public interface IRouteDefinitionService
    {
        /// <summary>
        /// Calculates the optimal route and navigation instructions from the initial position to the specified product in the given store.
        /// </summary>
        /// <param name="routeDto">The route request containing the store ID, product ID, and initial position.</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>A <see cref="RouteDto"/> containing the route, distance, and navigation steps, or null if no route is found.</returns>
        Task<RouteDto?> CalculateRouteAsync(RouteRequestDto routeDto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Calculates the optimal route and returns both the path and zone-based navigation instructions.
        /// </summary>
        /// <param name="routeDto">The route request containing the store ID, product ID, and initial position.</param>
        /// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
        /// <returns>An object with path and directions, or null if no route is found.</returns>
        Task<object?> GetRouteWithInstructionsAsync(RouteRequestDto routeDto, CancellationToken cancellationToken = default);
    }
}
