namespace CommercePrototype_Backend.Models.Customers;

public sealed record RegisterCustomerRequestDto(
    string Email,
    string Password,
    string? FirstName,
    string? LastName
);

public sealed record UpdateCustomerProfileRequestDto(
    string? Email,
    string? FirstName,
    string? LastName
);

public sealed record AddCustomerAddressRequestDto(
    string AddressId,
    string? FirstName,
    string? LastName,
    string? Address1,
    string? Address2,
    string? City,
    string? PostalCode,
    string? CountryCode,
    string? Phone
);
