using PartyApp.Models;

namespace BethereBackend.Models;

using System;
using System.Collections.Generic;

public class PartyModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int LocationId { get; set; }
    public string LocationName { get; set; }
    public string Address { get; set; }
    public string HostId { get; set; }
    public string HostName { get; set; }
    public int GenreId { get; set; }
    public string GenreName { get; set; }
    public int MaxAttendees { get; set; }
    public int CurrentAttendees { get; set; }
    public bool IsPublic { get; set; }
    public string Status { get; set; } 
    
    public List<AttendeeModel> Attendees { get; set; }
}