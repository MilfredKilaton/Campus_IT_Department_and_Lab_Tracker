using System;
using System.Text.Json.Serialization;
using CITA.Shared.Interfaces;

namespace CITA.Shared.Models
{
    public class WorkStation : CampusAsset, IBorrowable, INetworkable
    {
        // --- Backing fields for validated network properties ---
        private string _ipAddress = string.Empty;
        private string _macAddress = string.Empty;

        public bool IsCheckedOut { get; private set; }
        public string? BorrowerId { get; private set; }

        // --- Validated properties (replaces the old auto-properties) ---
        public string IpAddress
        {
            get => _ipAddress;
            set { NetworkableValidator.ValidateIp(value); _ipAddress = value?.Trim() ?? string.Empty; }
        }

        public string MacAddress
        {
            get => _macAddress;
            set { NetworkableValidator.ValidateMac(value); _macAddress = value?.Trim() ?? string.Empty; }
        }

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