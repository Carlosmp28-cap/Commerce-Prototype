using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models;

namespace CommercePrototype_Backend.Services.Sfcc.Shelf
{
    public class ShelfService : IShelfService
    {
        private readonly HttpClient _httpClient;
        public ShelfService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<ShelfDto?> GetByIdAsync(string shelfId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync($"/services/data/vXX.X/sobjects/Shelf__c/{shelfId}", cancellationToken);
            if (!response.IsSuccessStatusCode) return null;
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ShelfDto>(json);
        }

        public async Task<IReadOnlyList<ShelfDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync("/services/data/vXX.X/query/?q=SELECT+Id,StoreId,ZoneId,Width,Height,Levels+FROM+Shelf__c", cancellationToken);
            if (!response.IsSuccessStatusCode) return new List<ShelfDto>();
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<SalesforceQueryResult<ShelfDto>>(json);
            return result?.Records ?? new List<ShelfDto>();
        }

        public async Task<ShelfDto> CreateAsync(ShelfDto shelf, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(shelf));
            var response = await _httpClient.PostAsync("/services/data/vXX.X/sobjects/Shelf__c", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ShelfDto>(json)!;
        }

        public async Task<ShelfDto> UpdateAsync(ShelfDto shelf, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(shelf));
            var response = await _httpClient.PatchAsync($"/services/data/vXX.X/sobjects/Shelf__c/{shelf.Id}", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ShelfDto>(json)!;
        }

        public async Task<bool> DeleteAsync(string shelfId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync($"/services/data/vXX.X/sobjects/Shelf__c/{shelfId}", cancellationToken);
            return response.IsSuccessStatusCode;
        }
    }

}
