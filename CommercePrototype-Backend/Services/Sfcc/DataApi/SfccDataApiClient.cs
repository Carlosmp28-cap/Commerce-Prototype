using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using CommercePrototype_Backend.Options;

namespace CommercePrototype_Backend.Services.Sfcc.DataApi;

/// <summary>
/// Minimal SFCC Data API client for custom objects.
/// - Supports OAuth2 client_credentials token retrieval (client secret read from environment variable).
/// - Supports GET, PUT, PATCH, DELETE and basic query for custom objects.
/// </summary>
public class SfccDataApiClient
{
	private readonly HttpClient _http;
	private readonly SfccOptions _options;
	private readonly IConfiguration _config;

	// simple in-memory token cache
	private string? _accessToken;
	private DateTime _accessTokenExpiresAt = DateTime.MinValue;
	private readonly SemaphoreSlim _tokenLock = new(1, 1);

	public SfccDataApiClient(HttpClient http, IOptions<SfccOptions> options, IConfiguration config)
	{
		_http = http;
		_options = options.Value;
		_config = config;
	}

	private string BuildBasePath()
	{
		// e.g. https://instance/s/-/dw/data/v20_4
		var baseUrl = _options.ApiBaseUrl?.TrimEnd('/') ?? throw new InvalidOperationException("Sfcc: ApiBaseUrl not configured");
		var version = _options.ApiVersion ?? "v20_4";
		return $"{baseUrl}/s/-/dw/data/{version}";
	}

	private async Task<string> GetAccessTokenAsync(CancellationToken ct = default)
	{
		if (!string.IsNullOrEmpty(_accessToken) && DateTime.UtcNow < _accessTokenExpiresAt)
		{
			return _accessToken!;
		}

		await _tokenLock.WaitAsync(ct);
		try
		{
			if (!string.IsNullOrEmpty(_accessToken) && DateTime.UtcNow < _accessTokenExpiresAt)
				return _accessToken!;

			var tokenUrl = _options.OAuthTokenUrl;
			if (string.IsNullOrEmpty(tokenUrl))
				throw new InvalidOperationException("Sfcc: OAuthTokenUrl not configured in SfccOptions");

			// client id comes from options, secret from configuration or environment variable
			var clientId = _options.ClientId ?? _config["SFCC_CLIENT_ID"];
			var clientSecret = _config["SFCC_CLIENT_SECRET"] ?? Environment.GetEnvironmentVariable("SFCC_CLIENT_SECRET");

			if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
				throw new InvalidOperationException("SFCC client credentials are not configured (client id / secret)");

			var req = new HttpRequestMessage(HttpMethod.Post, tokenUrl);
			var body = new List<KeyValuePair<string, string>>
			{
				new("grant_type", "client_credentials")
			};
			req.Content = new FormUrlEncodedContent(body);
			var basic = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
			req.Headers.Authorization = new AuthenticationHeaderValue("Basic", basic);

			using var resp = await _http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
			resp.EnsureSuccessStatusCode();

			using var stream = await resp.Content.ReadAsStreamAsync(ct);
			using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
			if (doc.RootElement.TryGetProperty("access_token", out var tokenEl))
			{
				_accessToken = tokenEl.GetString();
				if (doc.RootElement.TryGetProperty("expires_in", out var expEl) && expEl.TryGetInt32(out var seconds))
				{
					_accessTokenExpiresAt = DateTime.UtcNow.AddSeconds(seconds - 30);
				}
				else
				{
					_accessTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);
				}

				return _accessToken!;
			}

			throw new InvalidOperationException("Failed to obtain access_token from SFCC token endpoint");
		}
		finally
		{
			_tokenLock.Release();
		}
	}

	private async Task<HttpRequestMessage> CreateRequestAsync(HttpMethod method, string url, object? body = null, CancellationToken ct = default)
	{
		var req = new HttpRequestMessage(method, url);
		var token = await GetAccessTokenAsync(ct);
		req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
		if (body != null)
		{
			var json = JsonSerializer.Serialize(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull });
			req.Content = new StringContent(json, Encoding.UTF8, "application/json");
		}

		return req;
	}

	private string CustomObjectUrl(string objectType, string? id = null)
	{
		var basePath = BuildBasePath();
		if (string.IsNullOrEmpty(id))
			return $"{basePath}/custom_objects/{objectType}";
		return $"{basePath}/custom_objects/{objectType}/{Uri.EscapeDataString(id)}";
	}

	public async Task<T?> GetCustomObjectAsync<T>(string objectType, string id, CancellationToken ct = default)
	{
		var url = CustomObjectUrl(objectType, id);
		using var req = await CreateRequestAsync(HttpMethod.Get, url, null, ct);
		using var resp = await _http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
		if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return default;
		resp.EnsureSuccessStatusCode();
		var stream = await resp.Content.ReadAsStreamAsync(ct);
		return await JsonSerializer.DeserializeAsync<T>(stream, cancellationToken: ct);
	}

	public async Task<JsonDocument> QueryCustomObjectsAsync(string objectType, string? filter = null, int start = 0, int count = 100, CancellationToken ct = default)
	{
		var url = CustomObjectUrl(objectType) + $"?start={start}&count={count}";
		if (!string.IsNullOrEmpty(filter))
			url += "&filter=" + Uri.EscapeDataString(filter);

		using var req = await CreateRequestAsync(HttpMethod.Get, url, null, ct);
		using var resp = await _http.SendAsync(req, HttpCompletionOption.ResponseHeadersRead, ct);
		resp.EnsureSuccessStatusCode();
		var stream = await resp.Content.ReadAsStreamAsync(ct);
		return await JsonDocument.ParseAsync(stream, cancellationToken: ct);
	}

	public async Task PutCustomObjectAsync(string objectType, string id, object body, CancellationToken ct = default)
	{
		var url = CustomObjectUrl(objectType, id);
		using var req = await CreateRequestAsync(HttpMethod.Put, url, body, ct);
		using var resp = await _http.SendAsync(req, ct);
		resp.EnsureSuccessStatusCode();
	}

	public async Task PatchCustomObjectAsync(string objectType, string id, object patch, CancellationToken ct = default)
	{
		var url = CustomObjectUrl(objectType, id);
		using var req = await CreateRequestAsync(HttpMethod.Patch, url, patch, ct);
		using var resp = await _http.SendAsync(req, ct);
		resp.EnsureSuccessStatusCode();
	}

	public async Task DeleteCustomObjectAsync(string objectType, string id, CancellationToken ct = default)
	{
		var url = CustomObjectUrl(objectType, id);
		using var req = await CreateRequestAsync(HttpMethod.Delete, url, null, ct);
		using var resp = await _http.SendAsync(req, ct);
		if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return;
		resp.EnsureSuccessStatusCode();
	}
}

