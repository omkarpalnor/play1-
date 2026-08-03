namespace PlayRizon.Api.Models
{
    public class Tournament
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Sport { get; set; } = string.Empty;

        public string Venue { get; set; } = string.Empty;

        public DateTime StartDate { get; set; }

        public decimal EntryFee { get; set; }

        public int MaxTeams { get; set; }

        public int RegisteredTeams { get; set; }

        public Guid OwnerId { get; set; }

        public Owner? Owner { get; set; }   // <-- Make sure this is Owner, not User
    }
}