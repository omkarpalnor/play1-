using Microsoft.EntityFrameworkCore;
using PlayRizon.Api.Data;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Repositories
{
    public class TournamentRegistrationRepository : ITournamentRegistrationRepository
    {
        private readonly ApplicationDbContext _context;

        public TournamentRegistrationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(TournamentRegistration registration)
        {
            await _context.TournamentRegistrations.AddAsync(registration);
        }

        public async Task<List<TournamentRegistration>> GetByTournamentIdAsync(Guid tournamentId)
{
    return await _context.TournamentRegistrations
        .Include(r => r.User)
        .Include(r => r.Tournament)
        // .Include(r => r.Players)
        .Where(r => r.TournamentId == tournamentId)
        .ToListAsync();
}

        public async Task<TournamentRegistration?> GetByIdAsync(Guid id)
        {
            return await _context.TournamentRegistrations
                .Include(r => r.User)
                .Include(r => r.Tournament)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<TournamentRegistration?> GetByUserAndTournamentAsync(Guid userId, Guid tournamentId)
        {
            return await _context.TournamentRegistrations
                .FirstOrDefaultAsync(r =>
                    r.UserId == userId &&
                    r.TournamentId == tournamentId);
        }

        public async Task UpdateAsync(TournamentRegistration registration)
        {
            _context.TournamentRegistrations.Update(registration);
            await Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}