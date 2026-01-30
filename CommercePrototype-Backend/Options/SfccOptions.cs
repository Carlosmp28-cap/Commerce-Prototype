using System.ComponentModel.DataAnnotations;

namespace CommercePrototype_Backend.Options;

/// <summary>
/// Configuration settings used to connect to Salesforce Commerce Cloud (SFCC).
/// </summary>
/// <remarks>
/// These values are bound from configuration (for example, <c>appsettings.json</c>)
/// under the <c>Sfcc</c> section.
/// </remarks>
public sealed class SfccOptions
{
    /// <summary>
    /// Base URL for SFCC API calls.
    /// </summary>
    /// <example>https://your-instance.demandware.net</example>
    [Required]
    [Url]
    public string? ApiBaseUrl { get; init; }

    /// <summary>
    /// SFCC API version.
    /// </summary>
    /// <example>v1</example>
    public string ApiVersion { get; init; } = "v1";

    /// <summary>
    /// SFCC site identifier.
    /// </summary>
    /// <example>RefArch</example>
    public string SiteId { get; init; } = "RefArch";

    /// <summary>
    /// Client id used for Shop API access (sent as <c>x-dw-client-id</c>).
    /// </summary>
    /// <remarks>
    /// This is required for the public SFCC Shop API calls used by this prototype.
    /// Ensure the client id is whitelisted in OCAPI settings for the sandbox.
    /// </remarks>
    [Required]
    public string? ClientId { get; init; }

    /// <summary>
    /// Optional confidential (server-side) client id used for OAuth client-credentials.
    /// </summary>
    /// <remarks>
    /// Use this when your backend needs a bearer token (for example, customer operations).
    /// If omitted, the code falls back to <see cref="ClientId"/>.
    /// </remarks>
    public string? OAuthClientId { get; init; }

    /// <summary>
    /// Optional confidential (server-side) client secret/password used for OAuth client-credentials.
    /// </summary>
    /// <remarks>
    /// Never place this value in frontend code. Prefer user-secrets or environment variables.
    /// </remarks>
    public string? OAuthClientSecret { get; init; }

    /// <summary>
    /// OAuth token endpoint URL (used by the auth client to retrieve an access token).
    /// </summary>
    /// <remarks>
    /// Only required if you implement token-based flows (for example, authenticated operations such as
    /// baskets/orders/customer data). Read-only Shop API calls typically use <c>x-dw-client-id</c>.
    /// </remarks>
    [Url]
    public string? OAuthTokenUrl { get; init; }

    /// <summary>
    /// Optional SFCC instance name used when building some asset/image URLs.
    /// </summary>
    public string? InstanceName { get; init; }

    /// <summary>
    /// Optional customer list id used for Data API customer registration.
    /// </summary>
    public string? CustomerListId { get; init; }

    /// <summary>
    /// Optional trusted system login used by Shop API <c>/customers/auth/trustedsystem</c>.
    /// </summary>
    public string? TrustedSystemLogin { get; init; }

    /// <summary>
    /// Optional trusted system password used by Shop API <c>/customers/auth/trustedsystem</c>.
    /// </summary>
    public string? TrustedSystemPassword { get; init; }

    /// <summary>
    /// Whether to include <c>login</c>/<c>password</c> fields when calling <c>/customers/auth/trustedsystem</c>.
    /// Some sandboxes reject these fields; keep false unless required by your OCAPI settings.
    /// </summary>
    public bool TrustedSystemIncludeLogin { get; init; }
}
