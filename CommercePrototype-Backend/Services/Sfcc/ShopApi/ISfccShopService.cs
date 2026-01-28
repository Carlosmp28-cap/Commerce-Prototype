using CommercePrototype_Backend.Models;
using CommercePrototype_Backend.Models.Basket;
using CommercePrototype_Backend.Models.Categories;
using CommercePrototype_Backend.Models.Customers;
using CommercePrototype_Backend.Models.Products;

namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

/// <summary>
/// Application-facing facade over the SFCC Shop API.
/// </summary>
/// <remarks>
/// This abstraction exists to keep controllers thin and to centralize:
/// mapping from SFCC JSON to API DTOs, paging limits, caching and error handling.
/// </remarks>
public interface ISfccShopService
{
    /// <summary>
    /// Retrieves a category tree rooted at <paramref name="rootId"/>.
    /// </summary>
    /// <param name="rootId">SFCC category id to use as the root.</param>
    /// <param name="levels">Depth of children to include.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The category tree, or <see langword="null"/> if not found.</returns>
    Task<CategoryNodeDto?> GetCategoryTreeAsync(string rootId = "root", int levels = 2, CancellationToken cancellationToken = default);

    /// <summary>
    /// Searches products within a category.
    /// </summary>
    /// <param name="categoryId">SFCC category id to search within.</param>
    /// <param name="query">Optional free-text query.</param>
    /// <param name="limit">Maximum items to return.</param>
    /// <param name="offset">Zero-based offset.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>A paged search result.</returns>
    Task<ProductSearchResultDto> SearchProductsAsync(string categoryId, string? query = null, int limit = 50, int offset = 0, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves product detail by id.
    /// </summary>
    /// <param name="productId">SFCC product id.</param>
    /// <param name="cancellationToken">Request cancellation token.</param>
    /// <returns>The product detail, or <see langword="null"/> if not found.</returns>
    Task<ProductDetailDto?> GetProductAsync(string productId, CancellationToken cancellationToken = default);

    Task<BasketDto> CreateBasketAsync(string? currency = null, CancellationToken cancellationToken = default);
    Task<BasketDto?> GetBasketAsync(string basketId, CancellationToken cancellationToken = default);
    Task<BasketDto?> AddItemToBasketAsync(string basketId, string productId, int quantity = 1, CancellationToken cancellationToken = default);
    Task<BasketDto?> UpdateBasketItemQuantityAsync(string basketId, string itemId, int quantity, CancellationToken cancellationToken = default);
    Task<BasketDto?> RemoveItemFromBasketAsync(string basketId, string itemId, CancellationToken cancellationToken = default);
    Task ClearBasketAsync(string basketId, CancellationToken cancellationToken = default);

    Task<CustomerProfileDto> RegisterCustomerAsync(RegisterCustomerRequestDto request, CancellationToken cancellationToken = default);
    Task<CustomerProfileDto?> GetCustomerProfileAsync(string customerId, CancellationToken cancellationToken = default);
    Task<CustomerProfileDto?> UpdateCustomerProfileAsync(string customerId, UpdateCustomerProfileRequestDto request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerAddressDto>> GetCustomerAddressesAsync(string customerId, CancellationToken cancellationToken = default);
    Task<CustomerAddressDto?> AddCustomerAddressAsync(string customerId, AddCustomerAddressRequestDto request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CustomerOrderDto>> GetCustomerOrdersAsync(string customerId, CancellationToken cancellationToken = default);
}

