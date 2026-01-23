using System;

namespace CommercePrototype_Backend.Models.Salesforce
{
    public class StoreDto
    {
        public string StoreId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public double Width__c { get; set; }
        public string Unit__c { get; set; } = string.Empty;
        public string Status__c { get; set; } = string.Empty;
        public string Opening_Hours__c { get; set; } = string.Empty;
        public double Length__c { get; set; }
        public string Address__c { get; set; } = string.Empty;
        public DateTime Updated_At__c { get; set; }

        // Compatibilidade com código legado
        private GridDto? _gridDimensions;
        public GridDto? GridDimensions {
            get {
                if (_gridDimensions == null)
                {
                    _gridDimensions = new GridDto {
                        Width = Width__c,
                        Height = Length__c,
                        Unit = Unit__c
                    };
                }
                return _gridDimensions;
            }
            set {
                _gridDimensions = value;
                if (value != null)
                {
                    Width__c = value.Width;
                    Length__c = value.Height;
                    if (!string.IsNullOrEmpty(value.Unit))
                        Unit__c = value.Unit;
                }
            }
        }
    }
}
