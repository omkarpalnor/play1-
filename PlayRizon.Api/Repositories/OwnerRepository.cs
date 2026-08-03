using Microsoft.EntityFrameworkCore;
using PlayRizon.Api.Data;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Repositories
{
    public class OwnerRepository : IOwnerRepository
    {
        private readonly ApplicationDbContext _context;

        public OwnerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Owner?> GetByUserIdAsync(Guid userId)
        {
            return await _context.Owners
                .FirstOrDefaultAsync(o => o.UserId == userId);
        }

        public async Task AddAsync(Owner owner)
        {
            await _context.Owners.AddAsync(owner);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        public async Task<Owner?> GetByIdAsync(Guid id)
        {
            return await _context.Owners
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == id);
        }

        public async Task<List<Owner>> GetAllAsync()
        {
            return await _context.Owners
                .Include(o => o.User)
                .ToListAsync();
        }

        public async Task<List<Owner>> GetPendingAsync()
        {
            return await _context.Owners
                .Include(o => o.User)
                .Where(o => o.Status == "Pending")
                .ToListAsync();
        }

        public async Task<Owner?> GetOwnerByUserIdAsync(Guid userId)
        {
            return await _context.Owners
                .FirstOrDefaultAsync(o => o.UserId == userId);
        }
    }
}