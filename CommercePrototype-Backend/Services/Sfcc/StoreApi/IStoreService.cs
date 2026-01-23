using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models.Salesforce;

namespace CommercePrototype_Backend.Services.StoreApi
{
    public interface IStoreService
    {
        Task<StoreDto?> GetByIdAsync(string storeId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<StoreDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<StoreDto> CreateAsync(StoreDto store, CancellationToken cancellationToken = default);
        Task<StoreDto> UpdateAsync(StoreDto store, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string storeId, CancellationToken cancellationToken = default);
    }
}
