using Microsoft.EntityFrameworkCore;
using PlayRizon.Api.Data;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Repositories
{
    public class TurfRepository : ITurfRepository
    {
        private readonly ApplicationDbContext _context;

        public TurfRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Turf> AddAsync(Turf turf)
        {
            _context.Turfs.Add(turf);
            await _context.SaveChangesAsync();
            return turf;
        }

        public async Task<List<Turf>> GetAllAsync()
        {
            return await _context.Turfs
                .Include(t => t.Owner)
                .ToListAsync();
        }

        public async Task<List<Turf>> GetByOwnerAsync(Guid ownerId)
        {
            return await _context.Turfs
                .Where(t => t.OwnerId == ownerId)
                .ToListAsync();
        }


        public async Task<Turf?> GetByIdAsync(Guid id)
        {
            return await _context.Turfs
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task UpdateAsync(Turf turf)
        {
            _context.Turfs.Update(turf);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Turf turf)
        {
            _context.Turfs.Remove(turf);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Turf>> GetNearbyTurfsAsync(
    double latitude,
    double longitude,
    double radiusKm)
        {
            var turfs = await _context.Turfs
                .Where(t => t.IsAvailable)
                .ToListAsync();

            return turfs.Where(t =>
            {
                var distance = CalculateDistance(
                    latitude,
                    longitude,
                    t.Latitude,
                    t.Longitude);

                return distance <= radiusKm;
            }).ToList();
        }

        private static double CalculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2)
        {
            const double R = 6371;

            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);

            var a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(lat1)) *
                Math.Cos(DegreesToRadians(lat2)) *
                Math.Sin(dLon / 2) *
                Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private static double DegreesToRadians(double degree)
        {
            return degree * Math.PI / 180;
        }
    }
}