using Google.Apis.Auth;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Services
{
    public class GoogleAuthService
    {
        private readonly IConfiguration _configuration;

        public GoogleAuthService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<GoogleUserInfo?> VerifyToken(string credential)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[]
                {
                    _configuration["Google:ClientId"]
                }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(
                credential,
                settings
            );

            if (payload == null)
                return null;

            return new GoogleUserInfo
            {
                GoogleId = payload.Subject,
                Email = payload.Email,
                Name = payload.Name,
                Picture = payload.Picture
            };
        }
    }
}