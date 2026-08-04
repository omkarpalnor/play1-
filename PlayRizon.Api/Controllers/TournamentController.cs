using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.DTOs.Tournament;
using PlayRizon.Api.Interfaces;
using System.Security.Claims;

namespace PlayRizon.Api.Controllers
{
    [ApiController]
    [Route("api")]
    public class TournamentController : ControllerBase
    {
        private readonly ITournamentService _tournamentService;

        public TournamentController(ITournamentService tournamentService)
        {
            _tournamentService = tournamentService;
        }

        // ================= OWNER =================

        [Authorize(Roles = "Owner,Admin")]
        [HttpGet("owner/tournaments")]
        public async Task<IActionResult> GetOwnerTournaments()
        {
            var userId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var tournaments =
                await _tournamentService.GetOwnerTournamentsAsync(userId);

            return Ok(new
            {
                success = true,
                data = tournaments
            });
        }

        [Authorize(Roles = "Owner")]
        [HttpPost("owner/tournaments")]
public async Task<IActionResult> CreateTournament(
    [FromForm] CreateTournamentDto dto)
        {
            var userId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var tournament =
                await _tournamentService.CreateAsync(dto, userId);

            return Ok(new
            {
                success = true,
                data = tournament
            });
        }

        [Authorize(Roles = "Owner")]
        [HttpPut("owner/tournaments/{id}")]
        public async Task<IActionResult> UpdateTournament(
            Guid id,
            [FromBody] UpdateTournamentDto dto)
        {
            var userId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var updated =
                await _tournamentService.UpdateAsync(id, dto, userId);

            if (!updated)
                return NotFound();

            return Ok(new
            {
                success = true,
                message = "Tournament Updated"
            });
        }

        [Authorize(Roles = "Owner")]
        [HttpDelete("owner/tournaments/{id}")]
        public async Task<IActionResult> DeleteTournament(Guid id)
        {
            var userId = Guid.Parse(
                User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var deleted =
                await _tournamentService.DeleteAsync(id, userId);

            if (!deleted)
                return NotFound();

            return Ok(new
            {
                success = true,
                message = "Tournament Deleted"
            });
        }

        // ================= USER =================

        [AllowAnonymous]
        [HttpGet("user/tournaments")]
        public async Task<IActionResult> GetAll()
        {
            var tournaments = await _tournamentService.GetAllAsync();

            return Ok(new
            {
                success = true,
                data = tournaments
            });
        }

        [AllowAnonymous]
        [HttpGet("user/tournaments/{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var tournament =
                await _tournamentService.GetByIdAsync(id);

            if (tournament == null)
                return NotFound();

            return Ok(new
            {
                success = true,
                data = tournament
            });
        }
    }
}