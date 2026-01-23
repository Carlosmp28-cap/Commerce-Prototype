namespace CommercePrototype_Backend.Models.Salesforce
{
    public class AddressDto
    {
        public string Address_Id__c { get; set; } = string.Empty;
        public string Street__c { get; set; } = string.Empty;
        public string City__c { get; set; } = string.Empty;
        public string Postal_Code__c { get; set; } = string.Empty;
        public string Country__c { get; set; } = string.Empty;
    }
}
