using PlayRizon.Api.DTOs.Admin;

namespace PlayRizon.Api.Interfaces
{
    public interface IAdminService
    {
        Task<List<OwnerResponseDto>> GetAllOwnersAsync();

        Task<List<OwnerResponseDto>> GetPendingOwnersAsync();

        Task<string> ApproveOwnerAsync(Guid ownerId);

        Task<string> RejectOwnerAsync(Guid ownerId);

        Task<AdminDashboardDto> GetDashboardAsync();
        Task<List<UserResponseDto>> GetAllUsersAsync();
    }
}