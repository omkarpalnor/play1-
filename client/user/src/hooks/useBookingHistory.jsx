import { useCallback, useEffect, useState } from "react";
import axiosInstance from "./useAxiosInstance";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { handlePayment, releaseSlotHold } from "../config/razorpay";
import "https://checkout.razorpay.com/v1/checkout.js";

export default function useBookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cancellationPreview, setCancellationPreview] = useState(null);
  const [reschedulingBookingId, setReschedulingBookingId] = useState(null);
  const [payingRescheduleBookingId, setPayingRescheduleBookingId] = useState(null);
  const [summary, setSummary] = useState({
    totalPointsEarned: 0,
    activePoints: 0,
  });

  const formatBookingsData = (bookings) => {
    return bookings.map((booking) => {
      const fallbackReviewEligibility = booking.reviewEligibility || {
        canReview: false,
        hasReview: false,
        isCompleted: false,
        reason: "Booking slot details are unavailable",
        reviewId: null,
      };

      if (!booking.timeSlot?.startTime || !booking.timeSlot?.endTime) {
        return {
          ...booking,
          status: booking.status || "confirmed",
          timeSlot: {
            ...booking.timeSlot,
            formattedStartTime: "Unavailable",
            formattedEndTime: "Unavailable",
            date: "Unavailable",
          },
          isUpcoming: false,
          isCompleted: false,
          reviewEligibility: fallbackReviewEligibility,
        };
      }

      const startTime = parseISO(booking.timeSlot.startTime);
      const endTime = parseISO(booking.timeSlot.endTime);
      const status = booking.status || "confirmed";
      const reviewEligibility = booking.reviewEligibility || {
        canReview: false,
        hasReview: false,
        isCompleted: status === "confirmed" && endTime <= new Date(),
        reason:
          endTime > new Date()
            ? "Review is available after this booking ends"
            : null,
        reviewId: null,
      };

      return {
        ...booking,
        status,
        timeSlot: {
          ...booking.timeSlot,
          formattedStartTime: format(startTime, "hh:mm a"),
          formattedEndTime: format(endTime, "hh:mm a"),
          date: format(startTime, "dd MMM yyyy"),
        },
        isUpcoming: startTime > new Date(),
        isCompleted:
          Boolean(reviewEligibility.isCompleted) ||
          (status === "confirmed" && endTime <= new Date()),
        loyaltyPointsEarned: booking.loyaltyPointsEarned || 0,
        reschedule: booking.reschedule || null,
        reviewEligibility,
      };
    });
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/api/user/booking/get-bookings"
      );
      const result = response.data;
      const formattedBookings = formatBookingsData(result);
      setBookings(formattedBookings);
      setSummary({
        totalPointsEarned: formattedBookings.reduce(
          (sum, booking) => sum + Number(booking.loyaltyPointsEarned || 0),
          0
        ),
        activePoints: formattedBookings
          .filter((booking) => booking.status === "confirmed")
          .reduce(
            (sum, booking) => sum + Number(booking.loyaltyPointsEarned || 0),
            0
          ),
      });
    } catch (error) {
      console.error(error, "error");
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = async (bookingId) => {
    return cancelBookingWithReason(bookingId, "");
  };

  const loadCancellationPreview = async (bookingId) => {
    setPreviewLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/user/booking/cancellation-preview/${bookingId}`
      );
      setCancellationPreview(response.data);
      return response.data;
    } catch (error) {
      console.error(error, "preview error");
      toast.error(
        error.response?.data?.message || "Failed to load cancellation preview"
      );
      return null;
    } finally {
      setPreviewLoading(false);
    }
  };

  const clearCancellationPreview = () => {
    setCancellationPreview(null);
  };

  const cancelBookingWithReason = async (bookingId, reason) => {
    setCancellingBookingId(bookingId);
    try {
      const response = await axiosInstance.patch(
        `/api/user/booking/cancel-booking/${bookingId}`,
        { reason }
      );
      toast.success(response.data?.message || "Booking cancelled successfully");
      clearCancellationPreview();
      await fetchBookings();
    } catch (error) {
      console.error(error, "cancel booking error");
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancellingBookingId(null);
    }
  };

  const requestReschedule = async (
    bookingId,
    requestedStartTime,
    requestedEndTime,
    reason
  ) => {
    setReschedulingBookingId(bookingId);
    try {
      const response = await axiosInstance.post(
        `/api/user/booking/reschedule-request/${bookingId}`,
        {
          requestedStartTime,
          requestedEndTime,
          reason,
        }
      );
      toast.success(
        response.data?.message || "Reschedule request submitted successfully"
      );
      await fetchBookings();
    } catch (error) {
      console.error(error, "reschedule request error");
      toast.error(
        error.response?.data?.message || "Failed to submit reschedule request"
      );
    } finally {
      setReschedulingBookingId(null);
    }
  };

  const payRescheduleDifference = async (bookingId) => {
    setPayingRescheduleBookingId(bookingId);

    try {
      const orderResponse = await axiosInstance.post(
        `/api/user/booking/reschedule-payment-order/${bookingId}`
      );
      const { order, user, holdToken } = orderResponse.data;

      const razorpayResponse = await handlePayment(order, user, {
        onDismiss: async () => {
          await releaseSlotHold(holdToken);
        },
        onPaymentFailed: async () => {
          await releaseSlotHold(holdToken);
        },
      });

      const verifyResponse = await axiosInstance.post(
        `/api/user/booking/reschedule-payment-verify/${bookingId}`,
        {
          orderId: razorpayResponse.razorpay_order_id,
          paymentId: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
          holdToken,
        }
      );

      toast.success(
        verifyResponse.data?.message || "Reschedule payment completed successfully"
      );
      await fetchBookings();
    } catch (error) {
      console.error(error, "reschedule payment error");

      if (error?.message === "Payment cancelled") {
        return;
      }

      toast.error(
        error.response?.data?.message || "Failed to complete reschedule payment"
      );
    } finally {
      setPayingRescheduleBookingId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    cancelBooking,
    cancelBookingWithReason,
    cancellingBookingId,
    summary,
    previewLoading,
    cancellationPreview,
    loadCancellationPreview,
    clearCancellationPreview,
    requestReschedule,
    reschedulingBookingId,
    payRescheduleDifference,
    payingRescheduleBookingId,
    fetchBookings,
  };
}
