using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services.Sfcc.ProductLocation
{
    public interface IProductLocationService
    {
        Task<ProductLocationDto?> GetByIdAsync(string productLocationId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ProductLocationDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ProductLocationDto> CreateAsync(ProductLocationDto productLocation, CancellationToken cancellationToken = default);
        Task<ProductLocationDto> UpdateAsync(ProductLocationDto productLocation, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string productLocationId, CancellationToken cancellationToken = default);
    }
}
