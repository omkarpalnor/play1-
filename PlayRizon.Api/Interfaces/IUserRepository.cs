using PlayRizon.Api.Models;

namespace PlayRizon.Api.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);

        Task<User?> GetByIdAsync(Guid id);

        Task<List<User>> GetAllAsync();

        Task AddAsync(User user);

        Task SaveChangesAsync();
    }
}