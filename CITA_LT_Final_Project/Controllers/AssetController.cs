using Microsoft.AspNetCore.Mvc;
using CITA.Shared.Models;
using CITA_LT_Final_Project.Services;

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

    // 1. GET: api/asset
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(_service.GetAllAssets());
    }

    // 2. POST: api/asset
    [HttpPost]
    public IActionResult Add([FromBody] CampusAsset asset)
    {
        _service.AddAsset(asset);
        return Ok("Asset added successfully.");
    }

    // 3. GET: api/asset/depreciation
    [HttpGet("depreciation")]
    public IActionResult GetDepreciation()
    {
        return Ok(_service.GetTotalDepreciation());
    }

    // 4. GET: api/asset/checkedout
    [HttpGet("checkedout")]
    public IActionResult GetCheckedOut()
    {
        return Ok(_service.GetCheckedOutItems());
    }

    // 5. GET: api/asset/network
    [HttpGet("network")]
    public IActionResult GetNetwork()
    {
        return Ok(_service.GetNetworkDevices());
    }
}