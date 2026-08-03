using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.Models
{
    public class Turf
    {
        public Guid Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Sport { get; set; } = string.Empty;

        [Required]
        [MaxLength(250)]
        public string Address { get; set; } = string.Empty;

        public decimal PricePerHour { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsAvailable { get; set; } = true;

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public Guid OwnerId { get; set; }

        public Owner? Owner { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<Booking>? Bookings { get; set; }
    }
}