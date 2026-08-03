using PlayRizon.Api.DTOs;

namespace PlayRizon.Api.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDto?> GetProfileAsync(Guid userId);
    }
}