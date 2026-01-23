
namespace CommercePrototype_Backend.Models
{
    public class ProductLocationDto
    {
        public string Product__c { get; set; } = string.Empty;
        public string Shelf__c { get; set; } = string.Empty;
        public int Quantity__c { get; set; }
        public int? Level__c { get; set; }
        public string? Product_Name__c { get; set; }

        // Compatibilidade com código legado
        public string ProductId { get => Product__c; set => Product__c = value; }
        public string ShelfId { get => Shelf__c; set => Shelf__c = value; }
        public int Quantity { get => Quantity__c; set => Quantity__c = value; }
        public int? Level { get => Level__c; set => Level__c = value; }
        public string? ProductName { get => Product_Name__c; set => Product_Name__c = value; }
        public PositionDto? Position { get; set; } // Se necessário, pode ser populado externamente
    }
}
