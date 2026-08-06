using Microsoft.EntityFrameworkCore;
using PlayRizon.Api.Data;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;
using PlayRizon.DTOs.PlayerRequirement;

namespace PlayRizon.Api.Repositories
{
    public class PlayerRequirementRepository : IPlayerRequirementRepository
    {
        private readonly ApplicationDbContext _context;

        public PlayerRequirementRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PlayerRequirementDto>> GetAllAsync()
        {
            return await _context.PlayerRequirements
                .Select(x => new PlayerRequirementDto
                {
                    Id = x.Id,
                    CaptainId = x.CaptainId,
                    TurfId = x.TurfId,
                    TeamName = x.TeamName,
                    Sport = x.Sport,
                    CurrentMembersCount = x.CurrentMembersCount,
                    PlayersNeeded = x.PlayersNeeded,
                    MatchDate = x.MatchDate,
                    TimeSlot = x.TimeSlot,
                    Description = x.Description,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<PlayerRequirementDto?> GetByIdAsync(Guid id)
        {
            return await _context.PlayerRequirements
                .Where(x => x.Id == id)
                .Select(x => new PlayerRequirementDto
                {
                    Id = x.Id,
                    CaptainId = x.CaptainId,
                    TurfId = x.TurfId,
                    TeamName = x.TeamName,
                    Sport = x.Sport,
                    CurrentMembersCount = x.CurrentMembersCount,
                    PlayersNeeded = x.PlayersNeeded,
                    MatchDate = x.MatchDate,
                    TimeSlot = x.TimeSlot,
                    Description = x.Description,
                    CreatedAt = x.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<PlayerRequirementDto> CreateAsync(
            Guid captainId,
            CreatePlayerRequirementDto dto)
        {
            var requirement = new PlayerRequirement
            {
                Id = Guid.NewGuid(),
                CaptainId = captainId,
                TurfId = dto.TurfId,
                TeamName = dto.TeamName,
                Sport = dto.Sport,
                CurrentMembersCount = dto.CurrentMembersCount,
                PlayersNeeded = dto.PlayersNeeded,
                MatchDate = dto.MatchDate,
                TimeSlot = dto.TimeSlot,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.PlayerRequirements.Add(requirement);
            await _context.SaveChangesAsync();

            return new PlayerRequirementDto
            {
                Id = requirement.Id,
                CaptainId = requirement.CaptainId,
                TurfId = requirement.TurfId,
                TeamName = requirement.TeamName,
                Sport = requirement.Sport,
                CurrentMembersCount = requirement.CurrentMembersCount,
                PlayersNeeded = requirement.PlayersNeeded,
                MatchDate = requirement.MatchDate,
                TimeSlot = requirement.TimeSlot,
                Description = requirement.Description,
                CreatedAt = requirement.CreatedAt
            };
        }

        public async Task<bool> UpdateAsync(
            Guid id,
            UpdatePlayerRequirementDto dto)
        {
            var requirement = await _context.PlayerRequirements.FindAsync(id);

            if (requirement == null)
                return false;

            requirement.TurfId = dto.TurfId;
            requirement.TeamName = dto.TeamName;
            requirement.Sport = dto.Sport;
            requirement.CurrentMembersCount = dto.CurrentMembersCount;
            requirement.PlayersNeeded = dto.PlayersNeeded;
            requirement.MatchDate = dto.MatchDate;
            requirement.TimeSlot = dto.TimeSlot;
            requirement.Description = dto.Description;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var requirement = await _context.PlayerRequirements.FindAsync(id);

            if (requirement == null)
                return false;

            _context.PlayerRequirements.Remove(requirement);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}