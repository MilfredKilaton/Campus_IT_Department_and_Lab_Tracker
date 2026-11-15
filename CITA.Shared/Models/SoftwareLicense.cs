using System;
using System.Text.Json.Serialization;

namespace CITA.Shared.Models
{
    public class SoftwareLicense : CampusAsset
    {
        public int RemainingMonths { get; set; }

        [JsonConstructor]
        public SoftwareLicense() { }
        
        public SoftwareLicense(string assetTag, string assetName,decimal price, int remainingMonths) : base(assetTag, assetName, price) 
        {
            if (remainingMonths < 0)
                throw new ArgumentException("Remaining months cannot be negative.");

            RemainingMonths = remainingMonths;
        }

        public override decimal CalculateDepreciation() => PurchasePrice * (RemainingMonths / 12m);
    }
}