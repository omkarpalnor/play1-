import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../hooks/useAxiosInstance";
import toast from "react-hot-toast";

const TournamentRegistration = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    teamName: "",
    captainName: "",
    captainPhone: "",
    players: [
      { name: "" },
      { name: "" },
      { name: "" },
      { name: "" },
      { name: "" },
    ],
  });

  const handlePlayerChange = (index, value) => {
    const updatedPlayers = [...formData.players];
    updatedPlayers[index].name = value;

    setFormData({
      ...formData,
      players: updatedPlayers,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data } = await axiosInstance.post(
        `/api/user/tournaments/${id}/register`,
        formData
      );

      if (data.success) {
        toast.success("Tournament Registered Successfully");

        navigate("/my-tournaments");
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">

      <h1 className="text-3xl font-bold mb-8">
        Register Team
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-base-100 shadow rounded-xl p-6"
      >

        <input
          type="text"
          placeholder="Team Name"
          className="input input-bordered w-full"
          value={formData.teamName}
          onChange={(e) =>
            setFormData({
              ...formData,
              teamName: e.target.value,
            })
          }
          required
        />

        <input
          type="text"
          placeholder="Captain Name"
          className="input input-bordered w-full"
          value={formData.captainName}
          onChange={(e) =>
            setFormData({
              ...formData,
              captainName: e.target.value,
            })
          }
          required
        />

        <input
          type="tel"
          placeholder="Captain Phone"
          className="input input-bordered w-full"
          value={formData.captainPhone}
          onChange={(e) =>
            setFormData({
              ...formData,
              captainPhone: e.target.value,
            })
          }
          required
        />

        <div>

          <h2 className="text-xl font-semibold mb-4">
            Players
          </h2>

          {formData.players.map((player, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Player ${index + 1}`}
              className="input input-bordered w-full mb-3"
              value={player.name}
              onChange={(e) =>
                handlePlayerChange(
                  index,
                  e.target.value
                )
              }
            />
          ))}

        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading
            ? "Registering..."
            : "Register Team"}
        </button>

      </form>

    </div>
  );
};

export default TournamentRegistration;