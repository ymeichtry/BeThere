using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Collections.Generic;
using BethereBackend.Models;
using PartyApp.Models;
    
namespace PartyApp.Controllers
{
    [Route("api/parties")]
    [ApiController]
    public class PartiesController : ControllerBase
    {
        private readonly IPartyService _partyService;

        public PartiesController(IPartyService partyService)
        {
            _partyService = partyService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PartyModel>>> GetAllPublicParties()
        {
            var parties = await _partyService.GetAllPublicPartiesAsync();
            return Ok(parties);
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<PartyModel>>> SearchParties([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
                return BadRequest(new { message = "Search query cannot be empty" });

            var parties = await _partyService.SearchPartiesAsync(query);
            return Ok(parties);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PartyModel>> GetParty(int id)
        {
            var party = await _partyService.GetPartyByIdAsync(id);
            
            if (party == null)
                return NotFound(new { message = $"Party with ID {id} not found" });
            
            return Ok(party);
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<PartyModel>> CreateParty([FromBody] CreatePartyModel model)
        {
            var userId = User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var party = await _partyService.CreatePartyAsync(model, userId);
            return CreatedAtAction(nameof(GetParty), new { id = party.Id }, party);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateParty(int id, [FromBody] UpdatePartyModel model)
        {
            var userId = User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var result = await _partyService.UpdatePartyAsync(id, model, userId);
            
            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                    return NotFound(new { message = result.Message });
                
                if (result.Message.Contains("not authorized"))
                    return Forbid();
                
                return BadRequest(new { message = result.Message });
            }
            
            return Ok(new { message = "Party updated successfully" });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteParty(int id)
        {
            var userId = User.FindFirst("sub")?.Value;
            
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var result = await _partyService.DeletePartyAsync(id, userId);
            
            if (!result.Success)
            {
                if (result.Message.Contains("not found"))
                    return NotFound(new { message = result.Message });
                
                if (result.Message.Contains("not authorized"))
                    return Forbid();
                
                return BadRequest(new { message = result.Message });
            }
            
            return Ok(new { message = "Party deleted successfully" });
        }
    }
}