namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

/// <summary>
/// Low-level HTTP abstraction over the SFCC Shop API.
/// </summary>
/// <remarks>
/// This client is responsible for:
/// - Building Shop API URLs
/// - Applying required headers (for example, <c>x-dw-client-id</c>)
/// - Streaming and deserializing JSON responses
/// 
/// Higher-level mapping into API DTOs lives in <see cref="ISfccShopService"/>.
/// </remarks>
public interface ISfccShopApiClient
{
    /// <summary>
    /// Issues a GET request and deserializes the JSON response.
    /// </summary>
    Task<T?> GetAsync<T>(string endpoint, CancellationToken cancellationToken = default);

    /// <summary>
    /// Issues a POST request and deserializes the JSON response.
    /// </summary>
    Task<T?> PostAsync<T>(string endpoint, object? payload = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Issues a PUT request and deserializes the JSON response.
    /// </summary>
    Task<T?> PutAsync<T>(string endpoint, object? payload = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Issues a PATCH request and deserializes the JSON response.
    /// </summary>
    Task<T?> PatchAsync<T>(string endpoint, object? payload = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Issues a DELETE request.
    /// </summary>
    Task<T?> DeleteAsync<T>(string endpoint, CancellationToken cancellationToken = default);

    /// <summary>
    /// Issues a DELETE request.
    /// </summary>
    Task DeleteAsync(string endpoint, CancellationToken cancellationToken = default);
}
