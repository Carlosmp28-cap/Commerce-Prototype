
using System;

namespace CommercePrototype_Backend.Models
{
    public class ZoneDto
    {
        public string Zone_Id__c { get; set; } = string.Empty;
        public string Zone_Name__c { get; set; } = string.Empty;
        public string Store__c { get; set; } = string.Empty;
        public double Height__c { get; set; }
        public DateTime Updated_At__c { get; set; }
        public double X__c { get; set; }
        public double Y__c { get; set; }
        public double Width__c { get; set; }
        public string Unit__c { get; set; } = string.Empty;

        // Compatibilidade com código legado
        public string ZoneId { get => Zone_Id__c; set => Zone_Id__c = value; }
        public string ZoneName { get => Zone_Name__c; set => Zone_Name__c = value; }
        public string StoreId { get => Store__c; set => Store__c = value; }
        public double Width { get => Width__c; set => Width__c = value; }
        public double Height { get => Height__c; set => Height__c = value; }
        public PositionDto Position {
            get => new PositionDto(X__c, Y__c);
            set { X__c = value?.X ?? 0; Y__c = value?.Y ?? 0; }
        }
    }
}
