import { useEffect, useState } from "react";
import axiosInstance from "../../hooks/useAxiosInstance";
import toast from "react-hot-toast";

const MyTournament = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data } = await axiosInstance.get(
        "/api/user/tournaments/my/registrations"
      );

      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-8">
        My Tournament Registrations
      </h1>

      {registrations.length === 0 ? (
        <div className="bg-base-100 rounded-xl shadow p-8 text-center">
          You haven't registered for any tournament yet.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">

          {registrations.map((registration) => (

            <div
              key={registration.id}
              className="bg-base-100 rounded-xl shadow p-6"
            >

              <h2 className="text-xl font-bold">
                {registration.tournament?.name}
              </h2>

              <p className="mt-2">
                <strong>Sport:</strong>{" "}
                {registration.tournament?.sport}
              </p>

              <p>
                <strong>Venue:</strong>{" "}
                {registration.tournament?.venue}
              </p>

              <p>
                <strong>Team:</strong>{" "}
                {registration.teamName}
              </p>

              <p>
                <strong>Captain:</strong>{" "}
                {registration.captainName}
              </p>

              <p className="mt-3">
                <span className="badge badge-warning">
                  {registration.status}
                </span>
              </p>

            </div>

          ))}

        </div>
      )}

    </div>
  );
};

export default MyTournament;