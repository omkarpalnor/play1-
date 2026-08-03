namespace PlayRizon.Api.DTOs
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string Role { get; set; } = string.Empty;

        public bool EmailVerified { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}