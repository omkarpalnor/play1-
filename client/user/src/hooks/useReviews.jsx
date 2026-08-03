import { useCallback, useEffect, useState } from "react";
import axiosInstance from "./useAxiosInstance";
import toast from "react-hot-toast";

const useReviews = (turfId) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/api/user/review/${turfId}`);
       const result = response.data;
       setReviews(result.reviews);
      setAverageRating(result.averageRating);
    } catch (err) {
      console.log(err, "error");
      toast.error(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, [turfId]);
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, averageRating };
};

export default useReviews;
