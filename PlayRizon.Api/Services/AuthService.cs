using BCrypt.Net;
using PlayRizon.Api.DTOs.Auth;
using PlayRizon.Api.Interfaces;
using PlayRizon.Api.Models;
using Google.Apis.Auth;
using System.Security.Cryptography;

namespace PlayRizon.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly GoogleAuthService _googleAuthService;

       
public AuthService(
    IUserRepository userRepository,
    JwtService jwtService,
    GoogleAuthService googleAuthService)
{
    _userRepository = userRepository;
    _jwtService = jwtService;
    _googleAuthService = googleAuthService;
}
        public async Task<bool> RegisterAsync(RegisterDto dto)
        {
            var existingUser = await _userRepository.GetByEmailAsync(dto.Email);

            if (existingUser != null)
                return false;

            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            await _userRepository.AddAsync(user);
            await _userRepository.SaveChangesAsync();

            return true;
        }

        private readonly JwtService _jwtService;

        

public async Task<LoginResponseDto?> GoogleLoginAsync(GoogleLoginDto dto)
{
    var googleUser = await _googleAuthService.VerifyToken(dto.Credential);

    if (googleUser == null)
        return null;

    var user = await _userRepository.GetByEmailAsync(googleUser.Email);

    if (user == null)
    {
        user = new User
        {
            Name = googleUser.Name,
            Email = googleUser.Email,
            GoogleId = googleUser.GoogleId,
            ProfilePicture = googleUser.Picture,
            EmailVerified = true,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()),
            Role = "user"
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();
    }
    else
    {
        user.GoogleId = googleUser.GoogleId;
        user.ProfilePicture = googleUser.Picture;

        await _userRepository.SaveChangesAsync();
    }

    return new LoginResponseDto
    {
        Token = _jwtService.GenerateToken(user),
        Role = user.Role,
        Message = "Google login successful."
    };
}
        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _userRepository.GetByEmailAsync(dto.Email);

            if (user == null)
                return null;

            bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(
                dto.Password,
                user.PasswordHash
            );

            if (!isPasswordCorrect)
                return null;

            return new LoginResponseDto
            {
                Token = _jwtService.GenerateToken(user),
                Role = user.Role,
                Message = "Login successful."
            };
        }
    }
}