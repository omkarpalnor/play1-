import { CalendarDays, MapPin, Users, IndianRupee } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TournamentCard = ({ tournament }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-md border overflow-hidden hover:shadow-xl transition duration-300">

      <img
        src={
          tournament.banner
            ? tournament.banner
            : "https://placehold.co/600x300?text=Tournament"
        }
        alt={tournament.name}
        className="w-full h-52 object-cover"
      />

      <div className="p-5">

        <div className="flex justify-between items-center">

          <h2 className="text-xl font-bold">
            {tournament.name}
          </h2>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold
            ${
              tournament.status === "Open"
                ? "bg-green-100 text-green-700"
                : tournament.status === "Closed"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tournament.status}
          </span>

        </div>

        <p className="text-indigo-600 font-medium mt-2">
          {tournament.sport}
        </p>

        <div className="space-y-2 mt-5 text-gray-600">

          <div className="flex items-center gap-2">
            <CalendarDays size={18} />
            {new Date(
              tournament.startDate
            ).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={18} />
            {tournament.venue}
          </div>

          <div className="flex items-center gap-2">
            <Users size={18} />
            {tournament.registeredCount} / {tournament.maxTeams}
          </div>

          <div className="flex items-center gap-2">
            <IndianRupee size={18} />
            ₹{tournament.entryFee}
          </div>

        </div>

        <button
          onClick={() =>
         navigate(`/tournaments/${tournament._id}`)
          }
          className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3"
        >
          View Details
        </button>

      </div>

    </div>
  );
};

export default TournamentCard;