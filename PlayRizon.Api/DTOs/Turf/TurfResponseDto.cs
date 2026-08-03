namespace PlayRizon.Api.DTOs.Turf
{
    public class TurfResponseDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Sport { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

        public decimal PricePerHour { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsAvailable { get; set; }

        public double Latitude { get; set; }

        public double Longitude { get; set; }

        public Guid OwnerId { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}