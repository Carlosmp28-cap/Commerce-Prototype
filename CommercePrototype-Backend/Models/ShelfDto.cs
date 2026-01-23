
namespace CommercePrototype_Backend.Models
{
    public class ShelfDto
    {
        public string Shelf_Id__c { get; set; } = string.Empty;
        public string Store__c { get; set; } = string.Empty;
        public string Zone__c { get; set; } = string.Empty;
        public double X__c { get; set; }
        public double Y__c { get; set; }
        public double Width__c { get; set; }
        public double Height__c { get; set; }
        public int Levels__c { get; set; }

        // Compatibilidade com código legado
        public string Id { get => Shelf_Id__c; set => Shelf_Id__c = value; }
        public string StoreId { get => Store__c; set => Store__c = value; }
        public string ZoneId { get => Zone__c; set => Zone__c = value; }
        public double Width { get => Width__c; set => Width__c = value; }
        public double Height { get => Height__c; set => Height__c = value; }
        public PositionDto Position {
            get => new PositionDto(X__c, Y__c);
            set { X__c = value?.X ?? 0; Y__c = value?.Y ?? 0; }
        }
    }
}
