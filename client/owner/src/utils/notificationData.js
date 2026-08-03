import { format } from "date-fns";

export const OWNER_NOTIFICATIONS_STORAGE_KEY = "PlayRizon-owner-notifications-v1";
export const OWNER_NOTIFICATIONS_EVENT = "PlayRizon-owner-notifications-updated";

const ownerNotificationFallback = [];

const parseDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateLabel = (value) => {
  const date = parseDate(value);
  return date ? format(date, "dd MMM yyyy") : "Unknown date";
};

const formatTimeLabel = (value) => {
  const date = parseDate(value);
  return date ? format(date, "hh:mm a") : "Unknown time";
};

const formatTimestampLabel = (value) => {
  const date = parseDate(value);
  return date ? format(date, "dd MMM yyyy, hh:mm a") : "Unknown slot time";
};

const mergeWithStoredStatuses = (notifications) => {
  const stored = readOwnerNotifications();
  const statusMap = new Map(stored.map((item) => [item.id, item.status]));

  return notifications.map((item) => ({
    ...item,
    status: statusMap.get(item.id) || item.status || "unread",
  }));
};

export const buildOwnerBookingNotifications = (bookings = []) => {
  const bookingNotifications = (bookings || [])
    .filter((booking) => booking?.startTime && booking?.endTime)
    .map((booking) => {
      const slotDate = formatDateLabel(booking.startTime);
      const startTime = formatTimeLabel(booking.startTime);
      const endTime = formatTimeLabel(booking.endTime);
      const isCancelled = booking.status === "cancelled";

      return {
        id: `owner-booking-${booking.id}`,
        title: isCancelled ? "Booking cancelled" : "New booking received",
        message: isCancelled
          ? `${booking.userName || "A user"} cancelled the ${slotDate} slot from ${startTime} to ${endTime} for ${booking.turfName || "your turf"}.`
          : `${booking.userName || "A user"} booked ${booking.turfName || "your turf"} for ${slotDate} from ${startTime} to ${endTime}.`,
        type: "booking",
        status: "unread",
        priority: isCancelled ? "medium" : "high",
        timestamp: formatTimestampLabel(booking.bookingDate || booking.startTime),
        actionLabel: "Open bookings",
        actionTo: "/owner/bookings",
      };
    });

  const rescheduleNotifications = (bookings || [])
    .filter(
      (booking) =>
        booking?.reschedule?.status === "requested" &&
        booking?.reschedule?.requestedStartTime &&
        booking?.reschedule?.requestedEndTime
    )
    .map((booking) => {
      const requestedDate = formatDateLabel(booking.reschedule.requestedStartTime);
      const requestedStart = formatTimeLabel(booking.reschedule.requestedStartTime);
      const requestedEnd = formatTimeLabel(booking.reschedule.requestedEndTime);

      return {
        id: `owner-reschedule-request-${booking.id}`,
        title: "Reschedule request pending",
        message: `${booking.userName || "A user"} wants to move ${booking.turfName || "a booking"} to ${requestedDate} from ${requestedStart} to ${requestedEnd}.`,
        type: "booking",
        status: "unread",
        priority: "high",
        timestamp: formatTimestampLabel(
          booking.reschedule.requestedAt || booking.bookingDate || booking.startTime
        ),
        actionLabel: "Review request",
        actionTo: "/owner/bookings",
      };
    });

  return mergeWithStoredStatuses([
    ...rescheduleNotifications,
    ...bookingNotifications,
  ]);
};

export const readOwnerNotifications = () => {
  if (typeof window === "undefined") {
    return ownerNotificationFallback;
  }

  try {
    const stored = window.localStorage.getItem(OWNER_NOTIFICATIONS_STORAGE_KEY);
    if (!stored) {
      return ownerNotificationFallback;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : ownerNotificationFallback;
  } catch (error) {
    console.error("Failed to read owner notifications", error);
    return ownerNotificationFallback;
  }
};

export const writeOwnerNotifications = (notifications) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      OWNER_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
    window.dispatchEvent(new Event(OWNER_NOTIFICATIONS_EVENT));
  } catch (error) {
    console.error("Failed to save owner notifications", error);
  }
};

export const getUnreadOwnerNotificationCount = () =>
  readOwnerNotifications().filter((item) => item.status === "unread").length;
