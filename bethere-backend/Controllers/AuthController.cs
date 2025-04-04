using BethereBackend.Models;

namespace BethereBackend.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using PartyApp.Models;
using PartyApp.Services;

    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        
        public async System.Threading.Tasks.Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var result = await _authService.RegisterAsync(model);
            
            if (result.Success)
                return Ok(new { message = "Registration successful", token = result.Token });
            
            return BadRequest(new { message = result.Message });
        }

        [HttpPost("login")]
        public async System.Threading.Tasks.Task<IActionResult> Login([FromBody] LoginModel model)
        {
            var result = await _authService.LoginAsync(model);
            
            if (result.Success)
                return Ok(new { message = "Login successful", token = result.Token });
            
            return Unauthorized(new { message = result.Message });
        }

        [Authorize]
        [HttpPost("logout")]
        public async System.Threading.Tasks.Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync(User.Identity.Name);
            return Ok(new { message = "Logout successful" });
        }
    }
