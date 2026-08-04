using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.Models
{
    public class Tournament
    {
        [Key]
        public Guid Id { get; set; }

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

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public DateTime RegistrationDeadline { get; set; }

        public decimal EntryFee { get; set; }

        public int MaxTeams { get; set; }

        public int RegisteredTeams { get; set; } = 0;

        public string Status { get; set; } = "Open";

        public string? Banner { get; set; }

        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Owner
        public Guid OwnerId { get; set; }
        public Owner? Owner { get; set; }

        // Registrations
        public ICollection<TournamentRegistration>? Registrations { get; set; }
    }
}