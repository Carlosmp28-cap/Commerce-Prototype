using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models.Salesforce;

namespace CommercePrototype_Backend.Services.StoreApi
{
    public interface IAddressService
    {
        Task<AddressDto?> GetByIdAsync(string addressId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<AddressDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<AddressDto> CreateAsync(AddressDto address, CancellationToken cancellationToken = default);
        Task<AddressDto> UpdateAsync(AddressDto address, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string addressId, CancellationToken cancellationToken = default);
    }
}
