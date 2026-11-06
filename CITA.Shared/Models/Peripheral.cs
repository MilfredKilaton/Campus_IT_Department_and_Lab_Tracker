using System;
using CITA.Shared.Interfaces;

namespace CITA.Shared.Models
{
    public class Peripheral : CampusAsset, IBorrowable
    {
        public bool IsCheckedOut { get; private set; }
        public string? BorrowerId { get; private set; }

        public Peripheral(string assetTag, decimal price) : base(assetTag, price)
        {
        }

        public override decimal CalculateDepreciation() => PurchasePrice / 3;

        public void CheckOut(string borrowedId)
        {
            if (Status == "InRepair") throw new InvalidOperationException("Cannot checkout. Asset is in repair.");
            if (IsCheckedOut) throw new InvalidOperationException("Asset is already checked out.");
            
            IsCheckedOut = true;
            BorrowerId = borrowedId;
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