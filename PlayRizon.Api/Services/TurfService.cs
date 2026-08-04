using PlayRizon.Api.DTOs.Turf;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;
using PlayRizon.Api.Repositories;

namespace PlayRizon.Api.Services
{
    public class TurfService : ITurfService
    {
        private readonly ITurfRepository _turfRepository;
        private readonly IOwnerRepository _ownerRepository;


        public TurfService(
    ITurfRepository turfRepository,
    IOwnerRepository ownerRepository)
        {
            _turfRepository = turfRepository;
            _ownerRepository = ownerRepository;
        }

        public async Task<TurfResponseDto> AddTurfAsync(CreateTurfDto dto, Guid ownerId)
        {
            // Find the Owner record using the logged-in UserId
            var owner = await _ownerRepository.GetOwnerByUserIdAsync(ownerId);

            if (owner == null)
            {
                throw new Exception("Owner profile not found.");
            }

           var turf = new Turf
{
    Name = dto.Name,
    Sport = dto.Sport,
    Address = dto.Address,
    PricePerHour = dto.PricePerHour,

    OpenTime = dto.OpenTime,
    CloseTime = dto.CloseTime,

    ImageUrl = dto.ImageUrl,
    Latitude = dto.Latitude,
    Longitude = dto.Longitude,
    CreatedAt = DateTime.UtcNow,
    OwnerId = owner.Id
};

            await _turfRepository.AddAsync(turf);

            return Map(turf);
        }


        public async Task<List<TurfResponseDto>> GetMyTurfsAsync(Guid userId)
        {
            var owner = await _ownerRepository.GetOwnerByUserIdAsync(userId);

            if (owner == null)
                return new List<TurfResponseDto>();

            var turfs = await _turfRepository.GetByOwnerAsync(owner.Id);

            return turfs.Select(Map).ToList();
        }
        public async Task<List<TurfResponseDto>> GetAllAsync()
{
    var turfs = await _turfRepository.GetAllAsync();
    return turfs.Select(Map).ToList();
}

        public async Task<List<TurfResponseDto>> GetNearbyTurfsAsync(
    double latitude,
    double longitude,
    double radiusKm)
        {
            var turfs = await _turfRepository.GetNearbyTurfsAsync(
                latitude,
                longitude,
                radiusKm);

            return turfs.Select(Map).ToList();
        }

        public async Task<TurfResponseDto?> GetByIdAsync(Guid id)
        {
            var turf = await _turfRepository.GetByIdAsync(id);

            if (turf == null)
                return null;

            return Map(turf);
        }

        public async Task<bool> UpdateAsync(Guid id, UpdateTurfDto dto, Guid ownerId)
        {
            var turf = await _turfRepository.GetByIdAsync(id);

            if (turf == null || turf.OwnerId != ownerId)
                return false;

            turf.Name = dto.Name;
            turf.Sport = dto.Sport;
            turf.Address = dto.Address;
            turf.PricePerHour = dto.PricePerHour;
            turf.ImageUrl = dto.ImageUrl;
            turf.IsAvailable = dto.IsAvailable;
            turf.Latitude = dto.Latitude;
            turf.Longitude = dto.Longitude;

            await _turfRepository.UpdateAsync(turf);

            return true;
        }

        public async Task<bool> DeleteAsync(Guid id, Guid ownerId)
        {
            var turf = await _turfRepository.GetByIdAsync(id);

            if (turf == null || turf.OwnerId != ownerId)
                return false;

            await _turfRepository.DeleteAsync(turf);

            return true;
        }

       private static TurfResponseDto Map(Turf turf)
{
    return new TurfResponseDto
    {
        Id = turf.Id,
        Name = turf.Name,
        Sport = turf.Sport,
        Address = turf.Address,
        PricePerHour = turf.PricePerHour,

        OpenTime = turf.OpenTime,
        CloseTime = turf.CloseTime,

        ImageUrl = turf.ImageUrl,
        Latitude = turf.Latitude,
        Longitude = turf.Longitude,
        IsAvailable = turf.IsAvailable,
        OwnerId = turf.OwnerId,
        CreatedAt = turf.CreatedAt
    };
}

public async Task<TimeSlotResponseDto?> GetTimeSlotsAsync(Guid turfId, DateTime date)
{
    var turf = await _turfRepository.GetByIdAsync(turfId);

    if (turf == null)
        return null;

    return new TimeSlotResponseDto
    {
        TimeSlots = new TimeSlotDto
        {
            OpenTime = turf.OpenTime,
            CloseTime = turf.CloseTime,
            PricePerHour = turf.PricePerHour
        },
        BookedTime = new List<BookedTimeDto>()
    };
}
        }

    }
