import { useCallback, useEffect, useMemo } from "react";
import {
  format,
  parse,
  isBefore,
  isAfter,
  parseISO,
  addDays,
  addHours,
} from "date-fns";
import axiosInstance from "./useAxiosInstance";

const useTimeSelection = (
  selectedDate,
  turfId,
  setSelectedStartTime,
  setBookedTime,
  setTimeSlots,
  setPricePerHour,
  bookedTime,
  timeSlots,
  setDuration
) => {
  const availableTimes = useMemo(() => {
    if (!timeSlots.openTime || !timeSlots.closeTime) return [];

    const times = [];
    const openTime = parse(timeSlots.openTime, "hh:mm a", new Date());
    const closeTime = parse(timeSlots.closeTime, "hh:mm a", new Date());

    let currentTime = openTime;

    while (isBefore(currentTime, closeTime)) {
      times.push(format(currentTime, "hh:mm a"));
      // currentTime = addMinutes(currentTime, 60);
      currentTime = addHours(currentTime, 1);
    }

    return times;
  }, [timeSlots.openTime, timeSlots.closeTime]);

  const handleTimeSelection = (time) => {
    setSelectedStartTime(time);
    setDuration(1);
  };

  const isTimeSlotBooked = (time) => {
    const timeToCheck = parse(time, "hh:mm a", new Date());
    return bookedTime.some((booking) => {
      const bookingStart = parse(booking.startTime, "hh:mm a", new Date());
      let bookingEnd = parse(booking.endTime, "hh:mm a", new Date());

      if (isBefore(bookingEnd, bookingStart)) {
        bookingEnd = addDays(bookingEnd, 1);
      }

      return (
        (isAfter(timeToCheck, bookingStart) ||
          isSameTime(timeToCheck, bookingStart)) &&
        isBefore(timeToCheck, bookingEnd)
      );
    });
  };

  const isSameTime = (time1, time2) => {
    return (
      time1.getHours() === time2.getHours() &&
      time1.getMinutes() === time2.getMinutes()
    );
  };

  const fetchByDate = useCallback(async (currentSelectedDate, turfId) => {
    const date = format(currentSelectedDate, "yyyy-MM-dd");

    try {
      const response = await axiosInstance.get(
        `/api/user/turf/timeslot?date=${date}&turfId=${turfId}`
      );
      const result = await response.data;
      setTimeSlots(result.timeSlots);
      setPricePerHour(result.timeSlots.pricePerHour);

      const formattedBookedTime = result.bookedTime.map((booking) => ({
        ...booking,
        startTime: format(parseISO(booking.startTime), "hh:mm a"),
        endTime: format(parseISO(booking.endTime), "hh:mm a"),
      }));
      setBookedTime(formattedBookedTime);
    } catch (error) {
      console.log("Error in fetchByDate", error.message);
    }
  }, [setBookedTime, setPricePerHour, setTimeSlots]);

  useEffect(() => {
    fetchByDate(selectedDate, turfId);
  }, [fetchByDate, selectedDate, turfId]);

  return {
    availableTimes,
    handleTimeSelection,
    isTimeSlotBooked,
  };
};

export default useTimeSelection;
