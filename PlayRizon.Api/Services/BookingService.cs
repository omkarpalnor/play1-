using PlayRizon.Api.DTOs.Booking;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;
using PlayRizon.Api.DTOs.Admin;

namespace PlayRizon.Api.Services
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly ITurfRepository _turfRepository;

        public BookingService(
            IBookingRepository bookingRepository,
            ITurfRepository turfRepository)
        {
            _bookingRepository = bookingRepository;
            _turfRepository = turfRepository;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(CreateBookingDto dto, Guid userId)
        {
            var turf = await _turfRepository.GetByIdAsync(dto.TurfId);

            if (turf == null)
                throw new Exception("Turf not found.");

            var hasConflict = await _bookingRepository.IsSlotBookedAsync(
                dto.TurfId,
                dto.BookingDate,
                dto.StartTime,
                dto.EndTime);

            if (hasConflict)
                throw new Exception("This time slot is already booked.");

            var hours = (decimal)(dto.EndTime - dto.StartTime).TotalHours;

            var booking = new Booking
            {
                UserId = userId,
                TurfId = dto.TurfId,
                BookingDate = dto.BookingDate,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Amount = hours * turf.PricePerHour,
                Status = "Booked"
            };

            await _bookingRepository.AddAsync(booking);
            await _bookingRepository.SaveChangesAsync();

            return new BookingResponseDto
            {
                Id = booking.Id,
                TurfId = booking.TurfId,
                TurfName = turf.Name,
                BookingDate = booking.BookingDate,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                Amount = booking.Amount,
                Status = booking.Status
            };
        }

        public async Task<List<BookingResponseDto>> GetMyBookingsAsync(Guid userId)
        {
            var bookings = await _bookingRepository.GetByUserAsync(userId);

            return bookings.Select(b => new BookingResponseDto
            {
                Id = b.Id,
                TurfId = b.TurfId,
                TurfName = b.Turf?.Name ?? "",
                BookingDate = b.BookingDate,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Amount = b.Amount,
                Status = b.Status
            }).ToList();
        }

        public async Task<List<BookingResponseDto>> GetOwnerBookingsAsync(Guid ownerId)
        {
            var bookings = await _bookingRepository.GetByOwnerAsync(ownerId);

            return bookings.Select(b => new BookingResponseDto
            {
                Id = b.Id,
                TurfId = b.TurfId,
                TurfName = b.Turf?.Name ?? "",
                BookingDate = b.BookingDate,
                StartTime = b.StartTime,
                EndTime = b.EndTime,
                Amount = b.Amount,
                Status = b.Status
            }).ToList();
        }
        public async Task<bool> CancelBookingAsync(Guid bookingId, Guid userId)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);

            if (booking == null)
                return false;

            if (booking.UserId != userId)
                return false;

            booking.Status = "Cancelled";

            await _bookingRepository.SaveChangesAsync();

            return true;
        }
        public async Task<List<TransactionResponseDto>> GetAllTransactionsAsync()
{
    var bookings = await _bookingRepository.GetAllAsync();

    return bookings
        .OrderByDescending(b => b.CreatedAt)
        .Select(b => new TransactionResponseDto
        {
            Id = b.Id,
        UserName = b.User?.Name ?? "",
            TurfName = b.Turf?.Name ?? "",
            Amount = b.Amount,
            Status = b.Status,
            BookingDate = b.BookingDate,
            CreatedAt = b.CreatedAt
        })
        .ToList();
}
    }
}