using Microsoft.EntityFrameworkCore;
using PlayRizon.Api.Data;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Repositories
{
    public class TournamentRepository : ITournamentRepository
    {
        private readonly ApplicationDbContext _context;

        public TournamentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Tournament>> GetAllAsync()
        {
            return await _context.Tournaments
                .Include(t => t.Owner)
                .ToListAsync();
        }

        public async Task<List<Tournament>> GetByOwnerIdAsync(Guid ownerId)
        {
            return await _context.Tournaments
                .Where(t => t.OwnerId == ownerId)
                .ToListAsync();
        }

        public async Task<Tournament?> GetByIdAsync(Guid id)
        {
            return await _context.Tournaments
                .Include(t => t.Owner)
                .Include(t => t.Registrations)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task AddAsync(Tournament tournament)
        {
            await _context.Tournaments.AddAsync(tournament);
        }

        public Task UpdateAsync(Tournament tournament)
        {
            _context.Tournaments.Update(tournament);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Tournament tournament)
        {
            _context.Tournaments.Remove(tournament);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}