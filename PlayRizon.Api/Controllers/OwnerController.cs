using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.DTOs.Owner;
using PlayRizon.Api.Interfaces;
using System.Security.Claims;

namespace PlayRizon.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OwnerController : ControllerBase
    {
        private readonly IOwnerService _ownerService;

        public OwnerController(IOwnerService ownerService)
        {
            _ownerService = ownerService;
        }

        // 
        
        [Authorize]
[HttpPost("apply")]
public IActionResult Apply()
{
    return Ok(User.Claims.Select(c => new
    {
        c.Type,
        c.Value
    }));
}
        //[HttpGet("dashboard")]
        //public async Task<IActionResult> GetDashboard()
        //{
        //    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        //    if (userIdClaim == null)
        //        return Unauthorized();

        //    var userId = Guid.Parse(userIdClaim.Value);

        //    var dashboard = await _ownerService.GetDashboardAsync(userId);

        //    return Ok(dashboard);
        //}
        [Authorize(Roles = "Owner")]
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
                return Unauthorized();

            var userId = Guid.Parse(userIdClaim.Value);

            var result = await _ownerService.GetDashboardAsync(userId);

            return Ok(result);
        }
    }
}