using PlayRizon.Api.Models;

namespace PlayRizon.Api.Interfaces
{
    public interface ITournamentRegistrationRepository
    {
        Task AddAsync(TournamentRegistration registration);

        Task<List<TournamentRegistration>> GetByTournamentIdAsync(Guid tournamentId);

        Task<TournamentRegistration?> GetByIdAsync(Guid id);

        Task<TournamentRegistration?> GetByUserAndTournamentAsync(Guid userId, Guid tournamentId);

        Task UpdateAsync(TournamentRegistration registration);

        Task SaveChangesAsync();
    }
}