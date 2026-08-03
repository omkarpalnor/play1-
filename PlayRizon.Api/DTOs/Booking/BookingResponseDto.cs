namespace PlayRizon.Api.DTOs.Booking
{
    public class BookingResponseDto
    {
        public Guid Id { get; set; }

        public Guid TurfId { get; set; }

        public string TurfName { get; set; } = string.Empty;

        public DateTime BookingDate { get; set; }

        public TimeSpan StartTime { get; set; }

        public TimeSpan EndTime { get; set; }

        public decimal Amount { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}