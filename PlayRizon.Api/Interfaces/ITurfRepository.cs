using PlayRizon.Api.Models;
using PlayRizon.Api.DTOs.Turf;

namespace PlayRizon.Api.Interfaces
{
    public interface ITurfRepository
    {
        Task<Turf> AddAsync(Turf turf);

        Task<List<Turf>> GetAllAsync();

        Task<List<Turf>> GetByOwnerAsync(Guid ownerId);

        Task<Turf?> GetByIdAsync(Guid id);

        Task UpdateAsync(Turf turf);

        Task DeleteAsync(Turf turf);
        


        Task<List<Turf>> GetNearbyTurfsAsync(double latitude, double longitude, double radiusKm);
    }
}