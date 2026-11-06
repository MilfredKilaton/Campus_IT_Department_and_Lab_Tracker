using System;
using System.Collections.Generic;
using System.Linq;
using CITA.Shared.Models;
using CITA.Shared.Interfaces;

namespace CITA_LT_Final_Project.Services
{
    public class AssetService
    {
        private readonly List<CampusAsset> _assets = new();

        public void AddAsset(CampusAsset asset) => _assets.Add(asset);
        public List<CampusAsset> GetAllAssets() => _assets;

        public decimal GetTotalDepreciation()
        {
            return _assets.Sum(asset => asset.CalculateDepreciation());
        }

        public List<IBorrowable> GetCheckedOutItems()
        {
            return _assets.OfType<IBorrowable>().Where(item => item.IsCheckedOut).ToList();
        }

        public List<INetworkable> GetNetworkDevices()
        {
            return _assets.OfType<INetworkable>().ToList();
        }
    }
}