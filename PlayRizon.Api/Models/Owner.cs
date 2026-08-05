using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PlayRizon.Api.Models
{
    public class Owner
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        [Required]
        [MaxLength(150)]
        public string BusinessName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string OwnerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        
        [MaxLength(15)]
        public string? Phone { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string State { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string Pincode { get; set; } = string.Empty;

        public string? AadhaarNumber { get; set; }

        public string? PanNumber { get; set; }

        public string? GstNumber { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Tournament>? Tournaments { get; set; }
      
        public ICollection<Turf> Turfs { get; set; } = new List<Turf>();
    }
}