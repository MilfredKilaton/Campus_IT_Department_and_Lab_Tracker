using System;

namespace CITA_LT_Final_Project.Models
{
    public abstract class CampusAsset
    {
        public string? AssetTag {get; private set;}
        public decimal PurchasePrice {get; private set;}
        public string? Status {get; protected set;}

        protected CampusAsset(string tag, decimal price)
        {
            AssetTag = tag;
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