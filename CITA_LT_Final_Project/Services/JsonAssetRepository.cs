using System;
using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using CITA.Shared.Models;

namespace CITA_LT_Final_Project.Services
{
    public class JsonAssetRepository : IAssetRepository
    {
        private readonly string _filePath;

        public JsonAssetRepository(string filePath)
        {
            _filePath = filePath;
        }

        public List<CampusAsset> Load()
        {
            try
            {
                if (File.Exists(_filePath))
                {
                    string json = File.ReadAllText(_filePath);
                    var loadedAssets = JsonSerializer.Deserialize<List<CampusAsset>>(json);
                    return loadedAssets ?? new List<CampusAsset>();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading file: {ex.Message}");
            }
            return new List<CampusAsset>();
        }

        public void Save(List<CampusAsset> assets)
        {
            try
            {
                var options = new JsonSerializerOptions { WriteIndented = true };
                string json = JsonSerializer.Serialize(assets, options);
                File.WriteAllText(_filePath, json);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving file: {ex.Message}");
            }
        }
    }
}