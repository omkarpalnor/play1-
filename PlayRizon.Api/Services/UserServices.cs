using Microsoft.EntityFrameworkCore;
using PlayRizon.Api.Data;
using PlayRizon.Api.DTOs;
using PlayRizon.Api.Interfaces;

namespace PlayRizon.Api.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;

        public UserService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UserProfileDto?> GetProfileAsync(Guid userId)
        {
            return await _context.Users
                .Where(x => x.Id == userId)
                .Select(x => new UserProfileDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Email = x.Email,
                    Phone = x.Phone,
                    Role = x.Role,
                    EmailVerified = x.EmailVerified,
                    CreatedAt = x.CreatedAt
                })
                .FirstOrDefaultAsync();
        }
    }
}