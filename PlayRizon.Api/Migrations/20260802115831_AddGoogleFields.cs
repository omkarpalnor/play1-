using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlayRizon.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            

            migrationBuilder.AddColumn<string>(
                name: "GoogleId",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfilePicture",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            
            
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
            migrationBuilder.DropColumn(
                name: "GoogleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ProfilePicture",
                table: "Users");

            

           

            
        }
    }
}
