using System;
using System.Collections.Generic;
using System.Linq;
using CITA.Shared.Models;
using CITA.Shared.Interfaces;

namespace CITA_LT_Final_Project.Services
{
    public class AssetService
    {
        private readonly List<CampusAsset> _assets;
        private readonly IAssetRepository _repository;

        public AssetService(IAssetRepository repository)
        {
            _repository = repository;
            _assets = _repository.Load();
        }

        public void AddAsset(CampusAsset asset) 
        {
            if (_assets.Any(existingAsset => existingAsset.AssetTag == asset.AssetTag))
            {
                throw new InvalidOperationException($"An asset with the tag '{asset.AssetTag}' already exists.");
            }
            _assets.Add(asset);
            _repository.Save(_assets);
        }

        public void UpdateAsset(string tag, string newName, decimal newPrice, string newStatus)
        {
            var asset = _assets.FirstOrDefault(existingAsset => existingAsset.AssetTag == tag);
            if (asset == null) throw new Exception("Asset not found");

            asset.AssetName = newName;
            asset.PurchasePrice = newPrice;
            asset.Status = newStatus;

            if (newStatus == "Available" && asset is IBorrowable borrowableAsset)
            {
                var isCheckedOutProp = borrowableAsset.GetType().GetProperty("IsCheckedOut");
                if (isCheckedOutProp != null) isCheckedOutProp.SetValue(borrowableAsset, false);

                var borrowerIdProp = borrowableAsset.GetType().GetProperty("BorrowerId");
                if (borrowerIdProp != null) borrowerIdProp.SetValue(borrowableAsset, null);
            }

            _repository.Save(_assets);
        }

        public void UpdateNetworkInfo(string tag, string newIp, string newMac)
        {
            var asset = _assets.FirstOrDefault(existingAsset => existingAsset.AssetTag == tag);
            if (asset == null) throw new Exception("Asset not found");

            if (asset is INetworkable networkableAsset)
            {
                networkableAsset.IpAddress = newIp;
                networkableAsset.MacAddress = newMac;
                _repository.Save(_assets);
            }
            else
            {
                throw new Exception("Asset is not a networkable device.");
            }
        }

        public void DeleteAsset(string tag)
        {
            var asset = _assets.FirstOrDefault(existingAsset => existingAsset.AssetTag == tag);
            if (asset != null)
            {
                _assets.Remove(asset);
                _repository.Save(_assets);
            }
        }

        public List<CampusAsset> GetAllAssets() => _assets;

        public decimal GetTotalDepreciation() => _assets.Sum(asset => asset.CalculateDepreciation());

        public List<IBorrowable> GetCheckedOutItems() => _assets.OfType<IBorrowable>().Where(item => item.IsCheckedOut).ToList();

        public List<INetworkable> GetNetworkDevices() => _assets.OfType<INetworkable>().ToList();
    }
}