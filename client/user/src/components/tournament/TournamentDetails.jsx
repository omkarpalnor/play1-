import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../hooks/useAxiosInstance";
import toast from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  IndianRupee,
} from "lucide-react";

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [tournament, setTournament] = useState(null);

  useEffect(() => {
    fetchTournament();
  }, []);

  const fetchTournament = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/user/tournaments/${id}`
      );

      if (data.success) {
        setTournament(data.tournament);
      }
    } catch (error) {
      toast.error("Unable to fetch tournament");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );

  if (!tournament)
    return (
      <div className="p-10 text-center">
        Tournament not found.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">

      <img
        src={
          tournament.banner
            ? tournament.banner
            : "https://placehold.co/1200x500"
        }
        alt={tournament.name}
        className="w-full h-96 rounded-xl object-cover"
      />

      <div className="mt-8">

        <div className="flex justify-between items-center">

          <div>
            <h1 className="text-4xl font-bold">
              {tournament.name}
            </h1>

            <p className="text-indigo-600 text-lg mt-2">
              {tournament.sport}
            </p>
          </div>

          <span className="badge badge-success badge-lg">
            {tournament.status}
          </span>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div className="bg-base-100 shadow rounded-xl p-6">

            <h2 className="font-bold text-xl mb-5">
              Tournament Information
            </h2>

            <div className="space-y-4">

              <p className="flex items-center gap-3">
                <Trophy size={18} />
                {tournament.type}
              </p>

              <p className="flex items-center gap-3">
                <Calendar size={18} />
                {new Date(
                  tournament.startDate
                ).toLocaleDateString()}
              </p>

              <p className="flex items-center gap-3">
                <MapPin size={18} />
                {tournament.venue}
              </p>

              <p className="flex items-center gap-3">
                <Users size={18} />
                {tournament.registeredCount}/
                {tournament.maxTeams} Teams
              </p>

              <p className="flex items-center gap-3">
                <IndianRupee size={18} />
                ₹{tournament.entryFee}
              </p>

            </div>

          </div>

          <div className="bg-base-100 shadow rounded-xl p-6">

            <h2 className="font-bold text-xl mb-4">
              Description
            </h2>

            <p className="text-gray-600 whitespace-pre-wrap">
              {tournament.description}
            </p>

          </div>

        </div>

        <div className="mt-8 flex justify-end">

          <button
            onClick={() =>
              navigate(
                `/tournaments/${id}/register`
              )
            }
            className="btn btn-primary btn-lg"
          >
            Register Team
          </button>

        </div>

      </div>

    </div>
  );
};

export default TournamentDetails;