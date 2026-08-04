using PlayRizon.Api.Models;

namespace PlayRizon.Api.Interfaces
{
    public interface ITournamentRepository
    {
        Task<List<Tournament>> GetAllAsync();

        Task<List<Tournament>> GetByOwnerIdAsync(Guid ownerId);

        Task<Tournament?> GetByIdAsync(Guid id);

        Task AddAsync(Tournament tournament);

        Task UpdateAsync(Tournament tournament);

        Task DeleteAsync(Tournament tournament);

        Task SaveChangesAsync();
    }
}