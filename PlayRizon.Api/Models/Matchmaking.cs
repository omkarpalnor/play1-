namespace PlayRizon.Api.Models
{
    public class Matchmaking
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }

        public User? User { get; set; }

        public string Sport { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public DateTime MatchDate { get; set; }

        public string SkillLevel { get; set; } = "Beginner";
    }
}