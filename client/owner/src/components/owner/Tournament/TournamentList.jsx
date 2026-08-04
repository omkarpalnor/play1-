import { Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import axiosInstance from "@hooks/useAxiosInstance";

import TournamentCard from "./TournamentCard";
import DeleteTournamentModal from "./DeleteTournamentModal";

const TournamentList = () => {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [openDelete, setOpenDelete] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get(
        "/api/owner/tournaments"
      );

     if (data.success) {
  setTournaments(data.data || []);
}
    } catch (err) {
      console.error(err);
      toast.error("Unable to fetch tournaments");
    } finally {
      setLoading(false);
    }
  };

const filteredTournaments = useMemo(() => {
  return (tournaments || []).filter((item) => {
      const matchesSearch =
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        item.venue
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesSport =
        sportFilter === "All" ||
        item.sport === sportFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesSport &&
        matchesStatus
      );
    });
  }, [
    tournaments,
    search,
    sportFilter,
    statusFilter,
  ]);

  const handleEdit = (id) => {
    navigate(`/owner/edit-tournament/${id}`);
  };

  const handleDelete = (tournament) => {
    setSelectedTournament(tournament);
    setOpenDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(
        `/api/owner/tournaments/${selectedTournament.id}`
      );

      toast.success("Tournament Deleted");

      setOpenDelete(false);
      setSelectedTournament(null);

      fetchTournaments();
    } catch (err) {
      toast.error("Delete Failed");
    }
  };

  return (
    <div className="p-8">

      <div className="flex flex-col lg:flex-row justify-between items-center gap-5 mb-8">

        <div>

          <h1 className="text-3xl font-bold">
            Tournament Management
          </h1>

          <p className="text-gray-500">
            Create, Edit & Manage Tournaments
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/owner/create-tournament")
          }
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-5 py-3 flex items-center gap-2"
        >
          <Plus size={18} />
          Create Tournament
        </button>

      </div>

      <div className="bg-white border rounded-xl p-5 mb-8">

        <div className="grid lg:grid-cols-4 gap-4">

          <div className="relative lg:col-span-2">

            <Search
              size={18}
              className="absolute left-3 top-4 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search Tournament..."
              className="w-full border rounded-lg py-3 pl-10 pr-4"
            />

          </div>

          <select
            value={sportFilter}
            onChange={(e) =>
              setSportFilter(e.target.value)
            }
            className="border rounded-lg px-4"
          >
            <option>All</option>
            <option>Football</option>
            <option>Cricket</option>
            <option>Badminton</option>
            <option>Basketball</option>
            <option>Kabaddi</option>
            <option>Volleyball</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border rounded-lg px-4"
          >
            <option>All</option>
            <option>Open</option>
            <option>Closed</option>
            <option>Completed</option>
          </select>

        </div>

      </div>
            {loading ? (
        <div className="bg-white rounded-xl border p-10 text-center">
          <h2 className="text-lg font-semibold">
            Loading tournaments...
          </h2>
        </div>
      ) : filteredTournaments.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center">
          <h2 className="text-xl font-semibold">
            No Tournaments Found
          </h2>

          <p className="text-gray-500 mt-2">
            Create your first tournament to get started.
          </p>

          <button
            onClick={() => navigate("/owner/create-tournament")}
            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg"
          >
            Create Tournament
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTournaments.map((item) => (
            <TournamentCard
              key={item.id}
              tournament={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <DeleteTournamentModal
        isOpen={openDelete}
        tournamentName={selectedTournament?.name}
        onClose={() => {
          setOpenDelete(false);
          setSelectedTournament(null);
        }}
        onDelete={confirmDelete}
      />
    </div>
  );
};

export default TournamentList;