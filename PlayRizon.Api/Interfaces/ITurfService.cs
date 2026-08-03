using PlayRizon.Api.DTOs.Turf;

namespace PlayRizon.Api.Interfaces
{
    public interface ITurfService
    {
        Task<TurfResponseDto> AddTurfAsync(CreateTurfDto dto, Guid ownerId);

        Task<List<TurfResponseDto>> GetMyTurfsAsync(Guid ownerId);

        Task<TurfResponseDto?> GetByIdAsync(Guid id);

        Task<bool> UpdateAsync(Guid id, UpdateTurfDto dto, Guid ownerId);

        Task<bool> DeleteAsync(Guid id, Guid ownerId);
        Task<List<TurfResponseDto>> GetAllAsync();

        Task<List<TurfResponseDto>> GetNearbyTurfsAsync(
    double latitude,
    double longitude,
    double radiusKm);
    }
}