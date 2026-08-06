using PlayRizon.Api.Models;
using PlayRizon.DTOs.PlayerRequirement;

namespace PlayRizon.Api.Interfaces
{
    public interface IPlayerRequirementRepository
    {
        Task<IEnumerable<PlayerRequirementDto>> GetAllAsync();

        Task<PlayerRequirementDto?> GetByIdAsync(Guid id);

        Task<PlayerRequirementDto> CreateAsync(
            Guid captainId,
            CreatePlayerRequirementDto dto
        );

        Task<bool> UpdateAsync(
            Guid id,
            UpdatePlayerRequirementDto dto
        );

        Task<bool> DeleteAsync(Guid id);
    }
}