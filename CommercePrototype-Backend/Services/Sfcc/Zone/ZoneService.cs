using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using CommercePrototype_Backend.Models;
using System.Threading;
using System.Threading.Tasks;

namespace CommercePrototype_Backend.Services.Zone
{
    public class ZoneService : IZoneService
    {
        private readonly HttpClient _httpClient;
        public ZoneService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<ZoneDto?> GetByIdAsync(string zoneId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync($"/services/data/vXX.X/sobjects/Zone__c/{zoneId}", cancellationToken);
            if (!response.IsSuccessStatusCode) return null;
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ZoneDto>(json);
        }

        public async Task<IReadOnlyList<ZoneDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.GetAsync("/services/data/vXX.X/query/?q=SELECT+Zone_Id__c,Zone_Name__c,Store__c,Height__c,Updated_At__c,X__c,Y__c,Width__c,Unit__c+FROM+Zone__c", cancellationToken);
            if (!response.IsSuccessStatusCode) return new List<ZoneDto>();
            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<SalesforceQueryResult<ZoneDto>>(json);
            return result?.Records ?? new List<ZoneDto>();
        }

        public async Task<ZoneDto> CreateAsync(ZoneDto zone, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(zone));
            var response = await _httpClient.PostAsync("/services/data/vXX.X/sobjects/Zone__c", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ZoneDto>(json)!;
        }

        public async Task<ZoneDto> UpdateAsync(ZoneDto zone, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(zone));
            var response = await _httpClient.PatchAsync($"/services/data/vXX.X/sobjects/Zone__c/{zone.Zone_Id__c}", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<ZoneDto>(json)!;
        }

        public async Task<bool> DeleteAsync(string zoneId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync($"/services/data/vXX.X/sobjects/Zone__c/{zoneId}", cancellationToken);
            return response.IsSuccessStatusCode;
        }
    }

}
