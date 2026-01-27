namespace CommercePrototype_Backend.Models.Customers;

public sealed record CustomerOrderDto(
    string OrderNo,
    string? OrderId,
    string? Status,
    decimal? OrderTotal,
    DateTime? CreatedAt
);
