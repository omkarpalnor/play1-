import { useState } from "react";
import axiosInstance from "./useAxiosInstance";
import toast from "react-hot-toast";

const useWriteReview = ({ onReviewSubmitted } = {}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openReviewModal = (booking) => {
    const turfId = booking?.turf?._id || booking?.turfId || null;
    const bookingId = booking?._id || booking?.bookingId || null;

    if (!turfId || !bookingId) {
      toast.error("This booking is not eligible for review");
      return;
    }

    setReviewTarget({
      turfId,
      bookingId,
      turfName: booking?.turf?.name || "",
    });
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewTarget(null);
    setRating(0);
    setReview("");
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleReviewChange = (event) => {
    setReview(event.target.value);
  };

  const submitReview = async () => {
    if (!reviewTarget?.turfId || !reviewTarget?.bookingId) return;

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(
        `/api/user/review/${reviewTarget.turfId}`,
        {
          rating,
          review,
          bookingId: reviewTarget.bookingId,
        }
      );
      const result = response.data;
      toast.success(result.message);
      closeReviewModal();

      if (typeof onReviewSubmitted === "function") {
        await onReviewSubmitted();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isReviewModalOpen,
    rating,
    review,
    reviewTarget,
    isSubmitting,
    openReviewModal,
    closeReviewModal,
    handleRatingChange,
    handleReviewChange,
    submitReview,
  };
};

export default useWriteReview;
