import { useParams } from "react-router-dom";
import useDateSelection from "./useDateSelection";
import useTimeSelection from "./useTimeSelection";
import useDurationSelection from "./useDurationSelection";
import useBookingConfirmation from "./useBookingConfirmation";
import { useCallback, useEffect, useState } from "react";
import { addHours, format, formatISO, parse, parseISO, set } from "date-fns";
import axiosInstance from "./useAxiosInstance";
import toast from "react-hot-toast";

const useReservation = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [bookedTime, setBookedTime] = useState([]);
  const [timeSlots, setTimeSlots] = useState({ openTime: "", closeTime: "" });
  const [pricePerHour, setPricePerHour] = useState(0);
  const [duration, setDuration] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const [couponBreakdown, setCouponBreakdown] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  const buildTimes = useCallback(() => {
    const selectedTurfDate = format(selectedDate, "yyyy-MM-dd");
    const parsedStartTime = parse(selectedStartTime, "hh:mm a", new Date());
    const combinedStartDateTime = set(parseISO(selectedTurfDate), {
      hours: parsedStartTime.getHours(),
      minutes: parsedStartTime.getMinutes(),
      seconds: 0,
      milliseconds: 0,
    });
    const combinedEndDateTime = addHours(combinedStartDateTime, duration);
    return {
      selectedTurfDate,
      startTimeISO: formatISO(combinedStartDateTime),
      endTimeISO: formatISO(combinedEndDateTime),
    };
  }, [duration, selectedDate, selectedStartTime]);

  const applyCoupon = async (selectedCode = couponCode) => {
    if (!selectedStartTime) {
      toast.error("Please select time first");
      return;
    }
    const code = String(selectedCode || "").trim();
    if (!code) {
      toast.error("Enter coupon code");
      return;
    }
    try {
      setCouponCode(code);
      const { startTimeISO, endTimeISO } = buildTimes();
      const { data } = await axiosInstance.post("/api/user/coupons/validate", {
        code,
        turfId: id,
        startTime: startTimeISO,
        endTime: endTimeISO,
      });
      setCouponBreakdown(data.breakdown);
      toast.success(data.message || "Coupon applied");
    } catch (e) {
      setCouponBreakdown(null);
      toast.error(e?.response?.data?.message || "Invalid coupon");
    }
  };

  const clearCoupon = () => {
    setCouponCode("");
    setCouponBreakdown(null);
  };

  useEffect(() => {
    setCouponBreakdown(null);
  }, [selectedDate, selectedStartTime, duration, id]);

  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      if (!selectedStartTime || duration <= 0) {
        setAvailableCoupons([]);
        setCouponsLoading(false);
        return;
      }

      try {
        setCouponsLoading(true);
        const { startTimeISO, endTimeISO } = buildTimes();
        const { data } = await axiosInstance.get("/api/user/coupons/available", {
          params: {
            turfId: id,
            startTime: startTimeISO,
            endTime: endTimeISO,
          },
        });
        setAvailableCoupons(data.coupons || []);
      } catch (error) {
        setAvailableCoupons([]);
      } finally {
        setCouponsLoading(false);
      }
    };

    fetchAvailableCoupons();
  }, [buildTimes, duration, id, selectedDate, selectedStartTime]);


  const { handleDateChange } = useDateSelection(
    setSelectedDate,
    setSelectedStartTime,
    setDuration
  );

  const { availableTimes, handleTimeSelection, isTimeSlotBooked } =
    useTimeSelection(
      selectedDate,
      id,
      setSelectedStartTime,
      setBookedTime,
      setTimeSlots,
      setPricePerHour,
      bookedTime,
      timeSlots,
      setDuration
    );

  const { handleDurationChange, isDurationAvailable } = useDurationSelection(
    selectedStartTime,
    timeSlots,
    isTimeSlotBooked,
    setDuration
  );

  const { confirmReservation } = useBookingConfirmation(
    id,
    selectedDate,
    selectedStartTime,
    duration,
    pricePerHour,
    couponBreakdown?.code ? couponBreakdown.code : String(couponCode || "").trim(),
    setLoading
  );

  return {
    selectedDate,
    selectedStartTime,
    duration,
    availableTimes,
    timeSlots,
    handleDateChange,
    handleTimeSelection,
    handleDurationChange,
    isTimeSlotBooked,
    isDurationAvailable,
    confirmReservation,
    pricePerHour,
    loading,
    couponCode,
    setCouponCode,
    couponBreakdown,
    applyCoupon,
    clearCoupon,
    availableCoupons,
    couponsLoading,
  };
};

export default useReservation;
