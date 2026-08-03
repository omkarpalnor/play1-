import { useCallback, useState } from "react";
import axiosInstance from "../useAxiosInstance";
import toast from "react-hot-toast";

const normalizeTurfCollection = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.allTurfs)) {
    return payload.allTurfs;
  }

  if (Array.isArray(payload?.turfs)) {
    return payload.turfs;
  }

  return [];
};

const useTurfManagement = () => {
  const [turfs, setTurfs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTurfs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/Turf/my");
      setTurfs(normalizeTurfCollection(response.data));
    } catch (err) {
      setError("Failed to fetch turfs");
      setTurfs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addTurf = useCallback(async (newTurf) => {
    try {
      // Replace this with your actual API call
      const response = await fetch("/api/turfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTurf),
      });
      const addedTurf = await response.json();
      setTurfs((prev) => [...prev, addedTurf]);
    } catch (err) {
      setError("Failed to add turf");
    }
  }, []);

  const editTurf = useCallback(async (updatedTurf, turfId) => {
    try {
     const response = await axiosInstance.put(
  `/api/Turf/${turfId}`,
  updatedTurf
);
      const result = response.data;
     fetchTurfs();
      setError(null);
      toast.success(result.message || "Turf updated successfully");
    } catch (error) {
      console.log(error, "error in edit turf");
      toast.error(error.response?.data?.message || "Failed to update turf");
    }
  }, []);

  const updateTurfStatus = useCallback(async (turfId, action) => {
    try {
      // const response = await axiosInstance.patch(`/api/owner/turf/${turfId}/status`, {
      //   action,
      // });
      const result = response.data;
      setTurfs(normalizeTurfCollection(result));
      setError(null);
      toast.success(result.message || "Turf status updated");
    } catch (error) {
      console.error("error updating turf status", error);
      toast.error(error.response?.data?.message || "Failed to update turf status");
    }
  }, []);

  const deleteTurf = useCallback(async (id) => {
    try {
      // Replace this with your actual API call
await axiosInstance.delete(`/api/Turf/${id}`);

toast.success("Turf deleted successfully");

fetchTurfs();
      setTurfs((prev) => prev.filter((turf) => turf.id !== id));
    } catch (err) {
      setError("Failed to delete turf");
    }
  }, []);

  return {
    turfs,
    isLoading,
    error,
    fetchTurfs,
    addTurf,
    editTurf,
    updateTurfStatus,
    deleteTurf,
  };
};

export default useTurfManagement;
