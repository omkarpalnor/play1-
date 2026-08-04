using Microsoft.EntityFrameworkCore;
using PlayRizon.Api.Models;

namespace PlayRizon.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Tables
        public DbSet<User> Users { get; set; }
        public DbSet<Turf> Turfs { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<Matchmaking> Matchmakings { get; set; }
        public DbSet<Owner> Owners { get; set; }
        public DbSet<TournamentRegistration> TournamentRegistrations { get; set; }
        

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

           modelBuilder.Entity<TournamentRegistration>()
    .HasOne(r => r.Tournament)
    .WithMany(t => t.Registrations)
    .HasForeignKey(r => r.TournamentId)
    .OnDelete(DeleteBehavior.Cascade);
    
            modelBuilder.Entity<TournamentRegistration>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
modelBuilder.Entity<User>()
    .HasIndex(u => u.Email)
    .IsUnique();
            // Decimal precision
            modelBuilder.Entity<Booking>()
                .Property(b => b.Amount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Turf>()
                .Property(t => t.PricePerHour)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Tournament>()
                .Property(t => t.EntryFee)
                .HasPrecision(18, 2);

            // Booking -> User
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Booking -> Turf
            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Turf)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TurfId)
                .OnDelete(DeleteBehavior.Cascade);

            // Turf -> Owner
            modelBuilder.Entity<Turf>()
    .HasOne(t => t.Owner)
    .WithMany(o => o.Turfs)
    .HasForeignKey(t => t.OwnerId)
    .OnDelete(DeleteBehavior.Restrict);

            // Tournament -> Owner
            modelBuilder.Entity<Tournament>()
                .HasOne(t => t.Owner)
                .WithMany(u => u.Tournaments)
                .HasForeignKey(t => t.OwnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Matchmaking -> User
            modelBuilder.Entity<Matchmaking>()
                .HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Owner -> User (One-to-One)
            modelBuilder.Entity<Owner>()
                .HasOne(o => o.User)
                .WithOne(u => u.Owner)
                .HasForeignKey<Owner>(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}