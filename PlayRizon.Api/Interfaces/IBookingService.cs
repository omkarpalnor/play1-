using PlayRizon.Api.DTOs.Booking;

namespace PlayRizon.Api.Interfaces
{
    public interface IBookingService
    {
        Task<BookingResponseDto> CreateBookingAsync(CreateBookingDto dto, Guid userId);

        Task<List<BookingResponseDto>> GetMyBookingsAsync(Guid userId);

        Task<bool> CancelBookingAsync(Guid bookingId, Guid userId);

        Task<List<BookingResponseDto>> GetOwnerBookingsAsync(Guid ownerUserId);
        
    }
}