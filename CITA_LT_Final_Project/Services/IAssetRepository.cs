using CITA.Shared.Models;

namespace CITA_LT_Final_Project.Services
{
    public interface IAssetRepository
    {
        List<CampusAsset> Load();
        void Save(List<CampusAsset> assets);
    }
}