using System;

namespace CITA_LT_Final_Project.Interfaces
{
    public interface INetworkable
    {
        string IpAddress { get; set; }
        string MacAddress { get; set; }
    }
}