using System;
using System.ComponentModel.DataAnnotations;

namespace PlayRizon.DTOs.PlayerRequirement
{
    public class UpdatePlayerRequirementDto
    {
        [Required]
        public Guid TurfId { get; set; }

        [Required]
        public string TeamName { get; set; } = string.Empty;

        [Required]
        public string Sport { get; set; } = string.Empty;

        [Required]
        public int CurrentMembersCount { get; set; }

        [Required]
        public int PlayersNeeded { get; set; }

        [Required]
        public DateOnly MatchDate { get; set; }

        [Required]
        public string TimeSlot { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;
    }
}