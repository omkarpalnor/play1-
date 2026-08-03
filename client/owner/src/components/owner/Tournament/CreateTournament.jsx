import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";

import axiosInstance from "@hooks/useAxiosInstance";
import TournamentForm from "./TournamentForm";

const CreateTournament = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const data = new FormData();

      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      const response = await axiosInstance.post(
        "/api/owner/tournaments",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        toast.success("Tournament Created Successfully");

        navigate("/owner/tournaments");
      }
    } catch (error) {
  console.error("Create Tournament Error:", error);

  if (error.response) {
    console.log("Status:", error.response.status);
    console.log("Response:", error.response.data);

    toast.error(error.response.data.message || "Server Error");
  } else {
    toast.error(error.message);
  }
}
  };

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
            Create Tournament
          </h1>

          <p className="text-gray-500">
            Fill tournament details below
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
            className="px-6 py-3 rounded-lg border"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Tournament"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default CreateTournament;