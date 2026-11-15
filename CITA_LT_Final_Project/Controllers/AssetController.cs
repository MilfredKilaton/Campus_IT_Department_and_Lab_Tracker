using Microsoft.AspNetCore.Mvc;
using CITA.Shared.Models;
using CITA.Shared.Interfaces;
using CITA_LT_Final_Project.Services;
using System.Text.Json;

namespace CITA_LT_Final_Project.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssetController : ControllerBase
{
    private readonly AssetService _service;

    public AssetController(AssetService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult GetAll() => Ok(_service.GetAllAssets());

    [HttpPost]
    public IActionResult Add([FromBody] JsonElement jsonPayload)
    {
        try
        {
            string type = jsonPayload.GetProperty("type").GetString() ?? "";
            string tag = jsonPayload.GetProperty("assetTag").GetString() ?? "";
            string name = jsonPayload.GetProperty("assetName").GetString() ?? "";
            decimal price = jsonPayload.GetProperty("purchasePrice").GetDecimal();

            CampusAsset newAsset;
            switch (type)
            {
                case "WorkStation":
                    var workstation = new WorkStation(tag, name, price);
                    if (jsonPayload.TryGetProperty("ipAddress", out var workstationIp)) workstation.IpAddress = workstationIp.GetString() ?? "";
                    if (jsonPayload.TryGetProperty("macAddress", out var workstationMac)) workstation.MacAddress = workstationMac.GetString() ?? "";
                    newAsset = workstation;
                    break;
                case "NetworkingHardware":
                    var networkingHardware = new NetworkingHardware(tag, name, price);
                    if (jsonPayload.TryGetProperty("ipAddress", out var networkingIp)) networkingHardware.IpAddress = networkingIp.GetString() ?? "";
                    if (jsonPayload.TryGetProperty("macAddress", out var networkingMac)) networkingHardware.MacAddress = networkingMac.GetString() ?? "";
                    newAsset = networkingHardware;
                    break;
                case "Peripheral":
                    newAsset = new Peripheral(tag, name, price);
                    break;
                case "SoftwareLicense":
                    int months = jsonPayload.TryGetProperty("remainingMonths", out var remainingMonths) ? remainingMonths.GetInt32() : 12;
                    newAsset = new SoftwareLicense(tag, name, price, months);
                    break;
                default:
                    return BadRequest($"Unknown asset type: {type}");
            }

            _service.AddAsset(newAsset);
            return Ok("Asset added successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error: {ex.Message}");
        }
    }

    [HttpPut("update")]
    public IActionResult Update([FromBody] JsonElement jsonPayload)
    {
        try
        {
            string tag = jsonPayload.GetProperty("assetTag").GetString() ?? "";
            string name = jsonPayload.GetProperty("assetName").GetString() ?? "";
            decimal price = jsonPayload.GetProperty("purchasePrice").GetDecimal();
            string status = jsonPayload.GetProperty("status").GetString() ?? "Available";

            _service.UpdateAsset(tag, name, price, status);
            return Ok("Asset updated successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("delete")]
    public IActionResult Delete([FromQuery] string tag)
    {
        try
        {
            _service.DeleteAsset(tag);
            return Ok("Asset deleted successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("checkout")]
    public IActionResult CheckOut([FromQuery] string tag, [FromQuery] string borrowerId)
    {
        var asset = _service.GetAllAssets().FirstOrDefault(existingAsset => existingAsset.AssetTag == tag) as IBorrowable;
        if (asset == null) return NotFound("Asset not found or not borrowable.");
        try { asset.CheckOut(borrowerId); return Ok("Checked out successfully."); }
        catch (Exception ex) { return BadRequest(ex.Message); }
    }

    [HttpPost("checkin")]
    public IActionResult CheckIn([FromQuery] string tag)
    {
        var asset = _service.GetAllAssets().FirstOrDefault(existingAsset => existingAsset.AssetTag == tag) as IBorrowable;
        if (asset == null) return NotFound("Asset not found or not borrowable.");
        try { asset.CheckIn(); return Ok("Checked in successfully."); }
        catch (Exception ex) { return BadRequest(ex.Message); }
    }

    [HttpGet("depreciation")]
    public IActionResult GetDepreciation() => Ok(_service.GetTotalDepreciation());

    [HttpGet("network")]
    public IActionResult GetNetwork()
    {
        var devices = _service.GetNetworkDevices();
        return Ok(devices); 
    }
}