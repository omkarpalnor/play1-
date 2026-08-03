namespace PlayRizon.Api.DTOs.Admin
{
    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }

        public int TotalOwners { get; set; }

        public int TotalTurfs { get; set; }

        public int TotalBookings { get; set; }

        public int PendingRequests { get; set; }

        public int RejectedRequests { get; set; }

        public List<BookingHistoryDto> BookingHistory { get; set; } = new();

        public int ActiveLoyaltyUsers { get; set; }

        public int TotalLoyaltyPoints { get; set; }

        public int TotalLifetimeLoyaltyPoints { get; set; }

        public List<TopLoyalUserDto> TopLoyalUsers { get; set; } = new();
    }

    public class BookingHistoryDto
    {
        public string Date { get; set; } = string.Empty;

        public decimal Amount { get; set; }
    }

    public class TopLoyalUserDto
    {
        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public int LoyaltyPoints { get; set; }

        public string LoyaltyTier { get; set; } = "Bronze";
    }
}