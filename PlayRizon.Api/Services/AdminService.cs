using PlayRizon.Api.DTOs.Admin;
using PlayRizon.Api.Interfaces;

namespace PlayRizon.Api.Services
{
    public class AdminService : IAdminService
    {
        private readonly IOwnerRepository _ownerRepository;
        private readonly IUserRepository _userRepository;
        private readonly ITurfRepository _turfRepository;
        private readonly IBookingRepository _bookingRepository;

        public AdminService(
            IOwnerRepository ownerRepository,
            IUserRepository userRepository,
            ITurfRepository turfRepository,
            IBookingRepository bookingRepository)
        {
            _ownerRepository = ownerRepository;
            _userRepository = userRepository;
            _turfRepository = turfRepository;
            _bookingRepository = bookingRepository;
        }

        public async Task<List<OwnerResponseDto>> GetAllOwnersAsync()
        {
            var owners = await _ownerRepository.GetAllAsync();

            return owners.Select(o => new OwnerResponseDto
            {
                Id = o.Id,
                BusinessName = o.BusinessName,
                OwnerName = o.OwnerName,
                Email = o.Email,
                Phone = o.Phone,
                City = o.City,
                Status = o.Status
            }).ToList();
        }

        public async Task<List<UserResponseDto>> GetAllUsersAsync()
{
    var users = await _userRepository.GetAllAsync();

    return users.Select(u => new UserResponseDto
    {
        Id = u.Id,
        Name = u.Name,
        Email = u.Email,
        Role = u.Role,
        Phone = u.Phone,
        EmailVerified = u.EmailVerified,
        CreatedAt = u.CreatedAt
    }).ToList();
}

        public async Task<List<OwnerResponseDto>> GetPendingOwnersAsync()
        {
            var owners = await _ownerRepository.GetPendingAsync();

            return owners.Select(o => new OwnerResponseDto
            {
                Id = o.Id,
                BusinessName = o.BusinessName,
                OwnerName = o.OwnerName,
                Email = o.Email,
                Phone = o.Phone,
                City = o.City,
                Status = o.Status
            }).ToList();
        }

        public async Task<string> ApproveOwnerAsync(Guid ownerId)
        {
            var owner = await _ownerRepository.GetByIdAsync(ownerId);

            if (owner == null)
                return "Owner not found.";

            owner.Status = "Approved";

            if (owner.User != null)
            {
                owner.User.Role = "Owner";
            }

            await _ownerRepository.SaveChangesAsync();

            return "Owner approved successfully.";
        }

        public async Task<string> RejectOwnerAsync(Guid ownerId)
        {
            var owner = await _ownerRepository.GetByIdAsync(ownerId);

            if (owner == null)
                return "Owner not found.";

            owner.Status = "Rejected";

            await _ownerRepository.SaveChangesAsync();

            return "Owner rejected successfully.";
        }
        public async Task<AdminDashboardDto> GetDashboardAsync()
        {
            var users = await _userRepository.GetAllAsync();
            var owners = await _ownerRepository.GetAllAsync();
            var turfs = await _turfRepository.GetAllAsync();
            var bookings = await _bookingRepository.GetAllAsync();

            return new AdminDashboardDto
            {
                TotalUsers = users.Count,
                TotalOwners = owners.Count,
                TotalTurfs = turfs.Count,
                TotalBookings = bookings.Count,

                PendingRequests = owners.Count(o => o.Status == "Pending"),
                RejectedRequests = owners.Count(o => o.Status == "Rejected"),

                BookingHistory = bookings
                    .GroupBy(b => b.BookingDate.Date)
                    .OrderBy(g => g.Key)
                    .Select(g => new BookingHistoryDto
                    {
                        Date = g.Key.ToString("dd MMM"),
                        Amount = g.Sum(x => x.Amount)
                    })
                    .ToList(),

                ActiveLoyaltyUsers = 0,
                TotalLoyaltyPoints = 0,
                TotalLifetimeLoyaltyPoints = 0,
                TopLoyalUsers = new List<TopLoyalUserDto>()
            };
        }
    }
}