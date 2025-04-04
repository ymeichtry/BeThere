using BethereBackend.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Collections.Generic;
using PartyApp.Models;

namespace PartyApp.Controllers
{
    [Authorize]
    [Route("api/users/me/parties")]
    [ApiController]
    public class UserPartiesController : ControllerBase
    {
        private readonly IPartyService _partyService;

        public UserPartiesController(IPartyService partyService)
        {
            _partyService = partyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PartyModel>>> GetUserParties()
        {
            var userId = User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var parties = await _partyService.GetUserPartiesAsync(userId);
            return Ok(parties);
        }

        [HttpGet("upcoming")]
        public async Task<ActionResult<IEnumerable<PartyModel>>> GetUpcomingUserParties()
        {
            var userId = User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var parties = await _partyService.GetUpcomingUserPartiesAsync(userId);
            return Ok(parties);
        }
    }
}
