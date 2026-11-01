using System;
using CITA.Shared.Interfaces;

namespace CITA.Shared.Models
{
    public class NetworkingHardware : CampusAsset, INetworkable
    {
        public string IpAddress { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;
    
        public NetworkingHardware(string assetTag, decimal price) : base(assetTag, price)
        {
            
        }
    
        public override decimal CalculateDepreciation() => PurchasePrice / 7;
    }
}