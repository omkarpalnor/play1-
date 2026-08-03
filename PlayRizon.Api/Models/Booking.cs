namespace PlayRizon.Api.Models
{
    public class Booking
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public User? User { get; set; }

        public Guid TurfId { get; set; }
        public Turf? Turf { get; set; }

        public DateTime BookingDate { get; set; }

        // Time slot
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        // Auto calculated
        public decimal Amount { get; set; }

        public string Status { get; set; } = "Confirmed";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}