using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.DTOs.Turf;
using PlayRizon.Api.Interfaces;
using System.Security.Claims;



namespace PlayRizon.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TurfController : ControllerBase
    {
        private readonly ITurfService _turfService;

        public TurfController(ITurfService turfService)
        {
            _turfService = turfService;
        }

        [HttpPost]
        public async Task<IActionResult> AddTurf(CreateTurfDto dto)
        {
            var ownerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var turf = await _turfService.AddTurfAsync(dto, ownerId);

            return Ok(turf);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyTurfs()
        {
            var ownerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var turfs = await _turfService.GetMyTurfsAsync(ownerId);

            return Ok(turfs);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var turf = await _turfService.GetByIdAsync(id);

            if (turf == null)
                return NotFound();

            return Ok(turf);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateTurfDto dto)
        {
            var ownerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var updated = await _turfService.UpdateAsync(id, dto, ownerId);

            if (!updated)
                return NotFound();

            return Ok(new
            {
                message = "Turf updated successfully."
            });
        }
        [HttpGet]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> GetAll()
{
    var turfs = await _turfService.GetAllAsync();
    return Ok(turfs);
}

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var ownerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var deleted = await _turfService.DeleteAsync(id, ownerId);

            if (!deleted)
                return NotFound();

            return Ok(new
            {
                message = "Turf deleted successfully."
            });
        }

        [HttpGet("timeslot")]
[AllowAnonymous]
public async Task<IActionResult> GetTimeSlots(
    [FromQuery] Guid turfId,
    [FromQuery] DateTime date)
{
    var result = await _turfService.GetTimeSlotsAsync(turfId, date);

    if (result == null)
        return NotFound();

    return Ok(result);
}

        [HttpGet("nearby")]
        [AllowAnonymous]
        public async Task<IActionResult> GetNearbyTurfs(
    [FromQuery] double lat,
    [FromQuery] double lng,
    [FromQuery] double radius = 5)
        {
            var turfs = await _turfService.GetNearbyTurfsAsync(
                lat,
                lng,
                radius);

            return Ok(turfs);
        }
    }
}