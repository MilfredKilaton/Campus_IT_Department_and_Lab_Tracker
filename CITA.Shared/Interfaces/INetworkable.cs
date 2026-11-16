using System;
using System.Linq;

namespace CITA.Shared.Interfaces
{
    public interface INetworkable
    {
        string IpAddress { get; set; }
        string MacAddress { get; set; }
    }

    public static class NetworkableValidator
    {
        public static void ValidateIp(string? ip)
        {
            if (string.IsNullOrWhiteSpace(ip)) return; // allow blank

            if (!System.Net.IPAddress.TryParse(ip, out _))
                throw new ArgumentException($"'{ip}' is not a valid IP address.");
        }

        public static void ValidateMac(string? mac)
        {
            if (string.IsNullOrWhiteSpace(mac)) return; // allow blank

            // Normalize dashes to colons (AA-BB-CC-DD-EE-FF -> AA:BB:CC:DD:EE:FF)
            var cleaned = mac.Replace("-", ":").Trim();
            var parts = cleaned.Split(':');

            if (parts.Length != 6 || parts.Any(p => p.Length != 2 || !p.All(Uri.IsHexDigit)))
                throw new ArgumentException($"'{mac}' is not a valid MAC address (AA:BB:CC:DD:EE:FF).");
        }
    }
}