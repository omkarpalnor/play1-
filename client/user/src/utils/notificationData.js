import { compareDesc, format, isAfter, parseISO } from "date-fns";

export const USER_NOTIFICATIONS_STORAGE_KEY = "PlayRizon-user-notifications-v1";
export const USER_NOTIFICATIONS_EVENT = "PlayRizon-user-notifications-updated";

const userNotificationFallback = [
  {
    id: "user-loyalty-points",
    title: "Loyalty rewards available",
    message:
      "Book regularly on PlayRizon to grow your loyalty points and unlock more value over time.",
    type: "rewards",
    status: "read",
    priority: "low",
    timestamp: "PlayRizon update",
    actionLabel: "Open profile",
    actionTo: "/auth/profile",
  },
  {
    id: "user-account-update",
    title: "Account and refund updates",
    message:
      "Any booking cancellation, refund, or account-related booking status will appear here.",
    type: "account",
    status: "read",
    priority: "low",
    timestamp: "PlayRizon update",
    actionLabel: "View booking",
    actionTo: "/auth/booking-history",
  },
];

const parseDate = (value) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
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
  return date ? format(date, "dd MMM yyyy, hh:mm a") : "Unknown update time";
};

const mergeWithStoredStatuses = (notifications) => {
  const stored = readUserNotifications();
  const statusMap = new Map(stored.map((item) => [item.id, item.status]));

  return notifications.map((item) => ({
    ...item,
    status: statusMap.get(item.id) || item.status || "unread",
  }));
};

const buildRescheduleNotifications = (bookings = []) =>
  (bookings || [])
    .filter((booking) => booking?.reschedule?.status && booking.reschedule.status !== "none")
    .map((booking) => {
      const reschedule = booking.reschedule;
      const turfName = booking.turf?.name || "your turf";
      const requestedDate = formatDateLabel(
        reschedule.requestedStartTime || booking.timeSlot?.startTime
      );
      const requestedStart = formatTimeLabel(
        reschedule.requestedStartTime || booking.timeSlot?.startTime
      );
      const requestedEnd = formatTimeLabel(
        reschedule.requestedEndTime || booking.timeSlot?.endTime
      );
      const currentDate = formatDateLabel(booking.timeSlot?.startTime);
      const currentStart = formatTimeLabel(booking.timeSlot?.startTime);
      const currentEnd = formatTimeLabel(booking.timeSlot?.endTime);

      if (reschedule.status === "requested") {
        return {
          id: `user-reschedule-requested-${booking._id}`,
          title: `Reschedule request sent for ${turfName}`,
          message: `Your request to move the booking to ${requestedDate} from ${requestedStart} to ${requestedEnd} is waiting for owner approval.`,
          type: "account",
          status: "unread",
          priority: "high",
          timestamp: formatTimestampLabel(reschedule.requestedAt),
          occurredAt: reschedule.requestedAt,
          actionLabel: "View booking",
          actionTo: "/auth/booking-history",
        };
      }

      if (reschedule.status === "completed") {
        return {
          id: `user-reschedule-approved-${booking._id}`,
          title: `Reschedule approved for ${turfName}`,
          message: `Your booking has been updated to ${currentDate} from ${currentStart} to ${currentEnd}.${reschedule.ownerNotes ? ` Owner note: ${reschedule.ownerNotes}` : ""}`,
          type: "booking",
          status: "unread",
          priority: "high",
          timestamp: formatTimestampLabel(reschedule.completedAt || reschedule.reviewedAt),
          occurredAt: reschedule.completedAt || reschedule.reviewedAt,
          actionLabel: "Check booking",
          actionTo: "/auth/booking-history",
        };
      }

      if (reschedule.status === "rejected") {
        return {
          id: `user-reschedule-rejected-${booking._id}`,
          title: `Reschedule rejected for ${turfName}`,
          message: `Your booking remains on ${currentDate} from ${currentStart} to ${currentEnd}.${reschedule.ownerNotes ? ` Owner note: ${reschedule.ownerNotes}` : ""}`,
          type: "account",
          status: "unread",
          priority: "medium",
          timestamp: formatTimestampLabel(reschedule.reviewedAt),
          occurredAt: reschedule.reviewedAt,
          actionLabel: "View booking",
          actionTo: "/auth/booking-history",
        };
      }

      return null;
    })
    .filter(Boolean);

const buildBookingNotifications = (bookings = []) =>
  (bookings || [])
    .filter((booking) => booking?.timeSlot?.startTime && booking?.timeSlot?.endTime)
    .map((booking) => {
      const slotDate = formatDateLabel(booking.timeSlot.startTime);
      const startTime = formatTimeLabel(booking.timeSlot.startTime);
      const endTime = formatTimeLabel(booking.timeSlot.endTime);
      const status = booking.status || "confirmed";
      const isCancelled = status === "cancelled";

      return {
        id: `user-booking-${booking._id}`,
        title: isCancelled
          ? `Booking cancelled for ${booking.turf?.name || "your turf"}`
          : `Booking confirmed for ${booking.turf?.name || "your turf"}`,
        message: isCancelled
          ? `Your booking for ${slotDate} from ${startTime} to ${endTime} has been cancelled.`
          : `Your booking for ${slotDate} from ${startTime} to ${endTime} is confirmed.`,
        type: isCancelled ? "account" : "booking",
        status: "unread",
        priority: isCancelled ? "medium" : "high",
        timestamp: formatTimestampLabel(
          booking.cancelledAt || booking.createdAt || booking.timeSlot.startTime
        ),
        occurredAt:
          booking.cancelledAt || booking.createdAt || booking.timeSlot.startTime,
        actionLabel: "View booking",
        actionTo: "/auth/booking-history",
      };
    });

const buildUpcomingNotifications = (bookings = []) =>
  (bookings || [])
    .filter((booking) => {
      const startTime = parseDate(booking?.timeSlot?.startTime);
      return booking?.status === "confirmed" && startTime && isAfter(startTime, new Date());
    })
    .slice(0, 3)
    .map((booking) => {
      const slotDate = formatDateLabel(booking.timeSlot.startTime);
      const startTime = formatTimeLabel(booking.timeSlot.startTime);

      return {
        id: `user-upcoming-${booking._id}`,
        title: "Upcoming booking reminder",
        message: `${booking.turf?.name || "Your turf"} is booked for ${slotDate} at ${startTime}. Reach a little early for a smoother check-in.`,
        type: "booking",
        status: "unread",
        priority: "medium",
        timestamp: formatTimestampLabel(booking.timeSlot.startTime),
        occurredAt: booking.timeSlot.startTime,
        actionLabel: "Check details",
        actionTo: "/auth/booking-history",
      };
    });

const buildCouponNotifications = (coupons = []) =>
  (coupons || []).map((coupon) => {
    const discountText =
      coupon.discountType === "PERCENT"
        ? `${coupon.value}% off`
        : `Rs ${coupon.value} off`;
    const title = coupon.title || `Coupon ${coupon.code}`;
    const scope = coupon.turf?.name ? ` for ${coupon.turf.name}` : "";

    return {
      id: `user-coupon-${coupon._id}`,
      title: `New coupon added: ${coupon.code}`,
      message: `${title}${scope} is now active with ${discountText}. ${coupon.description || "Use it on your next booking."}`,
      type: "offer",
      status: "unread",
      priority: "medium",
      timestamp: formatTimestampLabel(coupon.createdAt),
      occurredAt: coupon.createdAt,
      actionLabel: "Browse turfs",
      actionTo: "/auth/turfs",
    };
  });

const buildMatchmakingNotifications = (matches = [], currentUserId = "") => {
  // Extract active User ID robustly
  let activeUserId = String(currentUserId || "").trim();

  if (!activeUserId && typeof window !== "undefined") {
    try {
      const rawUserStr = window.localStorage.getItem("user");
      if (rawUserStr) {
        const parsedUser = JSON.parse(rawUserStr);
        activeUserId = String(parsedUser?._id || parsedUser?.id || "").trim();
      }
    } catch (e) {}
    if (!activeUserId) {
      activeUserId = String(window.localStorage.getItem("userId") || "").trim();
    }
  }

  console.log("=== MATCHMAKING NOTIFICATION DEBUG ===");
  console.log("Active User ID (Logged In):", activeUserId);
  console.log("Matches Array Received:", matches);

  return (matches || [])
    .flatMap((match) => {
      const items = [];
      const turfName =
        typeof match.turf === "object"
          ? match.turf?.name
          : match.turf || "Turf Match";

      // Safely extract Host ID
      const hostUserId = String(
        typeof match.hostUser === "object"
          ? match.hostUser?._id || match.hostUser?.id
          : match.hostUser || ""
      ).trim();

      const isHost = Boolean(activeUserId) && hostUserId === activeUserId;

      console.log("Post Host ID:", hostUserId);
      console.log("Is Current User Host?:", isHost);
      console.log("Joined Players Count:", match.joinedPlayers?.length);

      // 👑 IF LOGGED-IN USER IS THE HOST
      if (isHost) {
        if (match.joinedPlayers && match.joinedPlayers.length > 0) {
          match.joinedPlayers.forEach((jp) => {
            const playerObj = typeof jp.user === "object" ? jp.user : null;
            const playerName = playerObj?.name || "A player";
            const jpUserId = String(playerObj?._id || playerObj?.id || jp.user || jp._id).trim();

            items.push({
              id: `match-joined-${match._id}-${jpUserId}`,
              title: "Teammate joined your match!",
              message: `${playerName} joined your team requirement for ${turfName} (${(
                match.sport || "sport"
              ).toUpperCase()}).`,
              type: "account",
              status: "unread",
              priority: "high",
              timestamp: formatTimestampLabel(match.updatedAt || match.createdAt),
              occurredAt: match.updatedAt || match.createdAt,
              actionLabel: "Manage team",
              actionTo: "/auth/matchmaking",
            });
          });
        }
      } 
      // 👥 IF LOGGED-IN USER IS A JOINED TEAMMATE
      else {
        const isUserJoined = (match.joinedPlayers || []).some((jp) => {
          const jpId = String(
            typeof jp.user === "object" ? jp.user?._id || jp.user?.id : jp.user || jp
          ).trim();
          return jpId === activeUserId;
        });

        if (isUserJoined) {
          const hostName =
            typeof match.hostUser === "object"
              ? match.hostUser?.name
              : "Match Host";

          items.push({
            id: `match-squad-${match._id}`,
            title: "You're in! Match squad update",
            message: `You joined ${hostName}'s match at ${turfName}. Check the team roster for player contacts.`,
            type: "account",
            status: "unread",
            priority: "medium",
            timestamp: formatTimestampLabel(match.updatedAt || match.createdAt),
            occurredAt: match.updatedAt || match.createdAt,
            actionLabel: "View roster",
            actionTo: "/auth/matchmaking",
          });
        }
      }

      return items;
    })
    .filter(Boolean);
};

export const buildUserNotifications = ({
  bookings = [],
  coupons = [],
  matches = [],
  currentUserId = "",
} = {}) => {
  const notifications = [
    ...buildRescheduleNotifications(bookings),
    ...buildBookingNotifications(bookings),
    ...buildUpcomingNotifications(bookings),
    ...buildCouponNotifications(coupons),
    ...buildMatchmakingNotifications(matches, currentUserId),
    ...userNotificationFallback,
  ];

  const sortedNotifications = notifications.sort((left, right) => {
    const leftDate = parseDate(left.occurredAt);
    const rightDate = parseDate(right.occurredAt);

    if (!leftDate && !rightDate) {
      return 0;
    }

    if (!leftDate) {
      return 1;
    }

    if (!rightDate) {
      return -1;
    }

    return compareDesc(leftDate, rightDate);
  });

  return mergeWithStoredStatuses(sortedNotifications);
};

export const readUserNotifications = () => {
  if (typeof window === "undefined") {
    return userNotificationFallback;
  }

  try {
    const stored = window.localStorage.getItem(USER_NOTIFICATIONS_STORAGE_KEY);
    if (!stored) {
      return userNotificationFallback;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : userNotificationFallback;
  } catch (error) {
    console.error("Failed to read user notifications", error);
    return userNotificationFallback;
  }
};

export const writeUserNotifications = (notifications) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      USER_NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
    window.dispatchEvent(new Event(USER_NOTIFICATIONS_EVENT));
  } catch (error) {
    console.error("Failed to save user notifications", error);
  }
};

export const getUnreadUserNotificationCount = () =>
  readUserNotifications().filter((item) => item.status === "unread").length;