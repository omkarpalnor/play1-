namespace PlayRizon.Api.DTOs.Owner
{
    public class OwnerDashboardDto
    {
        public int TotalBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int CancelledBookings { get; set; }

        public int TotalReviews { get; set; }

        public decimal TotalRevenue { get; set; }

        public decimal LostRevenueFromCancellations { get; set; }

        public int TotalLoyaltyPointsAwarded { get; set; }

        public int LoyalUsersCount { get; set; }

        public int TotalTurfs { get; set; }

        public List<BookingsPerTurfDto> BookingsPerTurf { get; set; } = new();

        public List<RevenueOverTimeDto> RevenueOverTime { get; set; } = new();

        public List<TopLoyalCustomerDto> TopLoyalCustomers { get; set; } = new();
    }

    public class BookingsPerTurfDto
    {
        public string Name { get; set; } = "";

        public int ConfirmedBookings { get; set; }

        public int CancelledBookings { get; set; }
    }

    public class RevenueOverTimeDto
    {
        public DateTime Id { get; set; }

        public decimal Revenue { get; set; }
    }

    public class TopLoyalCustomerDto
    {
        public string Name { get; set; } = "";

        public string Email { get; set; } = "";

        public int Points { get; set; }

        public int Bookings { get; set; }
    }
}