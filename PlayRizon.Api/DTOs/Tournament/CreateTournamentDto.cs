using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.DTOs.Tournament
{
    public class CreateTournamentDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Sport { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty;

        [Required]
        public string Venue { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public DateTime RegistrationDeadline { get; set; }

        [Required]
        public decimal EntryFee { get; set; }

        [Required]
        public int MaxTeams { get; set; }

        public string Status { get; set; } = "Open";

        public IFormFile? Banner { get; set; }

        public string? Description { get; set; }
    }
}