public class UpdateTournamentDto
{
    public string Name { get; set; } = string.Empty;
    public string Sport { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Venue { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime RegistrationDeadline { get; set; }

    public decimal EntryFee { get; set; }
    public int MaxTeams { get; set; }

    public string Status { get; set; } = "Open";

    public IFormFile? Banner { get; set; }

    public string? Description { get; set; }
}