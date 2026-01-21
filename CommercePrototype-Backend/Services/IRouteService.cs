using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services
{
    public interface IRouteService
    {
        Task<RouteResultDto?> CalculateRouteAsync(RouteRequestDto request, CancellationToken cancellationToken = default);
    }
}
