using PlayRizon.Api.DTOs.Owner;

namespace PlayRizon.Api.Interfaces
{
    public interface IOwnerService
    {
        Task<string> ApplyAsync(Guid userId, CreateOwnerDto dto);

        Task<OwnerDashboardDto> GetDashboardAsync(Guid userId);
    }
}