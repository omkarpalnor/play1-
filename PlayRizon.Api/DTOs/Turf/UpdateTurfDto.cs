using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.DTOs.Turf
{
    public class UpdateTurfDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Sport { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public decimal PricePerHour { get; set; }
        public string OpenTime { get; set; } = "06:00 AM";

public string CloseTime { get; set; } = "11:00 PM";

        public string? ImageUrl { get; set; }

        public bool IsAvailable { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }
    }
}