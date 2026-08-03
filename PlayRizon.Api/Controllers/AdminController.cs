using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.Interfaces;

namespace PlayRizon.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // GET: api/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var dashboard = await _adminService.GetDashboardAsync();
            return Ok(dashboard);
        }

        // GET: api/admin/owners
        [HttpGet("owners")]
        public async Task<IActionResult> GetAllOwners()
        {
            var owners = await _adminService.GetAllOwnersAsync();
            return Ok(owners);
        }

        // GET: api/admin/owners/pending
        [HttpGet("owners/pending")]
        public async Task<IActionResult> GetPendingOwners()
        {
            var owners = await _adminService.GetPendingOwnersAsync();
            return Ok(owners);
        }

        // PUT: api/admin/owners/{id}/approve
        [HttpPut("owners/{id}/approve")]
        public async Task<IActionResult> ApproveOwner(Guid id)
        {
            var result = await _adminService.ApproveOwnerAsync(id);
            return Ok(new
            {
                success = true,
                message = result
            });
        }

        // PUT: api/admin/owners/{id}/reject
        [HttpPut("owners/{id}/reject")]
        public async Task<IActionResult> RejectOwner(Guid id)
        {
            var result = await _adminService.RejectOwnerAsync(id);
            return Ok(new
            {
                success = true,
                message = result
            });
        }
        // GET: api/admin/users
[HttpGet("users")]
public async Task<IActionResult> GetAllUsers()
{
    var users = await _adminService.GetAllUsersAsync();
    return Ok(users);
}
    }
}