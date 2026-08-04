using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.DTOs.TournamentRegistration;
using PlayRizon.Api.Interfaces;
using System.Security.Claims;

namespace PlayRizon.Api.Controllers
{
    [ApiController]
    [Route("api")]
    public class TournamentRegistrationController : ControllerBase
    {
        private readonly ITournamentRegistrationService _registrationService;

        public TournamentRegistrationController(
            ITournamentRegistrationService registrationService)
        {
            _registrationService = registrationService;
        }

        // USER REGISTER
        [Authorize]
[HttpPost("user/tournaments/{id}/register")]
public async Task<IActionResult> Register(
    Guid id,
    RegisterTournamentDto dto)
{
    try
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        dto.TournamentId = id;

        var result = await _registrationService.RegisterAsync(dto, userId);

        return Ok(new
        {
            success = true,
            message = "Tournament Registered Successfully",
            registration = result
        });
    }
    catch (Exception ex)
    {
        return BadRequest(new
        {
            success = false,
            message = ex.Message
        });
    }
}

        // OWNER VIEW REGISTRATIONS
        [Authorize(Roles = "Owner")]
        [HttpGet("owner/tournament-registrations/{id}")]
        public async Task<IActionResult> GetRegistrations(Guid id)
        {
            var registrations =
                await _registrationService.GetRegistrationsByTournamentAsync(id);

            return Ok(new
            {
                success = true,
                registrations
            });
        }

        // APPROVE
        [Authorize(Roles = "Owner")]
        [HttpPatch("owner/tournament-registrations/approve/{id}")]
        public async Task<IActionResult> Approve(Guid id)
        {
            var success =
                await _registrationService.ApproveRegistrationAsync(id);

            if (!success)
                return NotFound();

            return Ok(new
            {
                success = true,
                message = "Registration Approved"
            });
        }

        // REJECT
        [Authorize(Roles = "Owner")]
        [HttpPatch("owner/tournament-registrations/reject/{id}")]
        public async Task<IActionResult> Reject(Guid id)
        {
            var success =
                await _registrationService.RejectRegistrationAsync(id);

            if (!success)
                return NotFound();

            return Ok(new
            {
                success = true,
                message = "Registration Rejected"
            });
        }
    }
}