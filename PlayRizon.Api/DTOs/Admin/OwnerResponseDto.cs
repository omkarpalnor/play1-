namespace PlayRizon.Api.DTOs.Admin
{
    public class OwnerResponseDto
    {
        public Guid Id { get; set; }

        public string BusinessName { get; set; } = string.Empty;

        public string OwnerName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Phone { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;
    }
}