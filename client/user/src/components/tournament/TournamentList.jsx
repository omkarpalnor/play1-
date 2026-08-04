import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../hooks/useAxiosInstance";
import toast from "react-hot-toast";
import TournamentCard from "./TournamentCard";

const TournamentList = () => {
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);

  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");

  useEffect(() => {
    fetchTournaments();
  }, []);

 const fetchTournaments = async () => {
  try {
    const { data } = await axiosInstance.get("/api/user/tournaments");

    if (data.success) {
      setTournaments(data.data);
    }
  } catch (error) {
    console.error(error);
    toast.error("Unable to fetch tournaments");
  } finally {
    setLoading(false);
  }
};

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((item) => {
      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.venue
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesSport =
        sport === "All" ||
        item.sport === sport;

      return matchesSearch && matchesSport;
    });
  }, [tournaments, search, sport]);

  return (
    <div className="max-w-7xl mx-auto p-6">

      <div className="mb-8">

        <h1 className="text-3xl font-bold">
          Available Tournaments
        </h1>

        <p className="text-gray-500">
          Register your team and compete.
        </p>

      </div>

      <div className="bg-white rounded-xl shadow border p-5 mb-8">

        <div className="grid lg:grid-cols-4 gap-4">

          <input
            type="text"
            placeholder="Search Tournament..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border rounded-lg px-4 py-3 lg:col-span-3"
          />

          <select
            value={sport}
            onChange={(e) =>
              setSport(e.target.value)
            }
            className="border rounded-lg px-4"
          >
            <option>All</option>
            <option>Football</option>
            <option>Cricket</option>
            <option>Badminton</option>
            <option>Basketball</option>
            <option>Volleyball</option>
            <option>Kabaddi</option>
          </select>

        </div>

      </div>

      {loading ? (

        <div className="text-center py-20">
          Loading tournaments...
        </div>

      ) : filteredTournaments.length === 0 ? (

        <div className="text-center py-20">

          <h2 className="text-2xl font-semibold">
            No tournaments available
          </h2>

        </div>

      ) : (

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredTournaments.map((tournament) => (

            <TournamentCard
             key={tournament.id}
              tournament={tournament}
            />

          ))}

        </div>

      )}

    </div>
  );
};

export default TournamentList;