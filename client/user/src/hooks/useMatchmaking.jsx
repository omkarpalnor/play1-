import { useEffect, useState } from "react";
import axios from "axios";

export default function useMatchmaking() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequirements = async () => {
    try {
      const res = await axios.get("/api/user/matchmaking/all");
      setRequirements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  return {
    requirements,
    loading,
    refresh: fetchRequirements,
  };
}