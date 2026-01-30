using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;

namespace CommercePrototype_Backend.Controllers;

[ApiController]
[Route("api/images")]
public sealed class ImageProxyController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ImageProxyController> _logger;

    // Only allow proxying from this host to avoid becoming an open proxy.
    private static readonly string[] AllowedHosts = new[]
    {
        "bcqk-007.dx.commercecloud.salesforce.com"
    };

    public ImageProxyController(IHttpClientFactory httpClientFactory, ILogger<ImageProxyController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    /// <summary>
    /// Proxy an external image URL (limited to allowed hosts) so the frontend
    /// can request images from the backend origin.
    /// </summary>
    [HttpGet("proxy")]
    public async Task<IActionResult> Proxy([FromQuery] string src, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(src)) return BadRequest(new { error = "src is required" });

        if (!Uri.TryCreate(src, UriKind.Absolute, out var uri))
        {
            return BadRequest(new { error = "invalid src" });
        }

        if (!AllowedHosts.Contains(uri.Host))
        {
            _logger.LogWarning("Blocked image proxy request for host {Host}", uri.Host);
            return BadRequest(new { error = "host not allowed" });
        }

        try
        {
            var client = _httpClientFactory.CreateClient();
            using var resp = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!resp.IsSuccessStatusCode)
            {
                _logger.LogWarning("Image proxy upstream returned {Status} for {Src}", resp.StatusCode, src);
                return StatusCode((int)resp.StatusCode);
            }

            var contentType = resp.Content.Headers.ContentType?.ToString() ?? "application/octet-stream";
            var stream = await resp.Content.ReadAsStreamAsync(cancellationToken);

            // Let clients cache images for a short period; adjust as needed.
            Response.Headers["Cache-Control"] = "public, max-age=3600";

            return File(stream, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error proxying image {Src}", src);
            return StatusCode(500, new { error = "Failed to fetch image" });
        }
    }
}
