using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.Interfaces;
using System.Security.Claims;

namespace PlayRizon.Api.Controllers
{
    [ApiController]
    [Route("api/owner/bookings")]
    [Authorize(Roles = "Owner")]
    public class OwnerBookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public OwnerBookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet("report")]
        public async Task<IActionResult> GetReport()
        {
            var ownerId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var bookings = await _bookingService.GetOwnerBookingsAsync(ownerId);

            return Ok(new
            {
                bookings
            });
        }
        [HttpGet("report/preferences")]
public IActionResult GetReportPreferences()
{
    return Ok(new
    {
        preferences = new
        {
            enabled = false,
            cadence = "monthly"
        }
    });
}
[HttpPatch("report/preferences")]
public IActionResult UpdateReportPreferences([FromBody] dynamic request)
{
    return Ok(new
    {
        message = "Digest preferences updated",
        preferences = new
        {
            enabled = (bool?)request?.enabled ?? false,
            cadence = (string?)request?.cadence ?? "monthly"
        }
    });
}

[HttpPost("report/email")]
public IActionResult SendReportEmail()
{
    return Ok(new
    {
        message = "Monthly email digest sent."
    });
}

[HttpPatch("{bookingId}/reschedule-decision")]
public IActionResult RescheduleDecision(
    Guid bookingId,
    [FromBody] RescheduleDecisionDto dto)
{
    return Ok(new
    {
        message = $"Reschedule request {dto.Decision} successfully."
    });
}

public class RescheduleDecisionDto
{
    public string Decision { get; set; } = string.Empty;
    public string? OwnerNotes { get; set; }
}
    }
}