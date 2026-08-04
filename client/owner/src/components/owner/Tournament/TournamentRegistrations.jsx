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
    if (id) {
      fetchRegistrations();
    }
  }, [id]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get(
        `/api/owner/tournament-registrations/${id}`
      );

      console.log("Registrations Response:", data);

      if (data.success) {
        setRegistrations(data.registrations || data.data || []);
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Unable to fetch registrations"
      );
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (registrationId) => {
    try {
      const { data } = await axiosInstance.patch(
        `/api/owner/tournament-registrations/approve/${registrationId}`
      );

      if (data.success) {
        toast.success(data.message || "Registration Approved");
        fetchRegistrations();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Approval failed"
      );
    }
  };

  const rejectRegistration = async (registrationId) => {
    try {
      const { data } = await axiosInstance.patch(
        `/api/owner/tournament-registrations/reject/${registrationId}`
      );

      if (data.success) {
        toast.success(data.message || "Registration Rejected");
        fetchRegistrations();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Rejection failed"
      );
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
              key={registration.id}
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