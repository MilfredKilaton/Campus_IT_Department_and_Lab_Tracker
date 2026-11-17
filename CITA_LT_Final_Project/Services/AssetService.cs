using System;
using System.Collections.Generic;
using System.Linq;
using CITA.Shared.Models;
using CITA.Shared.Interfaces;
using System.IO;
using System.Text.Json;

namespace CITA_LT_Final_Project.Services
{
    public class AssetService
    {
        private readonly List<CampusAsset> _assets = new();
        private readonly string filePath = "/home/milfred/Documents/Github/Campus_IT_Department_and_Lab_Tracker/DataStorage.json";

        public AssetService()
        {
            LoadFromFile();
        }

        public void AddAsset(CampusAsset asset) 
        {
            if (_assets.Any(existingAsset => existingAsset.AssetTag == asset.AssetTag))
            {
                throw new InvalidOperationException($"An asset with the tag '{asset.AssetTag}' already exists.");
            }
            _assets.Add(asset);
            SaveToFile();
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

            SaveToFile();
        }

        public void UpdateNetworkInfo(string tag, string newIp, string newMac)
        {
            var asset = _assets.FirstOrDefault(existingAsset => existingAsset.AssetTag == tag);
            if (asset == null) throw new Exception("Asset not found");

            if (asset is INetworkable networkableAsset)
            {
                networkableAsset.IpAddress = newIp;
                networkableAsset.MacAddress = newMac;
                SaveToFile();
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
                SaveToFile();
            }
        }

        public void SaveToFile()
        {
            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                string json = JsonSerializer.Serialize(_assets, options);
                File.WriteAllText(filePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving file: {ex.Message}");
            }
        }

        private void LoadFromFile()
        {
            try
            {
                if (File.Exists(filePath))
                {
                    string json = File.ReadAllText(filePath);
                    var loadedAssets = JsonSerializer.Deserialize<List<CampusAsset>>(json);
                    
                    if (loadedAssets != null)
                    {
                        _assets.Clear();
                        _assets.AddRange(loadedAssets);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading file: {ex.Message}");
            }
        }

        public List<CampusAsset> GetAllAssets() => _assets;

        public decimal GetTotalDepreciation() => _assets.Sum(asset => asset.CalculateDepreciation());

        public List<IBorrowable> GetCheckedOutItems() => _assets.OfType<IBorrowable>().Where(item => item.IsCheckedOut).ToList();

        public List<INetworkable> GetNetworkDevices() => _assets.OfType<INetworkable>().ToList();
    }
}