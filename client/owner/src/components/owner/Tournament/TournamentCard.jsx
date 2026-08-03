import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  IndianRupee,
  Pencil,
  Trash2,
} from "lucide-react";

 const TournamentCard = ({
  tournament,
  onEdit,
  onDelete,
}) => {

  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 overflow-hidden">

      {/* Banner */}
      <div className="h-40 bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center">

        <h2 className="text-white text-2xl font-bold">
          {tournament.sport}
        </h2>

      </div>

      <div className="p-5">

        {/* Header */}

        <div className="flex justify-between items-start">

          <div>

            <h2 className="text-xl font-bold">
              {tournament.name}
            </h2>

            <p className="text-gray-500">
              {tournament.type}
            </p>

          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              tournament.status === "Open"
                ? "bg-green-100 text-green-700"
                : tournament.status === "Closed"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {tournament.status}
          </span>

        </div>

        {/* Details */}

        <div className="mt-5 space-y-3">

          <div className="flex items-center gap-3 text-gray-600">

            <CalendarDays size={18} />

            <span>{tournament.startDate}</span>

          </div>

          <div className="flex items-center gap-3 text-gray-600">

            <MapPin size={18} />

            <span>{tournament.venue}</span>

          </div>

          <div className="flex items-center gap-3 text-gray-600">

            <IndianRupee size={18} />

            <span>₹ {tournament.entryFee}</span>

          </div>

          <div className="flex items-center gap-3 text-gray-600">

            <Users size={18} />

            <span>
              {tournament.registeredTeams}/{tournament.maxTeams} Teams
            </span>

          </div>

        </div>

        {/* Buttons */}

        <div className="flex gap-3 mt-6">

          <button
           onClick={() => onEdit(tournament._id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Pencil size={18} />
            Edit
          </button>

          <button
            onClick={() => onDelete(tournament)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        <button
  onClick={() =>
    navigate(`/owner/tournaments/${tournament._id}/registrations`)
  }
  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
>
  View Registrations
</button>

        </div>

      </div>

    </div>
    
  );
};

export default TournamentCard;
