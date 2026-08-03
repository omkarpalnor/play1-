import { Link, useNavigate } from "react-router-dom";
import { Bell, Menu, MessageCircle } from "lucide-react";
import ThemeSwitcher from "../common/ThemeSwitcher.jsx";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@redux/slices/authSlice.js";
import { useCallback, useEffect, useState, useRef } from "react";
import {
  buildOwnerBookingNotifications,
  OWNER_NOTIFICATIONS_EVENT,
  getUnreadOwnerNotificationCount,
  writeOwnerNotifications,
} from "@utils/notificationData";
import axiosInstance from "@hooks/useAxiosInstance";
import { connectSocket } from "../../hooks/useSocket.js";

const AuthenticatedNavbar = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state?.auth?.role);
  const path = role === "admin" ? "/admin" : "/owner";
  const [unreadCount, setUnreadCount] = useState(
    getUnreadOwnerNotificationCount,
  );
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const socketRef = useRef(null);

  // ── fetch initial unread message count from REST ──────────────────
  const fetchUnreadMessages = useCallback(async () => {
    try {
      const endpoint =
        role === "admin"
          ? "/api/admin/messages?box=inbox&page=1&limit=50"
          : "/api/owner/messages?box=inbox&page=1&limit=50";
      const response = await axiosInstance.get(endpoint);
      if (
        response.data?.success &&
        Array.isArray(response.data.conversations)
      ) {
        const totalUnread = response.data.conversations.reduce(
          (sum, c) => sum + (Number(c?.unreadCount) || 0),
          0,
        );
        setUnreadMessageCount(totalUnread);
      }
    } catch (error) {
      console.error("Failed to fetch unread message count", error);
    }
  }, [role]);

  // ── notification + initial message count sync ────────────────────
  useEffect(() => {
    const syncCount = () => setUnreadCount(getUnreadOwnerNotificationCount());
    window.addEventListener(OWNER_NOTIFICATIONS_EVENT, syncCount);
    window.addEventListener("storage", syncCount);

    const fetchNotificationCount = async () => {
      if (role !== "owner") return;
      try {
        const response = await axiosInstance.get("/api/owner/bookings");
        writeOwnerNotifications(buildOwnerBookingNotifications(response.data));
        syncCount();
      } catch (error) {
        console.error("Failed to sync owner notification count", error);
      }
    };

    fetchNotificationCount();
    fetchUnreadMessages();

    return () => {
      window.removeEventListener(OWNER_NOTIFICATIONS_EVENT, syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, [fetchUnreadMessages, role]);

  // ── socket: real-time unread badge (replaces 20-second polling) ──
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;
    if (!socket) return;

    // Any new message in any conversation → re-fetch total unread
    const handleNewMessage = () => {
      fetchUnreadMessages();
    };

    // Direct unread-count push from server
    const handleUnreadUpdate = ({ unreadCount: delta }) => {
      setUnreadMessageCount((prev) => Math.max(0, prev + (delta || 1)));
    };

    // New conversation started with this owner/admin
    const handleNewConversation = () => {
      fetchUnreadMessages();
    };

    socket.on("new_message", handleNewMessage);
    socket.on("unread_update", handleUnreadUpdate);
    socket.on("new_conversation", handleNewConversation);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("unread_update", handleUnreadUpdate);
      socket.off("new_conversation", handleNewConversation);
    };
  }, [fetchUnreadMessages, role]);

  const handleLogout = () => {
    // Disconnect socket cleanly on logout
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    dispatch(logout());
    navigate("/", { replace: true });
  };

  return (
    <div className="navbar bg-base-100 fixed top-0 z-50 shadow-md">
      <div className="navbar-start">
        <button className="btn btn-ghost lg:hidden" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <Link
          to={path}
          className="btn btn-ghost normal-case text-xl max-sm:p-0"
        >
          <img
            src="/logo1.png"
            alt="PlayRizon"
            className="h-10 w-10 mask mask-squircle"
          />
          PlayRizon
        </Link>
      </div>

      <div className="navbar-end">
        {role === "owner" ? (
          <>
            {/* Notification bell */}
            <Link
              to="/owner/notifications"
              className="btn btn-ghost btn-circle relative"
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-content">
                  {unreadCount}
                </span>
              ) : null}
            </Link>

            {/* Live messages badge */}
            <Link
              to="/owner/messages"
              className="btn btn-ghost btn-circle relative ml-2"
              title="Messages"
            >
              <MessageCircle size={18} />
              {unreadMessageCount > 0 ? (
                <span className="PlayRizon-blink absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-error-content">
                  {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                </span>
              ) : null}
            </Link>
          </>
        ) : (
          /* Admin — messages only */
          <Link
            to="/admin/messages"
            className="btn btn-ghost btn-circle relative"
            title="Messages"
          >
            <MessageCircle size={18} />
            {unreadMessageCount > 0 ? (
              <span className="PlayRizon-blink absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-error-content">
                {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
              </span>
            ) : null}
          </Link>
        )}

        <ThemeSwitcher />

        <button className="btn btn-primary btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AuthenticatedNavbar;
