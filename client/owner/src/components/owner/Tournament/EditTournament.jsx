import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import axiosInstance from "@hooks/useAxiosInstance";
import TournamentForm from "./TournamentForm";

const EditTournament = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    type: "",
    venue: "",
    address: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    entryFee: "",
    maxTeams: "",
    status: "Open",
    banner: null,
  });

  useEffect(() => {
    fetchTournament();
  }, []);

  const fetchTournament = async () => {
    try {
      const response = await axiosInstance.get(
        `/api/owner/tournaments/${id}`
      );

      if (response.data.success) {
        const tournament = response.data.tournament;

        setFormData({
          name: tournament.name || "",
          sport: tournament.sport || "",
          type: tournament.type || "",
          venue: tournament.venue || "",
          address: tournament.address || "",
          description: tournament.description || "",
          startDate: tournament.startDate
            ? tournament.startDate.substring(0, 10)
            : "",
          endDate: tournament.endDate
            ? tournament.endDate.substring(0, 10)
            : "",
          registrationDeadline: tournament.registrationDeadline
            ? tournament.registrationDeadline.substring(0, 10)
            : "",
          entryFee: tournament.entryFee || "",
          maxTeams: tournament.maxTeams || "",
          status: tournament.status || "Open",
          banner: null,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to load tournament");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const response = await axiosInstance.put(
        `/api/owner/tournaments/${id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Tournament Updated Successfully");
        navigate("/owner/tournaments");
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update tournament"
      );
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-lg">
        Loading Tournament...
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="flex items-center gap-4 mb-8">

        <button
          onClick={() => navigate("/owner/tournaments")}
          className="border rounded-lg p-2 hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>

        <div>
          <h1 className="text-3xl font-bold">
            Edit Tournament
          </h1>

          <p className="text-gray-500">
            Update tournament details
          </p>
        </div>

      </div>

      <form onSubmit={handleSubmit}>

        <TournamentForm
          formData={formData}
          setFormData={setFormData}
        />

        <div className="flex justify-end gap-4 mt-8">

          <button
            type="button"
            onClick={() => navigate("/owner/tournaments")}
            className="border rounded-lg px-6 py-3"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-3 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Tournament"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default EditTournament;