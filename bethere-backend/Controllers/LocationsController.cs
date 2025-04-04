using PartyApp.Models;

using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using PartyApp.Models;

namespace PartyApp.Controllers
{
    [Route("api/locations")]
    [ApiController]
    public class LocationsController : ControllerBase
    {
        private readonly ILocationService _locationService;

        public LocationsController(ILocationService locationService)
        {
            _locationService = locationService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationModel>>> GetAllLocations()
        {
            var locations = await _locationService.GetAllLocationsAsync();
            return Ok(locations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LocationModel>> GetLocation(int id)
        {
            var location = await _locationService.GetLocationByIdAsync(id);
            
            if (location == null)
                return NotFound(new { message = $"Location with ID {id} not found" });
            
            return Ok(location);
        }
    }
}