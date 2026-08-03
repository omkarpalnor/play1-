using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.DTOs.Booking;
using PlayRizon.Api.Interfaces;
using System.Security.Claims;

namespace PlayRizon.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        public async Task<IActionResult> Book(CreateBookingDto dto)
        {
            var userId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var booking = await _bookingService.CreateBookingAsync(dto, userId);

            return Ok(booking);
        }

        [HttpGet("my")]
        public async Task<IActionResult> MyBookings()
        {
            var userId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            return Ok(await _bookingService.GetMyBookingsAsync(userId));
        }

        [HttpGet("owner")]
        public async Task<IActionResult> OwnerBookings()
        {
            var ownerId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            return Ok(await _bookingService.GetOwnerBookingsAsync(ownerId));
        }
        [HttpPatch("{id}/cancel")]
public async Task<IActionResult> Cancel(Guid id)
{
    var userId = Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    var cancelled = await _bookingService.CancelBookingAsync(id, userId);

    if (!cancelled)
        return NotFound();

    return Ok(new
    {
        message = "Booking cancelled successfully."
    });
}
    }
}