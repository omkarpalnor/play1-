using PlayRizon.Api.DTOs.Tournament;

namespace PlayRizon.Api.Interfaces
{
    public interface ITournamentService
    {
        Task<List<TournamentResponseDto>> GetAllAsync();

        Task<List<TournamentResponseDto>> GetOwnerTournamentsAsync(Guid userId);

        Task<TournamentResponseDto?> GetByIdAsync(Guid id);

        Task<TournamentResponseDto> CreateAsync(CreateTournamentDto dto, Guid userId);

        Task<bool> UpdateAsync(Guid id, UpdateTournamentDto dto, Guid userId);

        Task<bool> DeleteAsync(Guid id, Guid userId);
    }
}