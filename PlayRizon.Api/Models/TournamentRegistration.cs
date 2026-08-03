using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.Models
{
    public class TournamentRegistration
    {
        [Key]
        public Guid Id { get; set; }

        public Guid TournamentId { get; set; }

        public Tournament? Tournament { get; set; }

        public Guid UserId { get; set; }

        public User? User { get; set; }

        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        public string Status { get; set; } = "Registered";
    }
}