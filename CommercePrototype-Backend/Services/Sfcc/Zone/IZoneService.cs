
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services.Zone
{
    public interface IZoneService
    {
        Task<ZoneDto?> GetByIdAsync(string zoneId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ZoneDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ZoneDto> CreateAsync(ZoneDto zone, CancellationToken cancellationToken = default);
        Task<ZoneDto> UpdateAsync(ZoneDto zone, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string zoneId, CancellationToken cancellationToken = default);
    }
}
