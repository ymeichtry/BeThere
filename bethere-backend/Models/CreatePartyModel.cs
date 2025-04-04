namespace BethereBackend.Models;

public class CreatePartyModel
{
    public string Name { get; set; }
    public string Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int LocationId { get; set; }
    public int GenreId { get; set; }
    public int MaxAttendees { get; set; }
    public bool IsPublic { get; set; }
}