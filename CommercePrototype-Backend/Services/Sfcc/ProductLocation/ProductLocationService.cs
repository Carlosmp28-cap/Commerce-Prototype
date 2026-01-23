using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services.Sfcc.ProductLocation
{
    public class ProductLocationService : IProductLocationService
    {
        private readonly HttpClient _httpClient;
        public ProductLocationService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<ProductLocationDto?> GetByIdAsync(string productLocationId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync($"/services/data/vXX.X/sobjects/ProductLocation__c/{productLocationId}", cancellationToken);
            if (!response.IsSuccessStatusCode) return null;
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ProductLocationDto>(json);
        }

        public async Task<IReadOnlyList<ProductLocationDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync("/services/data/vXX.X/query/?q=SELECT+ProductId,Position+FROM+ProductLocation__c", cancellationToken);
            if (!response.IsSuccessStatusCode) return new List<ProductLocationDto>();
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<SalesforceQueryResult<ProductLocationDto>>(json);
            return result?.Records ?? new List<ProductLocationDto>();
        }

        public async Task<ProductLocationDto> CreateAsync(ProductLocationDto productLocation, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(productLocation));
            var response = await _httpClient.PostAsync("/services/data/vXX.X/sobjects/ProductLocation__c", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ProductLocationDto>(json)!;
        }

        public async Task<ProductLocationDto> UpdateAsync(ProductLocationDto productLocation, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(productLocation));
            var response = await _httpClient.PatchAsync($"/services/data/vXX.X/sobjects/ProductLocation__c/{productLocation.ProductId}", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ProductLocationDto>(json)!;
        }

        public async Task<bool> DeleteAsync(string productLocationId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync($"/services/data/vXX.X/sobjects/ProductLocation__c/{productLocationId}", cancellationToken);
            return response.IsSuccessStatusCode;
        }
    }

}
