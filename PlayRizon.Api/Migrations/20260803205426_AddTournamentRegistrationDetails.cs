
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlayRizon.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddTournamentRegistrationDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CaptainName",
                table: "TournamentRegistrations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ContactNumber",
                table: "TournamentRegistrations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TeamName",
                table: "TournamentRegistrations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CaptainName",
                table: "TournamentRegistrations");

            migrationBuilder.DropColumn(
                name: "ContactNumber",
                table: "TournamentRegistrations");

            migrationBuilder.DropColumn(
                name: "TeamName",
                table: "TournamentRegistrations");
        }
    }
}
