using System.Net.Http.Headers;
using CommercePrototype_Backend.Options;
using CommercePrototype_Backend.Services;
using CommercePrototype_Backend.Services.Sfcc.Shared;
using Microsoft.Extensions.Options;

namespace CommercePrototype_Backend.Services.Sfcc.DataApi;

/// <summary>
/// SFCC Data API client implementation (admin/back-office endpoints).
/// </summary>
public sealed class SfccDataApiClient : SfccApiClientBase, ISfccDataApiClient
{
	private readonly IOptionsMonitor<SfccOptions> _sfccOptions;
	private readonly ISfccAuthService _authService;
	private readonly SfccRequestContext _requestContext;

	public SfccDataApiClient(
		HttpClient httpClient,
		IOptionsMonitor<SfccOptions> sfccOptions,
		SfccRequestContext requestContext,
		ISfccAuthService authService,
		ILogger<SfccDataApiClient> logger)
		: base(httpClient, logger)
	{
		_sfccOptions = sfccOptions;
		_requestContext = requestContext;
		_authService = authService;
	}

	protected override async ValueTask ApplyRequestHeadersAsync(HttpRequestMessage request, CancellationToken cancellationToken)
	{
		var authToken = _requestContext.ClientAuthToken;
		if (string.IsNullOrWhiteSpace(authToken))
		{
			authToken = await _authService.GetAccessTokenAsync(cancellationToken);
			_requestContext.ClientAuthToken = authToken;
		}

		if (!string.IsNullOrWhiteSpace(authToken))
		{
			request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authToken);
		}

		await base.ApplyRequestHeadersAsync(request, cancellationToken);
	}

	protected override string BuildUrl(string endpoint)
	{
		var baseUrl = _sfccOptions.CurrentValue.ApiBaseUrl?.TrimEnd('/');
		var version = _sfccOptions.CurrentValue.ApiVersion ?? "v1";

		if (string.IsNullOrWhiteSpace(baseUrl))
		{
			throw new InvalidOperationException("Missing configuration: Sfcc:ApiBaseUrl");
		}

		if (endpoint.StartsWith("http"))
		{
			return endpoint;
		}

		if (!endpoint.StartsWith("/"))
		{
			endpoint = "/" + endpoint;
		}

		return $"{baseUrl}/s/-/dw/data/{version}{endpoint}";
	}
}
