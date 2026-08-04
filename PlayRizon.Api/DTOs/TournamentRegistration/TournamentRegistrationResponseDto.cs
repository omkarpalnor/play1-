namespace PlayRizon.Api.DTOs.TournamentRegistration
{
    public class TournamentRegistrationResponseDto
    {
        public Guid Id { get; set; }

        public Guid TournamentId { get; set; }

        public string TournamentName { get; set; } = string.Empty;

        public Guid UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public string TeamName { get; set; } = string.Empty;

        public string? CaptainName { get; set; }

        public string? ContactNumber { get; set; }

        public DateTime RegisteredAt { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}