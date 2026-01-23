using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models.Salesforce;

namespace CommercePrototype_Backend.Services.StoreApi
{
    public class AddressService : IAddressService
    {
        private readonly HttpClient _httpClient;
        public AddressService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<AddressDto?> GetByIdAsync(string addressId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync($"/services/data/vXX.X/sobjects/Address__c/{addressId}", cancellationToken);
            if (!response.IsSuccessStatusCode) return null;
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<AddressDto>(json);
        }

        public async Task<IReadOnlyList<AddressDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync("/services/data/vXX.X/query/?q=SELECT+Address_Id__c,Street__c,City__c,Postal_Code__c,Country__c+FROM+Address__c", cancellationToken);
            if (!response.IsSuccessStatusCode) return new List<AddressDto>();
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<SalesforceQueryResult<AddressDto>>(json);
            return result?.Records ?? new List<AddressDto>();
        }

        public async Task<AddressDto> CreateAsync(AddressDto address, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(address));
            var response = await _httpClient.PostAsync("/services/data/vXX.X/sobjects/Address__c", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<AddressDto>(json)!;
        }

        public async Task<AddressDto> UpdateAsync(AddressDto address, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(address));
            var response = await _httpClient.PatchAsync($"/services/data/vXX.X/sobjects/Address__c/{address.Address_Id__c}", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<AddressDto>(json)!;
        }

        public async Task<bool> DeleteAsync(string addressId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync($"/services/data/vXX.X/sobjects/Address__c/{addressId}", cancellationToken);
            return response.IsSuccessStatusCode;
        }
    }

}
