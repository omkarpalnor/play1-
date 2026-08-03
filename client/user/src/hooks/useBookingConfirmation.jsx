import { format, parse, set, formatISO, addHours, parseISO } from "date-fns";
import toast from "react-hot-toast";
import axiosInstance from "./useAxiosInstance";
import { createOrder, handlePayment, releaseSlotHold } from "../config/razorpay";
import "https://checkout.razorpay.com/v1/checkout.js";
import { useNavigate } from "react-router-dom";
import { syncUserNotifications } from "../utils/userNotificationService";

const useBookingConfirmation = (
  id,
  selectedDate,
  selectedStartTime,
  duration,
  pricePerHour,
  couponCode,
  setLoading
) => {
  const navigate = useNavigate();
  const confirmReservation = async () => {
    const selectedTurfDate = format(selectedDate, "yyyy-MM-dd");
    const parsedStartTime = parse(selectedStartTime, "hh:mm a", new Date());

    const combinedStartDateTime = set(parseISO(selectedTurfDate), {
      hours: parsedStartTime.getHours(),
      minutes: parsedStartTime.getMinutes(),
      seconds: 0,
      milliseconds: 0,
    });

    const combinedEndDateTime = addHours(combinedStartDateTime, duration);

    const startTimeISO = formatISO(combinedStartDateTime);
    const endTimeISO = formatISO(combinedEndDateTime);

    try {
      setLoading(true);
      const orderResponse = await createOrder({
        turfId: id,
        startTime: startTimeISO,
        endTime: endTimeISO,
        couponCode,
      });
      const holdToken = orderResponse.slotHold?.token;
      setLoading(false);

      const clearHeldSlot = async () => {
        try {
          await releaseSlotHold(holdToken);
        } catch (releaseError) {
          console.error("Failed to release slot hold:", releaseError);
        }
      };

      const razorpayResponse = await handlePayment(orderResponse.order, orderResponse.user, {
        onDismiss: clearHeldSlot,
        onPaymentFailed: clearHeldSlot,
      });
      setLoading(true);
      const bookingData = {
        id,
        duration,
        startTime: startTimeISO,
        endTime: endTimeISO,
        selectedTurfDate,
        couponCode: couponCode || undefined,
        paymentId: razorpayResponse.razorpay_payment_id,
        orderId: razorpayResponse.razorpay_order_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        holdToken,
      };

      const response = await axiosInstance.post(
        "/api/user/booking/verify-payment",
        bookingData
      );
      const result = await response.data;
      await syncUserNotifications();
      toast.success(result.message);
      navigate("/auth/booking-history");
    } catch (err) {
      if (err.response) {
        toast.error(err.response?.data?.message);
      } else if (err?.description) {
        toast.error(err.description);
      } else if (err?.message && err.message !== "Payment cancelled") {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    confirmReservation,
  };
};

export default useBookingConfirmation;
