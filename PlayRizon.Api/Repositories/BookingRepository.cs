using Microsoft.EntityFrameworkCore;
using PlayRizon.Api.Data;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;

        public BookingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Booking?> GetByIdAsync(Guid id)
        {
            return await _context.Bookings
                .Include(b => b.Turf)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<List<Booking>> GetByUserAsync(Guid userId)
        {
            return await _context.Bookings
                .Include(b => b.Turf)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByOwnerAsync(Guid ownerId)
        {
            return await _context.Bookings
                .Include(b => b.Turf)
                .Include(b => b.User)
                .Where(b => b.Turf!.OwnerId == ownerId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();
        }

        public async Task<bool> IsSlotBookedAsync(
            Guid turfId,
            DateTime bookingDate,
            TimeSpan startTime,
            TimeSpan endTime)
        {
            return await _context.Bookings.AnyAsync(b =>
                b.TurfId == turfId &&
                b.BookingDate.Date == bookingDate.Date &&
                b.Status != "Cancelled" &&
                startTime < b.EndTime &&
                endTime > b.StartTime);
        }
        public async Task<List<Booking>> GetAllAsync()
        {
            return await _context.Bookings
                .Include(b => b.Turf)
                .Include(b => b.User)
                .ToListAsync();
        }
    }
}