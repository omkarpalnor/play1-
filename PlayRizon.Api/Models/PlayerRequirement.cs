using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.Models{
    public class PlayerRequirement
    {
        [Key]
        public Guid Id { get; set; }

        public Guid CaptainId { get; set; }

        public Guid TurfId { get; set; }

        [Required]
        public string TeamName { get; set; } = string.Empty;

        [Required]
        public string Sport { get; set; } = string.Empty;

        public int CurrentMembersCount { get; set; }

        public int PlayersNeeded { get; set; }

        public DateOnly MatchDate { get; set; }

        public string TimeSlot { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}