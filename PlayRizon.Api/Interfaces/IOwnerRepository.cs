using PlayRizon.Api.Models;

namespace PlayRizon.Api.Interfaces
{
    public interface IOwnerRepository
    {
        Task<Owner?> GetByUserIdAsync(Guid userId);

        Task<Owner?> GetByIdAsync(Guid id);

        Task<List<Owner>> GetAllAsync();

        Task<List<Owner>> GetPendingAsync();

        Task AddAsync(Owner owner);

        Task SaveChangesAsync();
        Task<Owner?> GetOwnerByUserIdAsync(Guid userId);
    }
}