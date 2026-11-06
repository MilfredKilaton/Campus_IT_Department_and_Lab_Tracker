using System;

namespace CITA.Shared.Models
{
    public class SoftwareLicense : CampusAsset
    {
        public int RemainingMonths { get; set; }

        public SoftwareLicense(string assetTag, decimal price, int remainingMonths) : base(assetTag, price) 
        {
            if (remainingMonths < 0)
                throw new ArgumentException("Remaining months cannot be negative.");

            RemainingMonths = remainingMonths;
        }

        public override decimal CalculateDepreciation() => PurchasePrice * (RemainingMonths / 12m);
    }
}