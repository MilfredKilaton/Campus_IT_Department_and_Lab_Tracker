using System;
using System.Text.Json.Serialization;

namespace CITA.Shared.Models
{
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
    [JsonDerivedType(typeof(WorkStation), typeDiscriminator: "WorkStation")]
    [JsonDerivedType(typeof(NetworkingHardware), typeDiscriminator: "NetworkingHardware")]
    [JsonDerivedType(typeof(Peripheral), typeDiscriminator: "Peripheral")]
    [JsonDerivedType(typeof(SoftwareLicense), typeDiscriminator: "SoftwareLicense")]
    public abstract class CampusAsset
    {
        [JsonPropertyName("assetTag")]
        public string? AssetTag { get; set; }

        [JsonPropertyName("assetName")]
        public string? AssetName { get; set; }

        [JsonPropertyName("purchasePrice")]
        public decimal PurchasePrice { get; set; }

        [JsonPropertyName("status")]
        public string? Status { get; set; }

        // TypeName has been deleted here

        [JsonConstructor]
        protected CampusAsset() { }

        protected CampusAsset(string assetTag, string assetName, decimal purchasePrice)
        {
            if (string.IsNullOrWhiteSpace(assetTag))
                throw new ArgumentException("Asset Tag cannot be empty.");
            
            if (purchasePrice <= 0)
                throw new ArgumentException("Purchase Price must be greater than zero.");

            AssetTag = assetTag;
            AssetName = assetName;
            PurchasePrice = purchasePrice;
            Status = "Available";
        }

        public abstract decimal CalculateDepreciation();

        public virtual string GetMaintenanceStatus()
        {
            return "Operational";
        }
    }
}