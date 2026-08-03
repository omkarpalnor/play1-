using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.DTOs.Booking
{
    public class CreateBookingDto
    {
        [Required]
        public Guid TurfId { get; set; }

        [Required]
        public DateTime BookingDate { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }
    }
}