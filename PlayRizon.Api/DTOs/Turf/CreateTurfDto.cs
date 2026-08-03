using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.DTOs.Turf
{
    public class CreateTurfDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Sport { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public decimal PricePerHour { get; set; }

        public string? ImageUrl { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }
}