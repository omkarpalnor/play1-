import { useEffect, useState } from "react";
import axiosInstance from "../useAxiosInstance";
import toast from "react-hot-toast";

const useTurfData = () => {
  const [turfData, setTurfData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTurfData = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get("/api/Turf");

      setTurfData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load turfs");
      setTurfData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTurfStatus = async (turfId, action) => {
    try {
      const { data } = await axiosInstance.patch(
        `/api/admin/turfs/${turfId}/status`,
        { action }
      );

      toast.success(data.message || "Status updated");

      fetchTurfData();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update turf status"
      );
    }
  };

  useEffect(() => {
    fetchTurfData();
  }, []);

  return {
    turfData,
    loading,
    updateTurfStatus,
    refreshTurfs: fetchTurfData,
  };
};

export default useTurfData;