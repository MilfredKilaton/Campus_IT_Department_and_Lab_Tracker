using System;

namespace CITA.Shared.Models
{
    public abstract class CampusAsset
    {
        public string? AssetTag { get; private set; }
        public decimal PurchasePrice { get; private set; }
        public string? Status { get; protected set; }

        protected CampusAsset(string assetTag, decimal price)
        {
            // VALIDATION
            if (string.IsNullOrWhiteSpace(assetTag))
                throw new ArgumentException("Asset Tag cannot be empty.");
            
            if (price <= 0)
                throw new ArgumentException("Purchase Price must be greater than zero.");

            AssetTag = assetTag;
            PurchasePrice = price;
            Status = "Available";
        }

        public abstract decimal CalculateDepreciation();

        public virtual string GetMaintenanceStatus()
        {
            return "Operational";
        }
    }
}