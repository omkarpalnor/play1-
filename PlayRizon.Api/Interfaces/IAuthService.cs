using PlayRizon.Api.DTOs.Auth;

namespace PlayRizon.Api.Interfaces;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterDto dto);

    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
    Task<LoginResponseDto?> GoogleLoginAsync(GoogleLoginDto dto);
    
}