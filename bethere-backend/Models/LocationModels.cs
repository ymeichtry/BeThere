namespace PartyApp.Models
{
    public class LocationModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string Description { get; set; }
        public int Capacity { get; set; }
        public decimal PricePerHour { get; set; }
        public string ImageUrl { get; set; }
    }
}