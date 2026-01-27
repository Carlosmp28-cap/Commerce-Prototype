namespace CommercePrototype_Backend.Models.Customers;

public sealed record CustomerAddressDto(
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
