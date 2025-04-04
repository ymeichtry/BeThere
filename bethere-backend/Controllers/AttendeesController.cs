namespace BethereBackend.Controllers;

// AttendeesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using PartyApp.Services;

namespace PartyApp.Controllers
{
    [Authorize]
    [Route("api/parties/{partyId}/attendees")]
    [ApiController]
    public class AttendeesController : ControllerBase
    {
        private readonly IAttendeeService _attendeeService;

        public AttendeesController(IAttendeeService attendeeService)
        {
            _attendeeService = attendeeService;
        }

        [HttpPost]
        public async Task<IActionResult> AttendParty(int partyId)
        {
            var userId = User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var result = await _attendeeService.AttendPartyAsync(partyId, userId);
            
            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                    return NotFound(new { message = result.Message });
                
                return BadRequest(new { message = result.Message });
            }
            
            return Ok(new { message = "Successfully joined the party" });
        }

        [HttpDelete]
        public async Task<IActionResult> CancelAttendance(int partyId)
        {
            var userId = User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var result = await _attendeeService.CancelAttendanceAsync(partyId, userId);
            
            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                    return NotFound(new { message = result.Message });
                
                return BadRequest(new { message = result.Message });
            }
            
            return Ok(new { message = "Successfully canceled attendance" });
        }
    }
}