using CommercePrototype_Backend.Models;
namespace CommercePrototype_Backend.Services
{
    /// <summary>
    /// Interface for reading store, product, zone, shelf, and product-zone data from files.
    /// </summary>
    public interface IStoreFileReader
    {
        /// <summary>
        /// Loads all stores from the specified directory.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Token for cancelling the async operation.</param>
        /// <returns>List of StoreDto or null if not found/invalid.</returns>
        Task<List<StoreDto>?> LoadStoresAsync(string mockDataDir, CancellationToken cancellationToken = default);

        /// <summary>
        /// Loads all products from the specified directory.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Token for cancelling the async operation.</param>
        /// <returns>List of ProductLocationDto or null if not found/invalid.</returns>
        Task<List<ProductLocationDto>?> LoadProductsAsync(string mockDataDir, CancellationToken cancellationToken = default);

        /// <summary>
        /// Loads all store zones from the specified directory.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Token for cancelling the async operation.</param>
        /// <returns>List of ZoneDto or null if not found/invalid.</returns>
        Task<List<ZoneDto>?> LoadStoreZonesAsync(string mockDataDir, CancellationToken cancellationToken = default);

        /// <summary>
        /// Loads all shelves from the specified directory.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Token for cancelling the async operation.</param>
        /// <returns>List of ShelfDto or null if not found/invalid.</returns>
        Task<List<ShelfDto>?> LoadStoreShelvesAsync(string mockDataDir, CancellationToken cancellationToken = default);

        /// <summary>
        /// Loads all product-zone mappings from the specified directory.
        /// </summary>
        /// <param name="mockDataDir">Directory containing the mock data files.</param>
        /// <param name="cancellationToken">Token for cancelling the async operation.</param>
        /// <returns>List of StoreProductZoneDto or null if not found/invalid.</returns>
        Task<List<StoreProductZoneDto>?> LoadStoreProductZonesAsync(string mockDataDir, CancellationToken cancellationToken = default);
    }
}
