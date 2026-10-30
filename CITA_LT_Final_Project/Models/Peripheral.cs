using System;
using CITA_LT_Final_Project.Interfaces;

namespace CITA_LT_Final_Project.Models
{
    public class Peripheral : CampusAsset, IBorrowable
    {
        public bool IsCheckedOut { get; private set; }
        public string? BorrowerId { get; private set; }

        public Peripheral(string assetTag, decimal price) : base(assetTag, price) { }

        public override decimal CalculateDepreciation() => PurchasePrice / 3;

        public void CheckOut(string _borrowerId)
        {
            IsCheckedOut = true;
            BorrowerId = _borrowerId;
            Status = "CheckedOut";
        }

        public void CheckIn()
        {
            IsCheckedOut = false;
            BorrowerId = null;
            Status = "Available";
        }
    }
}