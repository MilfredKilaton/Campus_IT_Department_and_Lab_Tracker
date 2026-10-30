using System;
using CITA_LT_Final_Project.Interfaces;

namespace CITA_LT_Final_Project.Models
{
    public class WorkStation : CampusAsset, IBorrowable, INetworkable
    {
        public bool IsCheckedOut { get; private set; }
        public string? BorrowerId { get; private set; }
        public string IpAddress { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;

        public WorkStation(string assetTag, decimal price) : base(assetTag, price)
        {
            
        }

        public override decimal CalculateDepreciation() => PurchasePrice / 5;

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