import axiosInstance from "../hooks/useAxiosInstance";
import {
  buildUserNotifications,
  writeUserNotifications,
} from "./notificationData";

const normalizeBookings = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.bookings)) return payload.bookings;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const normalizeCoupons = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.coupons)) return payload.coupons;
  if (Array.isArray(payload?.data?.coupons)) return payload.data.coupons;
  return [];
};

const normalizeMatches = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.posts)) return payload.posts;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const syncUserNotifications = async (currentUserId = "") => {
  // 🔍 Extract fallback user ID from localStorage if currentUserId is empty
  let activeId = String(currentUserId || "").trim();
  if (!activeId && typeof window !== "undefined") {
    try {
      const storedUser = window.localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        activeId = String(parsed?.id || parsed?.id || "").trim();
      }
    } catch (e) {}
    if (!activeId) {
      activeId = String(window.localStorage.getItem("userId") || "").trim();
    }
  }

  const [bookingsResult, couponsResult, matchesResult] = await Promise.allSettled([
    axiosInstance.get("/api/user/booking/get-bookings"),
    axiosInstance.get("/api/user/coupons/notifications"),
    axiosInstance.get("/api/user/matchmaking/user-notifications"),
  ]);

  const bookings =
    bookingsResult.status === "fulfilled"
      ? normalizeBookings(bookingsResult.value.data)
      : [];
  const coupons =
    couponsResult.status === "fulfilled"
      ? normalizeCoupons(couponsResult.value.data)
      : [];
  const matches =
    matchesResult.status === "fulfilled"
      ? normalizeMatches(matchesResult.value.data)
      : [];

  const notifications = buildUserNotifications({
    bookings,
    coupons,
    matches,
    currentUserId: activeId, // Pass verified activeId here
  });

  writeUserNotifications(notifications);
  return notifications;
};