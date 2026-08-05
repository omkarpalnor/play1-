using System.ComponentModel.DataAnnotations;

namespace PlayRizon.Api.DTOs.Owner
{
    public class CreateOwnerDto
    {
        [Required]
        public string BusinessName { get; set; } = string.Empty;

        [Required]
        public string OwnerName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        
        public string? Phone { get; set; } = string.Empty;

        [Required]
        public string Address { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string State { get; set; } = string.Empty;

        [Required]
        public string Pincode { get; set; } = string.Empty;

        public string? AadhaarNumber { get; set; }

        public string? PanNumber { get; set; }

        public string? GstNumber { get; set; }
    }
}