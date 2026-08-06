using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.Interfaces;
using PlayRizon.DTOs.PlayerRequirement;
using System.Security.Claims;

namespace PlayRizon.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayerRequirementController : ControllerBase
    {
        private readonly IPlayerRequirementRepository _repository;

        public PlayerRequirementController(IPlayerRequirementRepository repository)
        {
            _repository = repository;
        }

        // GET: api/PlayerRequirement
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var data = await _repository.GetAllAsync();
            return Ok(data);
        }

        // GET: api/PlayerRequirement/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var data = await _repository.GetByIdAsync(id);

            if (data == null)
                return NotFound();

            return Ok(data);
        }

        // POST: api/PlayerRequirement
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(CreatePlayerRequirementDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var result = await _repository.CreateAsync(Guid.Parse(userId), dto);

            return Ok(result);
        }

        // PUT: api/PlayerRequirement/{id}
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdatePlayerRequirementDto dto)
        {
            var updated = await _repository.UpdateAsync(id, dto);

            if (!updated)
                return NotFound();

            return Ok(new { message = "Updated Successfully" });
        }

        // DELETE: api/PlayerRequirement/{id}
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _repository.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return Ok(new { message = "Deleted Successfully" });
        }
    }
}