using System;

namespace PlayRizon.DTOs.PlayerRequirement
{
    public class PlayerRequirementDto
    {
        public Guid Id { get; set; }

        public Guid CaptainId { get; set; }

        public Guid TurfId { get; set; }

        public string TeamName { get; set; } = string.Empty;

        public string Sport { get; set; } = string.Empty;

        public int CurrentMembersCount { get; set; }

        public int PlayersNeeded { get; set; }

        public DateOnly MatchDate { get; set; }

        public string TimeSlot { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}