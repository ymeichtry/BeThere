namespace BethereBackend.Models;

using System;

public class NotificationModel
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Type { get; set; } // Invite, PartyUpdate, etc.
    public int? RelatedEntityId { get; set; } // PartyId, etc.
}