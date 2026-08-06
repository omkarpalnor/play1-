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

        const response = await axiosInstance.get("/api/Turf");

        console.log("API Response:", response.data);

        const mappedTurfs = response.data.map((turf) => ({
          id: turf.id,
          _id: turf.id,

          name: turf.name,
          description: turf.description ?? "",

          image: turf.imageUrl
            ? `http://localhost:5000${turf.imageUrl}`
            : "/banner-1.png",

          sport: turf.sport,
          sportTypes: [turf.sport],

          address: turf.address,
          location: turf.address,

          price: turf.pricePerHour,
          pricePerHour: turf.pricePerHour,

          rating: 4.5, // Temporary for CDAC project
          distance: 0, // Temporary

          latitude: Number(turf.latitude),
          longitude: Number(turf.longitude),

          openTime: turf.openTime,
          closeTime: turf.closeTime,

          isAvailable: turf.isAvailable,
        }));

        console.log("Mapped Turfs:", mappedTurfs);

        dispatch(setTurfs(mappedTurfs));
      } catch (err) {
        console.error(err);

        dispatch(
          setError(err.response?.data?.message || err.message)
        );
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