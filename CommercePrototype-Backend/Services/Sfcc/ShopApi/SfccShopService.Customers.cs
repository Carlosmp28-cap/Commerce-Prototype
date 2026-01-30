using System.Net;
using System.Text.Json;
using CommercePrototype_Backend.Models.Customers;
using CommercePrototype_Backend.Services.Json;
using CommercePrototype_Backend.Services.Sfcc.Shared;

namespace CommercePrototype_Backend.Services.Sfcc.ShopApi;

public sealed partial class SfccShopService
{
    public async Task<CustomerProfileDto> RegisterCustomerAsync(RegisterCustomerRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request is null) throw new ArgumentNullException(nameof(request));
        if (string.IsNullOrWhiteSpace(request.Email)) throw new ArgumentException("Email is required", nameof(request));
        if (string.IsNullOrWhiteSpace(request.Password)) throw new ArgumentException("Password is required", nameof(request));

        // NOTE: Shop API and Data API accept different customer-create shapes.
        // - Shop API /customers expects `login`.
        // - Data API /customer_lists/{id}/customers rejects `login` (UnknownPropertyException).
        var shopPayload = new
        {
            login = request.Email,
            email = request.Email,
            password = request.Password,
            first_name = request.FirstName,
            last_name = request.LastName
        };

        var dataPayload = new
        {
            email = request.Email,
            password = request.Password,
            first_name = request.FirstName,
            last_name = request.LastName
        };

        // Some SFCC sandboxes require a *shopper* auth context to create customers.
        // In practice, POST /customers often expects an Authorization token issued by Shop API (guest or trusted-system),
        // not an OAuth client_credentials token.
        //
        // Strategy:
        // 1) Prefer trusted-system shopper session when available (strongest).
        // 2) Otherwise fall back to a guest shopper session.
        // 3) As a last resort, keep the OAuth client token fallback (some sandboxes accept it).
        try
        {
            var trusted = await _authService.GetTrustedSystemShopperSessionAsync(cancellationToken);
            if (!string.IsNullOrWhiteSpace(trusted.AuthToken))
            {
                _requestContext.ClientAuthToken = trusted.AuthToken;
                _requestContext.ShopperAuthToken = trusted.AuthToken;
            }
            _requestContext.ShopperCookieHeader = trusted.CookieHeader;

            if (string.IsNullOrWhiteSpace(_requestContext.ClientAuthToken) && string.IsNullOrWhiteSpace(_requestContext.ShopperCookieHeader))
            {
                throw new InvalidOperationException("Trusted-system session did not return an auth token or cookie");
            }
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Trusted-system auth unavailable; falling back to guest shopper session for customer registration");

            try
            {
                var guest = await _authService.GetGuestShopperSessionAsync(cancellationToken);
                _requestContext.ShopperAuthToken = guest.AuthToken;
                _requestContext.ShopperCookieHeader = guest.CookieHeader;
                _requestContext.ClientAuthToken = null;
            }
            catch (Exception guestEx)
            {
                _logger.LogWarning(guestEx, "Guest shopper session unavailable; falling back to OAuth client token for customer registration");
                var clientToken = await _authService.GetAccessTokenAsync(cancellationToken);
                _requestContext.ClientAuthToken = clientToken;
                _requestContext.ShopperAuthToken = null;
                _requestContext.ShopperCookieHeader = null;
            }
        }

        try
        {
            var json = await _apiClient.PostAsync<JsonElement>("/customers", shopPayload, cancellationToken);
            if (json.ValueKind == JsonValueKind.Undefined)
            {
                throw new InvalidOperationException("SFCC returned empty response for customer registration");
            }

            return MapCustomerProfile(json);
        }
        catch (HttpRequestException ex) when (IsUnknownPropertyException(ex, "login"))
        {
            _logger.LogWarning(ex, "SFCC Shop API rejected 'login' property; retrying registration without login field");

            try
            {
                var json = await _apiClient.PostAsync<JsonElement>("/customers", dataPayload, cancellationToken);
                if (json.ValueKind == JsonValueKind.Undefined)
                {
                    throw new InvalidOperationException("SFCC returned empty response for customer registration");
                }

                return MapCustomerProfile(json);
            }
            catch (HttpRequestException innerEx)
            {
                var customerListId = _sfccOptions.CurrentValue.CustomerListId;
                if (string.IsNullOrWhiteSpace(customerListId))
                {
                    throw;
                }

                _logger.LogWarning(innerEx, "SFCC Shop API registration failed; falling back to Data API customer list {CustomerListId}", customerListId);

                var dataJson = await _dataApiClient.PostAsync<JsonElement>($"/customer_lists/{customerListId}/customers", dataPayload, cancellationToken);
                if (dataJson.ValueKind == JsonValueKind.Undefined)
                {
                    throw new InvalidOperationException("SFCC Data API returned empty response for customer registration");
                }

                return MapCustomerProfile(dataJson);
            }
        }
    }

    private static bool IsUnknownPropertyException(HttpRequestException ex, string propertyName)
    {
        var message = ex.Message ?? string.Empty;
        if (!message.Contains("UnknownPropertyException", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var jsonStart = message.IndexOf('{');
        if (jsonStart >= 0)
        {
            var json = message[jsonStart..];
            try
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("fault", out var fault)
                    && fault.TryGetProperty("arguments", out var args)
                    && args.TryGetProperty("property", out var prop)
                    && prop.ValueKind == JsonValueKind.String)
                {
                    return string.Equals(prop.GetString(), propertyName, StringComparison.OrdinalIgnoreCase);
                }
            }
            catch
            {
                // fall back to string checks below
            }
        }

        if (message.Contains($"\"property\":\"{propertyName}\"", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return message.Contains($"'{propertyName}'", StringComparison.OrdinalIgnoreCase);
    }

    public async Task<CustomerProfileDto?> GetCustomerProfileAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var json = await GetCustomerJsonOrNullAsync(customerId, cancellationToken);
        if (json is null) return null;
        return MapCustomerProfile(json.Value);
    }

    public async Task<CustomerProfileDto?> UpdateCustomerProfileAsync(string customerId, UpdateCustomerProfileRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request is null) throw new ArgumentNullException(nameof(request));

        var payload = new
        {
            email = request.Email,
            first_name = request.FirstName,
            last_name = request.LastName
        };

        var json = await _apiClient.PatchAsync<JsonElement>($"/customers/{customerId}", payload, cancellationToken);
        return json.ValueKind == JsonValueKind.Undefined ? null : MapCustomerProfile(json);
    }

    public async Task<IReadOnlyList<CustomerAddressDto>> GetCustomerAddressesAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var json = await _apiClient.GetAsync<JsonElement>($"/customers/{customerId}/addresses", cancellationToken);
        return MapAddressList(json);
    }

    public async Task<CustomerAddressDto?> AddCustomerAddressAsync(string customerId, AddCustomerAddressRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request is null) throw new ArgumentNullException(nameof(request));

        var payload = new
        {
            address_id = request.AddressId,
            first_name = request.FirstName,
            last_name = request.LastName,
            address1 = request.Address1,
            address2 = request.Address2,
            city = request.City,
            postal_code = request.PostalCode,
            country_code = request.CountryCode,
            phone = request.Phone
        };

        var json = await _apiClient.PostAsync<JsonElement>($"/customers/{customerId}/addresses", payload, cancellationToken);
        return json.ValueKind == JsonValueKind.Undefined ? null : MapAddress(json);
    }

    public async Task<IReadOnlyList<CustomerOrderDto>> GetCustomerOrdersAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var json = await _apiClient.GetAsync<JsonElement>($"/customers/{customerId}/orders", cancellationToken);
        return MapOrderList(json);
    }

    private async Task<JsonElement?> GetCustomerJsonOrNullAsync(string customerId, CancellationToken cancellationToken)
    {
        try
        {
            return await _apiClient.GetAsync<JsonElement>($"/customers/{customerId}", cancellationToken);
        }
        catch (HttpRequestException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }
    }

    private static CustomerProfileDto MapCustomerProfile(JsonElement node)
    {
        var id = node.GetPropertyOrDefault("customer_id")
                 ?? node.GetPropertyOrDefault("customerId")
                 ?? node.GetPropertyOrDefault("id")
                 ?? string.Empty;

        var email = node.GetPropertyOrDefault("email");
        var firstName = node.GetPropertyOrDefault("first_name") ?? node.GetPropertyOrDefault("firstName");
        var lastName = node.GetPropertyOrDefault("last_name") ?? node.GetPropertyOrDefault("lastName");
        var registeredRaw = node.GetPropertyOrDefault("is_registered") ?? node.GetPropertyOrDefault("registered");
        bool? isRegistered = null;
        if (!string.IsNullOrWhiteSpace(registeredRaw) && bool.TryParse(registeredRaw, out var parsed))
        {
            isRegistered = parsed;
        }

        return new CustomerProfileDto(id, email, firstName, lastName, isRegistered);
    }

    private static IReadOnlyList<CustomerAddressDto> MapAddressList(JsonElement root)
    {
        if (root.TryGetProperty("data", out var dataNode) && dataNode.ValueKind == JsonValueKind.Array)
        {
            return dataNode.EnumerateArray().Select(MapAddress).Where(a => a is not null).Cast<CustomerAddressDto>().ToList();
        }

        if (root.ValueKind == JsonValueKind.Array)
        {
            return root.EnumerateArray().Select(MapAddress).Where(a => a is not null).Cast<CustomerAddressDto>().ToList();
        }

        return Array.Empty<CustomerAddressDto>();
    }

    private static CustomerAddressDto? MapAddress(JsonElement node)
    {
        var id = node.GetPropertyOrDefault("address_id")
                 ?? node.GetPropertyOrDefault("id")
                 ?? string.Empty;
        if (string.IsNullOrWhiteSpace(id)) return null;

        var firstName = node.GetPropertyOrDefault("first_name") ?? node.GetPropertyOrDefault("firstName");
        var lastName = node.GetPropertyOrDefault("last_name") ?? node.GetPropertyOrDefault("lastName");
        var address1 = node.GetPropertyOrDefault("address1");
        var address2 = node.GetPropertyOrDefault("address2");
        var city = node.GetPropertyOrDefault("city");
        var postal = node.GetPropertyOrDefault("postal_code") ?? node.GetPropertyOrDefault("postalCode");
        var country = node.GetPropertyOrDefault("country_code") ?? node.GetPropertyOrDefault("countryCode");
        var phone = node.GetPropertyOrDefault("phone");

        return new CustomerAddressDto(id, firstName, lastName, address1, address2, city, postal, country, phone);
    }

    private static IReadOnlyList<CustomerOrderDto> MapOrderList(JsonElement root)
    {
        if (root.TryGetProperty("data", out var dataNode) && dataNode.ValueKind == JsonValueKind.Array)
        {
            return dataNode.EnumerateArray().Select(MapOrder).Where(o => o is not null).Cast<CustomerOrderDto>().ToList();
        }

        if (root.ValueKind == JsonValueKind.Array)
        {
            return root.EnumerateArray().Select(MapOrder).Where(o => o is not null).Cast<CustomerOrderDto>().ToList();
        }

        return Array.Empty<CustomerOrderDto>();
    }

    private static CustomerOrderDto? MapOrder(JsonElement node)
    {
        var orderNo = node.GetPropertyOrDefault("order_no")
                     ?? node.GetPropertyOrDefault("orderNo")
                     ?? node.GetPropertyOrDefault("id")
                     ?? string.Empty;
        if (string.IsNullOrWhiteSpace(orderNo)) return null;

        var orderId = node.GetPropertyOrDefault("order_id") ?? node.GetPropertyOrDefault("orderId");
        var status = node.GetPropertyOrDefault("status") ?? node.GetPropertyOrDefault("status_value");
        var orderTotal = node.GetNestedDecimalOrDefault("order_total", "value")
                        ?? node.GetDecimalOrDefault("order_total");

        DateTime? createdAt = null;
        var createdRaw = node.GetPropertyOrDefault("creation_date") ?? node.GetPropertyOrDefault("created_at");
        if (DateTime.TryParse(createdRaw, out var createdParsed))
        {
            createdAt = createdParsed;
        }

        return new CustomerOrderDto(orderNo, orderId, status, orderTotal, createdAt);
    }
}
