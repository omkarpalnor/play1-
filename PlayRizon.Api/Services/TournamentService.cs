using PlayRizon.Api.DTOs.Tournament;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Services
{
    public class TournamentService : ITournamentService
    {
        private readonly ITournamentRepository _tournamentRepository;
        private readonly IOwnerRepository _ownerRepository;
        private readonly IWebHostEnvironment _environment;

        public TournamentService(
            ITournamentRepository tournamentRepository,
            IOwnerRepository ownerRepository,
            IWebHostEnvironment environment)
        {
            _tournamentRepository = tournamentRepository;
            _ownerRepository = ownerRepository;
            _environment = environment;
        }

        public async Task<List<TournamentResponseDto>> GetAllAsync()
        {
            var tournaments = await _tournamentRepository.GetAllAsync();
            return tournaments.Select(Map).ToList();
        }

        public async Task<List<TournamentResponseDto>> GetOwnerTournamentsAsync(Guid userId)
        {
            var owner = await _ownerRepository.GetOwnerByUserIdAsync(userId);

            if (owner == null)
                return new List<TournamentResponseDto>();

            var tournaments = await _tournamentRepository.GetByOwnerIdAsync(owner.Id);

            return tournaments.Select(Map).ToList();
        }

        public async Task<TournamentResponseDto?> GetByIdAsync(Guid id)
        {
            var tournament = await _tournamentRepository.GetByIdAsync(id);

            if (tournament == null)
                return null;

            return Map(tournament);
        }

        public async Task<TournamentResponseDto> CreateAsync(CreateTournamentDto dto, Guid userId)
        {
            var owner = await _ownerRepository.GetOwnerByUserIdAsync(userId);

            if (owner == null)
                throw new Exception("Owner not found");

            var tournament = new Tournament
            {
                Name = dto.Name,
                Sport = dto.Sport,
                Type = dto.Type,
                Venue = dto.Venue,
                Address = dto.Address,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                RegistrationDeadline = dto.RegistrationDeadline,
                EntryFee = dto.EntryFee,
                MaxTeams = dto.MaxTeams,
                Status = dto.Status,
                Banner = await SaveBannerAsync(dto.Banner),
                Description = dto.Description,
                OwnerId = owner.Id
            };

            await _tournamentRepository.AddAsync(tournament);
            await _tournamentRepository.SaveChangesAsync();

            return Map(tournament);
        }

        public async Task<bool> UpdateAsync(Guid id, UpdateTournamentDto dto, Guid userId)
        {
            var owner = await _ownerRepository.GetOwnerByUserIdAsync(userId);

            if (owner == null)
                return false;

            var tournament = await _tournamentRepository.GetByIdAsync(id);

            if (tournament == null || tournament.OwnerId != owner.Id)
                return false;

            tournament.Name = dto.Name;
            tournament.Sport = dto.Sport;
            tournament.Type = dto.Type;
            tournament.Venue = dto.Venue;
            tournament.Address = dto.Address;
            tournament.StartDate = dto.StartDate;
            tournament.EndDate = dto.EndDate;
            tournament.RegistrationDeadline = dto.RegistrationDeadline;
            tournament.EntryFee = dto.EntryFee;
            tournament.MaxTeams = dto.MaxTeams;
            tournament.Status = dto.Status;

            if (dto.Banner != null)
            {
                tournament.Banner = await SaveBannerAsync(dto.Banner);
            }

            tournament.Description = dto.Description;

            await _tournamentRepository.UpdateAsync(tournament);
            await _tournamentRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var owner = await _ownerRepository.GetOwnerByUserIdAsync(userId);

            if (owner == null)
                return false;

            var tournament = await _tournamentRepository.GetByIdAsync(id);

            if (tournament == null || tournament.OwnerId != owner.Id)
                return false;

            await _tournamentRepository.DeleteAsync(tournament);
            await _tournamentRepository.SaveChangesAsync();

            return true;
        }

        private static TournamentResponseDto Map(Tournament tournament)
        {
            return new TournamentResponseDto
            {
                Id = tournament.Id,
                Name = tournament.Name,
                Sport = tournament.Sport,
                Type = tournament.Type,
                Venue = tournament.Venue,
                Address = tournament.Address,
                StartDate = tournament.StartDate,
                EndDate = tournament.EndDate,
                RegistrationDeadline = tournament.RegistrationDeadline,
                EntryFee = tournament.EntryFee,
                MaxTeams = tournament.MaxTeams,
                RegisteredTeams = tournament.RegisteredTeams,
                Status = tournament.Status,
                Banner = tournament.Banner,
                Description = tournament.Description,
                OwnerId = tournament.OwnerId
            };
        }

        private async Task<string?> SaveBannerAsync(IFormFile? banner)
        {
            if (banner == null || banner.Length == 0)
                return null;

            var webRoot = _environment.WebRootPath;

            if (string.IsNullOrWhiteSpace(webRoot))
            {
                webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            }

            Directory.CreateDirectory(webRoot);

            var uploadFolder = Path.Combine(webRoot, "uploads", "tournaments");
            Directory.CreateDirectory(uploadFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(banner.FileName);

            var filePath = Path.Combine(uploadFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await banner.CopyToAsync(stream);
            }

            return $"uploads/tournaments/{fileName}";
        }
    }
}