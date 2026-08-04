using PlayRizon.Api.DTOs.TournamentRegistration;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Services
{
    public class TournamentRegistrationService : ITournamentRegistrationService
    {
        private readonly ITournamentRegistrationRepository _registrationRepository;
        private readonly ITournamentRepository _tournamentRepository;

        public TournamentRegistrationService(
            ITournamentRegistrationRepository registrationRepository,
            ITournamentRepository tournamentRepository)
        {
            _registrationRepository = registrationRepository;
            _tournamentRepository = tournamentRepository;
        }

        public async Task<TournamentRegistrationResponseDto> RegisterAsync(
            RegisterTournamentDto dto,
            Guid userId)
        {
            var tournament = await _tournamentRepository.GetByIdAsync(dto.TournamentId);

            if (tournament == null)
                throw new Exception("Tournament not found.");

            if (tournament.Status != "Open")
                throw new Exception("Tournament registration is closed.");

            var existing = await _registrationRepository
                .GetByUserAndTournamentAsync(userId, dto.TournamentId);

            if (existing != null)
                throw new Exception("Already registered.");

            if (tournament.RegisteredTeams >= tournament.MaxTeams)
                throw new Exception("Tournament is full.");

            var registration = new TournamentRegistration
{
    TournamentId = dto.TournamentId,
    UserId = userId,

    TeamName = dto.TeamName,
    CaptainName = dto.CaptainName,
    ContactNumber = dto.ContactNumber,

    RegisteredAt = DateTime.UtcNow,
    Status = "Pending"
};

            await _registrationRepository.AddAsync(registration);

            tournament.RegisteredTeams++;

            await _tournamentRepository.UpdateAsync(tournament);

            await _registrationRepository.SaveChangesAsync();

            return new TournamentRegistrationResponseDto
            {
                Id = registration.Id,
                TournamentId = registration.TournamentId,
                TournamentName = tournament.Name,
                UserId = registration.UserId,
                UserName = "",
                TeamName = dto.TeamName,
                CaptainName = dto.CaptainName,
                ContactNumber = dto.ContactNumber,
                RegisteredAt = registration.RegisteredAt,
                Status = registration.Status
            };
        }

        public async Task<List<TournamentRegistrationResponseDto>>
    GetRegistrationsByTournamentAsync(Guid tournamentId)
{
    var registrations =
        await _registrationRepository.GetByTournamentIdAsync(tournamentId);

    return registrations.Select(r => new TournamentRegistrationResponseDto
    {
        Id = r.Id,
        TournamentId = r.TournamentId,
        TournamentName = r.Tournament?.Name ?? "",
        UserId = r.UserId,
        UserName = r.User?.Name ?? "",

        TeamName = r.TeamName,
        CaptainName = r.CaptainName,
        ContactNumber = r.ContactNumber,

        RegisteredAt = r.RegisteredAt,
        Status = r.Status
    }).ToList();
}

        public async Task<bool> ApproveRegistrationAsync(Guid registrationId)
        {
            var registration =
                await _registrationRepository.GetByIdAsync(registrationId);

            if (registration == null)
                return false;

            registration.Status = "Approved";

            await _registrationRepository.UpdateAsync(registration);
            await _registrationRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectRegistrationAsync(Guid registrationId)
        {
            var registration =
                await _registrationRepository.GetByIdAsync(registrationId);

            if (registration == null)
                return false;

            registration.Status = "Rejected";

            await _registrationRepository.UpdateAsync(registration);
            await _registrationRepository.SaveChangesAsync();

            return true;
        }
    }
}