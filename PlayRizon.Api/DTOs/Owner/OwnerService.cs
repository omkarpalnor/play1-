using PlayRizon.Api.DTOs.Owner;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Services
{
    public class OwnerService : IOwnerService
    {
        private readonly IOwnerRepository _ownerRepository;
        private readonly ITurfRepository _turfRepository;
        private readonly IBookingRepository _bookingRepository;

        public OwnerService(
     IOwnerRepository ownerRepository,
     ITurfRepository turfRepository,
     IBookingRepository bookingRepository)
        {
            _ownerRepository = ownerRepository;
            _turfRepository = turfRepository;
            _bookingRepository = bookingRepository;
        }

        public async Task<string> ApplyAsync(Guid userId, CreateOwnerDto dto)
        {
            var existingOwner = await _ownerRepository.GetByUserIdAsync(userId);

            if (existingOwner != null)
            {
                return "You have already applied as an owner.";
            }

            var owner = new Owner
            {
                UserId = userId,
                BusinessName = dto.BusinessName,
                OwnerName = dto.OwnerName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                City = dto.City,
                State = dto.State,
                Pincode = dto.Pincode,
                AadhaarNumber = dto.AadhaarNumber,
                PanNumber = dto.PanNumber,
                GstNumber = dto.GstNumber,
                Status = "Pending"
            };

            await _ownerRepository.AddAsync(owner);
            await _ownerRepository.SaveChangesAsync();

            return "Owner application submitted successfully.";
        }
        public async Task<OwnerDashboardDto> GetDashboardAsync(Guid userId)
        {
            var owner = await _ownerRepository.GetOwnerByUserIdAsync(userId);

            if (owner == null)
                throw new Exception("Owner not found.");

            var turfs = (await _turfRepository.GetAllAsync())
                .Where(t => t.OwnerId == owner.Id)
                .ToList();

            var bookings = await _bookingRepository.GetAllAsync();

            var ownerBookings = bookings
                .Where(b => turfs.Any(t => t.Id == b.TurfId))
                .ToList();

            var dto = new OwnerDashboardDto
            {
                TotalTurfs = turfs.Count,

                TotalBookings = ownerBookings.Count,

                ConfirmedBookings = ownerBookings.Count(b => b.Status == "Confirmed"),

                CancelledBookings = ownerBookings.Count(b => b.Status == "Cancelled"),

                TotalRevenue = ownerBookings
                    .Where(b => b.Status == "Confirmed")
                    .Sum(b => b.Amount),

                LostRevenueFromCancellations = ownerBookings
                    .Where(b => b.Status == "Cancelled")
                    .Sum(b => b.Amount),

                TotalReviews = 0,

                TotalLoyaltyPointsAwarded = 0,

                LoyalUsersCount = 0,

                BookingsPerTurf = turfs.Select(t => new BookingsPerTurfDto
                {
                    Name = t.Name,

                    ConfirmedBookings = ownerBookings.Count(b =>
                        b.TurfId == t.Id &&
                        b.Status == "Confirmed"),

                    CancelledBookings = ownerBookings.Count(b =>
                        b.TurfId == t.Id &&
                        b.Status == "Cancelled")
                }).ToList(),

                RevenueOverTime = ownerBookings
                    .Where(b => b.Status == "Confirmed")
                    .GroupBy(b => b.BookingDate.Date)
                    .Select(g => new RevenueOverTimeDto
                    {
                        Id = g.Key,
                        Revenue = g.Sum(x => x.Amount)
                    })
                    .OrderBy(x => x.Id)
                    .ToList(),

                TopLoyalCustomers = new List<TopLoyalCustomerDto>()
            };

            return dto;
        }
    }
}