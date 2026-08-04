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
  // Debug whenever timeSlots changes
  useEffect(() => {
    console.log("timeSlots changed:", timeSlots);
  }, [timeSlots]);

  // Generate available time slots
  const availableTimes = useMemo(() => {
    if (!timeSlots?.openTime || !timeSlots?.closeTime) {
      return [];
    }

    const times = [];

    const openTime = parse(timeSlots.openTime, "hh:mm a", new Date());
    const closeTime = parse(timeSlots.closeTime, "hh:mm a", new Date());

    let currentTime = openTime;

    while (isBefore(currentTime, closeTime)) {
      times.push(format(currentTime, "hh:mm a"));
      currentTime = addHours(currentTime, 1);
    }

    console.log("Generated Times:", times);

    return times;
  }, [timeSlots]);

  const handleTimeSelection = (time) => {
    setSelectedStartTime(time);
    setDuration(1);
  };

  const isSameTime = (time1, time2) => {
    return (
      time1.getHours() === time2.getHours() &&
      time1.getMinutes() === time2.getMinutes()
    );
  };

  const isTimeSlotBooked = (time) => {
    const timeToCheck = parse(time, "hh:mm a", new Date());

    return (bookedTime || []).some((booking) => {
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

  const fetchByDate = useCallback(
    async (currentSelectedDate, turfId) => {
      const date = format(currentSelectedDate, "yyyy-MM-dd");

      try {
        const { data } = await axiosInstance.get(
          `/api/Turf/timeslot?date=${date}&turfId=${turfId}`
        );

        console.log("API Response:", data);

        setTimeSlots(data.timeSlots);
        setPricePerHour(data.timeSlots.pricePerHour);

        const formattedBookedTime = (data.bookedTime || []).map((booking) => ({
          ...booking,
          startTime: format(parseISO(booking.startTime), "hh:mm a"),
          endTime: format(parseISO(booking.endTime), "hh:mm a"),
        }));

        setBookedTime(formattedBookedTime);
      } catch (error) {
        console.error("Error fetching timeslots:", error);
      }
    },
    [setBookedTime, setPricePerHour, setTimeSlots]
  );

  useEffect(() => {
    if (turfId) {
      fetchByDate(selectedDate, turfId);
    }
  }, [fetchByDate, selectedDate, turfId]);

  return {
    availableTimes,
    handleTimeSelection,
    isTimeSlotBooked,
  };
};

export default useTimeSelection;