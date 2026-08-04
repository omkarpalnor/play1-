import { useSelector, useDispatch } from "react-redux";
import { setTurfs, setLoading, setError } from "../redux/slices/turfSlice";
import axiosInstance from "./useAxiosInstance";
import { useEffect } from "react";

const useTurfData = () => {
  const dispatch = useDispatch();

  const { turfs, loading, error } = useSelector((state) => state.turf);

  useEffect(() => {
    const fetchTurfs = async () => {
      try {
        dispatch(setLoading(true));

        // Change this endpoint if you create another public endpoint later
const response = await axiosInstance.get("/api/Turf");
        const mappedTurfs = response.data.map((turf) => ({
  id: turf.id,
  _id: turf.id,
  name: turf.name,
  description: turf.description ?? "",
  image: turf.imageUrl || "/banner-1.png",
  sportTypes: [turf.sport],
  location: turf.address,
  pricePerHour: turf.pricePerHour,
  openTime: turf.openTime,
  closeTime: turf.closeTime,
  latitude: turf.latitude,
  longitude: turf.longitude,
  isAvailable: turf.isAvailable,
}));

        dispatch(setTurfs(mappedTurfs));
      } catch (err) {
        dispatch(setError(err.response?.data?.message || err.message));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchTurfs();
  }, [dispatch]);

  return {
    turfs,
    loading,
    error,
  };
};

export default useTurfData;