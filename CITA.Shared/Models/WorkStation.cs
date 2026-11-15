using System;
using System.Text.Json.Serialization;
using CITA.Shared.Interfaces;

namespace CITA.Shared.Models
{
    public class WorkStation : CampusAsset, IBorrowable, INetworkable
    {
        public bool IsCheckedOut { get; private set; }
        public string? BorrowerId { get; private set; }
        public string IpAddress { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;

        [JsonConstructor]
        public WorkStation() { }

        public WorkStation(string assetTag, string assetName, decimal purchasePrice) : base(assetTag, assetName, purchasePrice)
        {
        }

        public override decimal CalculateDepreciation() => PurchasePrice / 5;

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