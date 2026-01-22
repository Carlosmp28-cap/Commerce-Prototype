namespace CommercePrototype_Backend.Services;

public sealed class OutOfStockException : Exception
{
    public OutOfStockException(string productId, int requested, int available)
        : base($"Product '{productId}' is out of stock for requested quantity {requested}. Available: {available}.")
    {
        ProductId = productId;
        Requested = requested;
        Available = available;
    }

    public string ProductId { get; }
    public int Requested { get; }
    public int Available { get; }
}
