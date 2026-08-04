namespace PlayRizon.Api.DTOs.Turf
{
    public class TimeSlotResponseDto
    {
        public TimeSlotDto TimeSlots { get; set; } = new();

        public List<BookedTimeDto> BookedTime { get; set; } = new();
    }

    public class TimeSlotDto
    {
        public string OpenTime { get; set; } = "";
        public string CloseTime { get; set; } = "";
        public decimal PricePerHour { get; set; }
    }

    public class BookedTimeDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}