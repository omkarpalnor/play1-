using PlayRizon.Api.DTOs.Booking;
using PlayRizon.Api.DTOs.Admin;

namespace PlayRizon.Api.Interfaces
{
    public interface IBookingService
    {
        Task<BookingResponseDto> CreateBookingAsync(CreateBookingDto dto, Guid userId);

        Task<List<BookingResponseDto>> GetMyBookingsAsync(Guid userId);


        Task<bool> CancelBookingAsync(Guid bookingId, Guid userId);

        Task<List<BookingResponseDto>> GetOwnerBookingsAsync(Guid ownerUserId);
        Task<List<TransactionResponseDto>> GetAllTransactionsAsync();
        
    }
}