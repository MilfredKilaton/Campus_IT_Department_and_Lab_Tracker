using System;

namespace CITA_LT_Final_Project.Models
{
    public class SoftwareLicense : CampusAsset
    {
        public int RemainingMonths { get; set; }

        public SoftwareLicense(string assetTag, decimal price, int _remainingMonths) : base(assetTag, price) 
        {
            RemainingMonths = _remainingMonths;
        }

        public override decimal CalculateDepreciation() => PurchasePrice * (RemainingMonths / 12m);
    }
}