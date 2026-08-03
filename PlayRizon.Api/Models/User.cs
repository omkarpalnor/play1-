using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.Models
{
    public class User
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string Role { get; set; } = "user";

        public bool EmailVerified { get; set; } = false;

        public string? Phone { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public Owner? Owner { get; set; }     // <-- Add this

        public ICollection<Booking>? Bookings { get; set; }

        public ICollection<Tournament>? Tournaments { get; set; }
        public string? GoogleId { get; set; }

public string? ProfilePicture { get; set; }
    }
}