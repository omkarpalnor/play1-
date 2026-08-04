namespace PlayRizon.Api.DTOs.Admin
{
    public class TransactionResponseDto
    {
        public Guid Id { get; set; }

        public string UserName { get; set; } = "";

        public string TurfName { get; set; } = "";

        public decimal Amount { get; set; }

        public string Status { get; set; } = "";

        public DateTime BookingDate { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}