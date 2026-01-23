using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CommercePrototype_Backend.Models.Salesforce;

namespace CommercePrototype_Backend.Services.StoreApi
{
    public class StoreService : IStoreService
    {
        private readonly HttpClient _httpClient;
        // Adiciona dependências para autenticação/configuração Salesforce se necessário

        public StoreService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<StoreDto?> GetByIdAsync(string storeId, CancellationToken cancellationToken = default)
        {
            // Exemplo de chamada à API Salesforce (ajusta endpoint conforme necessário)
            var response = await _httpClient.GetAsync($"/services/data/vXX.X/sobjects/Store__c/{storeId}", cancellationToken);
            if (!response.IsSuccessStatusCode) return null;
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<StoreDto>(json);
        }

        public async Task<IReadOnlyList<StoreDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            // Exemplo de query SOQL
            var response = await _httpClient.GetAsync("/services/data/vXX.X/query/?q=SELECT+StoreId__c,Name,Width__c,Unit__c,Status__c,Opening_Hours__c,Length__c,Address__c,Updated_At__c+FROM+Store__c", cancellationToken);
            if (!response.IsSuccessStatusCode) return new List<StoreDto>();
            var json = await response.Content.ReadAsStringAsync();
            // Ajusta para o formato real da resposta Salesforce
            var result = JsonSerializer.Deserialize<SalesforceQueryResult<StoreDto>>(json);
            return result?.Records ?? new List<StoreDto>();
        }

        public async Task<StoreDto> CreateAsync(StoreDto store, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(store));
            var response = await _httpClient.PostAsync("/services/data/vXX.X/sobjects/Store__c", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<StoreDto>(json)!;
        }

        public async Task<StoreDto> UpdateAsync(StoreDto store, CancellationToken cancellationToken = default)
        {
            var content = new StringContent(JsonSerializer.Serialize(store));
            var response = await _httpClient.PatchAsync($"/services/data/vXX.X/sobjects/Store__c/{store.StoreId}", content, cancellationToken);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<StoreDto>(json)!;
        }

        public async Task<bool> DeleteAsync(string storeId, CancellationToken cancellationToken = default)
        {
            var response = await _httpClient.DeleteAsync($"/services/data/vXX.X/sobjects/Store__c/{storeId}", cancellationToken);
            return response.IsSuccessStatusCode;
        }
    }

    // Helper para deserializar resultados de query Salesforce
    public class SalesforceQueryResult<T>
    {
        public List<T> Records { get; set; } = new();
    }
}
