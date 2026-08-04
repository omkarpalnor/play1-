using PlayRizon.Api.DTOs.TournamentRegistration;

namespace PlayRizon.Api.Interfaces
{
    public interface ITournamentRegistrationService
    {
        Task<TournamentRegistrationResponseDto> RegisterAsync(
            RegisterTournamentDto dto,
            Guid userId);

        Task<List<TournamentRegistrationResponseDto>> GetRegistrationsByTournamentAsync(
            Guid tournamentId);

        Task<bool> ApproveRegistrationAsync(Guid registrationId);

        Task<bool> RejectRegistrationAsync(Guid registrationId);
    }
}