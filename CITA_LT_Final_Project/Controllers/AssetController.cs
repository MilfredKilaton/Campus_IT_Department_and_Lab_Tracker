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
            decimal price = jsonPayload.GetProperty("purchasePrice").GetDecimal();

            CampusAsset newAsset;
            switch (type)
            {
                case "WorkStation":
                    var ws = new WorkStation(tag, price);
                    if (jsonPayload.TryGetProperty("ipAddress", out var wsIp)) ws.IpAddress = wsIp.GetString() ?? "";
                    if (jsonPayload.TryGetProperty("macAddress", out var wsMac)) ws.MacAddress = wsMac.GetString() ?? "";
                    newAsset = ws;
                    break;
                case "NetworkingHardware":
                    var nh = new NetworkingHardware(tag, price);
                    if (jsonPayload.TryGetProperty("ipAddress", out var nhIp)) nh.IpAddress = nhIp.GetString() ?? "";
                    if (jsonPayload.TryGetProperty("macAddress", out var nhMac)) nh.MacAddress = nhMac.GetString() ?? "";
                    newAsset = nh;
                    break;
                case "Peripheral":
                    newAsset = new Peripheral(tag, price);
                    break;
                case "SoftwareLicense":
                    int months = jsonPayload.TryGetProperty("remainingMonths", out var m) ? m.GetInt32() : 12;
                    newAsset = new SoftwareLicense(tag, price, months);
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

    [HttpPost("checkout")]
    public IActionResult CheckOut([FromQuery] string tag, [FromQuery] string borrowerId)
    {
        var asset = _service.GetAllAssets().FirstOrDefault(a => a.AssetTag == tag) as IBorrowable;
        if (asset == null) return NotFound("Asset not found or not borrowable.");
        
        try
        {
            asset.CheckOut(borrowerId);
            return Ok("Checked out successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("checkin")]
    public IActionResult CheckIn([FromQuery] string tag)
    {
        var asset = _service.GetAllAssets().FirstOrDefault(a => a.AssetTag == tag) as IBorrowable;
        if (asset == null) return NotFound("Asset not found or not borrowable.");

        try
        {
            asset.CheckIn();
            return Ok("Checked in successfully.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("depreciation")]
    public IActionResult GetDepreciation() => Ok(_service.GetTotalDepreciation());

    [HttpGet("checkedout")]
    public IActionResult GetCheckedOut() => Ok(_service.GetCheckedOutItems());

    [HttpGet("network")]
    public IActionResult GetNetwork() => Ok(_service.GetNetworkDevices());
}