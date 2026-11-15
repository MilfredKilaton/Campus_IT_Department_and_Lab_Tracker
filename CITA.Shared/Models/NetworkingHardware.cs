using System;
using System.Text.Json.Serialization;
using CITA.Shared.Interfaces;

namespace CITA.Shared.Models
{
    public class NetworkingHardware : CampusAsset, INetworkable
    {
        public string IpAddress { get; set; } = string.Empty;
        public string MacAddress { get; set; } = string.Empty;

        [JsonConstructor]
        public NetworkingHardware() { }
        
        public NetworkingHardware(string assetTag, string assetName, decimal price) : base(assetTag, assetName ,price)
        {
        }

        public override decimal CalculateDepreciation() => PurchasePrice / 7;
    }
}