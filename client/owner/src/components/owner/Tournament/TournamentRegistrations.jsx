import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "@hooks/useAxiosInstance";
import toast from "react-hot-toast";

import RegistrationCard from "./RegistrationCard";

const TournamentRegistrations = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/owner/tournament-registrations/${id}`
      );

      if (data.success) {
        setRegistrations(data.registrations);
      }
    } catch (error) {
      toast.error("Unable to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (registrationId) => {
    try {
      await axiosInstance.patch(
        `/api/owner/tournament-registrations/approve/${registrationId}`
      );

      toast.success("Registration Approved");

      fetchRegistrations();
    } catch {
      toast.error("Approval failed");
    }
  };

  const rejectRegistration = async (registrationId) => {
    try {
      await axiosInstance.patch(
        `/api/owner/tournament-registrations/reject/${registrationId}`
      );

      toast.success("Registration Rejected");

      fetchRegistrations();
    } catch {
      toast.error("Rejection failed");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-8">
        Tournament Registrations
      </h1>

      {registrations.length === 0 ? (
        <div className="bg-white rounded-xl border p-10 text-center">
          No registrations yet.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">

          {registrations.map((registration) => (
            <RegistrationCard
              key={registration._id}
              registration={registration}
              onApprove={approveRegistration}
              onReject={rejectRegistration}
            />
          ))}

        </div>
      )}

    </div>
  );
};

export default TournamentRegistrations;