namespace CommercePrototype_Backend.Models
{
    public class SalesforceQueryResult<T>
    {
        public List<T> Records { get; set; } = new();
    }
}
