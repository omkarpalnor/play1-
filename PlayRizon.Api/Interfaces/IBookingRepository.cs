using PlayRizon.Api.Models;

namespace PlayRizon.Api.Interfaces
{
    public interface IBookingRepository
    {
        Task AddAsync(Booking booking);

        Task<List<Booking>> GetByUserAsync(Guid userId);

        Task<List<Booking>> GetByOwnerAsync(Guid ownerId);

        Task<Booking?> GetByIdAsync(Guid id);

        Task<bool> IsSlotBookedAsync(
            Guid turfId,
            DateTime bookingDate,
            TimeSpan startTime,
            TimeSpan endTime);

        Task SaveChangesAsync();

        Task<List<Booking>> GetAllAsync();
    }
}