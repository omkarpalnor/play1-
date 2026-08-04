using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.DTOs.TournamentRegistration
{
    public class RegisterTournamentDto
{
    public Guid TournamentId { get; set; }

    public string TeamName { get; set; } = string.Empty;

    public string CaptainName { get; set; } = string.Empty;

    public string ContactNumber { get; set; } = string.Empty;

    public List<PlayerDto> Players { get; set; } = new();
}
}