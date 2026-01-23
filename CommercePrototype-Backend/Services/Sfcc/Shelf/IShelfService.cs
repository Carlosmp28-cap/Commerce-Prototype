using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services.Sfcc.Shelf
{
    public interface IShelfService
    {
        Task<ShelfDto?> GetByIdAsync(string shelfId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ShelfDto>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ShelfDto> CreateAsync(ShelfDto shelf, CancellationToken cancellationToken = default);
        Task<ShelfDto> UpdateAsync(ShelfDto shelf, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(string shelfId, CancellationToken cancellationToken = default);
    }
}
