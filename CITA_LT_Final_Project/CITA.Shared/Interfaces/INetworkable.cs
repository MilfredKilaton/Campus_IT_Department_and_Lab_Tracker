using System;

namespace CITA.Shared.Interfaces
{
    public interface INetworkable
    {
        string IpAddress { get; set; }
        string MacAddress { get; set; }
    }
}