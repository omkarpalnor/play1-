using Microsoft.AspNetCore.Mvc;
using PlayRizon.Api.DTOs.Auth;
using PlayRizon.Api.Interfaces;

namespace PlayRizon.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);

        if (!result)
            return BadRequest(new
            {
                success = false,
                message = "Email already exists."
            });

        return Ok(new
        {
            success = true,
            message = "Registration successful."
        });
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);

        if (result == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Invalid email or password."
            });
        }

        return Ok(new
        {
            success = true,
            token = result.Token,
            role = result.Role,
            message = result.Message
        });

    }
    [HttpPost("google-login")]
public async Task<IActionResult> GoogleLogin(GoogleLoginDto dto)
{
    var result = await _authService.GoogleLoginAsync(dto);

    if (result == null)
    {
        return Unauthorized(new
        {
            success = false,
            message = "Google authentication failed."
        });
    }

    return Ok(new
    {
        success = true,
        token = result.Token,
        role = result.Role,
        message = result.Message
    });
}
}