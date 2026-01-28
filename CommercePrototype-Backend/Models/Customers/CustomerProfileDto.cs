namespace CommercePrototype_Backend.Models.Customers;

public sealed record CustomerProfileDto(
    string CustomerId,
    string? Email,
    string? FirstName,
    string? LastName,
    bool? IsRegistered
);
