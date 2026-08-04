import { Link, NavLink, useNavigate } from "react-router-dom";
import ThemeSwitcher from "../common/ThemeSwitcher.jsx";
import { logout } from "../../redux/slices/authSlice.js";
import { useDispatch } from "react-redux";
import { Bell, MessageCircle } from "lucide-react";
import {
  USER_NOTIFICATIONS_EVENT,
  getUnreadUserNotificationCount,
} from "../../utils/notificationData";
import { useEffect, useState, useRef } from "react";
import { syncUserNotifications } from "../../utils/userNotificationService";
import axiosInstance from "../../hooks/useAxiosInstance.js";
import { connectSocket } from "../../hooks/useSocket.js";

export default function AuthNavbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(
    getUnreadUserNotificationCount,
  );
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const socketRef = useRef(null);

  // ── fetch initial unread message count from REST ─────────────────
  const fetchUnreadMessages = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/user/messages?box=inbox&page=1&limit=50",
      );
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
  };

  // ── notification count sync ───────────────────────────────────────
  useEffect(() => {
    const syncCount = () => setUnreadCount(getUnreadUserNotificationCount());
    window.addEventListener(USER_NOTIFICATIONS_EVENT, syncCount);
    window.addEventListener("storage", syncCount);

    const init = async () => {
      try {
        await syncUserNotifications();
        syncCount();
        await fetchUnreadMessages();
      } catch (error) {
        console.error("Failed to sync notifications", error);
      }
    };
    init();

    return () => {
      window.removeEventListener(USER_NOTIFICATIONS_EVENT, syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  // ── socket: real-time unread badge ───────────────────────────────
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;
    if (!socket) return;

    // When we receive a new message in ANY conversation, re-fetch counts
    const handleNewMessage = () => {
      fetchUnreadMessages();
    };

    // When server pushes an unread_update, update badge directly
    const handleUnreadUpdate = ({ unreadCount: delta }) => {
      setUnreadMessageCount((prev) => Math.max(0, prev + (delta || 1)));
    };

    // When a brand new conversation is started with us
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
  }, []);

  const handleLogout = () => {
    // Disconnect socket on logout
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
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/auth">Home</Link>
            </li>
            <li>
              <Link to="/auth/turfs">turf</Link>
            </li>
              <li>
    <Link to="/tournaments">Tournaments</Link>
  </li>
            <li>
              <Link to="/auth/about">About Us</Link>
            </li>
            <li>
              <Link to="/auth/contact">Contact Us</Link>
            </li>
            <li>
              <Link to="/auth/booking-history">My Bookings</Link>
            </li>
            <li>
              <Link to="/auth/notifications">
                Notifications
                {unreadCount > 0 ? (
                  <span className="badge badge-primary badge-sm ml-2">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>
            </li>
            <li>
              <Link to="/auth/profile">Profile</Link>
            </li>
            <li>
              <Link to="/auth/messages" className="flex items-center gap-2">
                <MessageCircle size={18} />
                Messages
                {unreadMessageCount > 0 ? (
                  <span className="badge badge-error badge-sm ml-1">
                    {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                  </span>
                ) : null}
              </Link>
            </li>
            <li>
              <NavLink
                to="/auth/become-owner"
                className={({ isActive }) => (isActive ? "text-accent" : "")}
              >
                Become an Owner
              </NavLink>
            </li>
          </ul>
        </div>
        <Link to="/auth" className="btn btn-ghost normal-case text-xl">
          <img
            src="/logo1.png"
            alt="PlayRizon"
            className="h-10 w-10 mask mask-squircle"
          />
          PlayRizon
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/auth">Home</Link>
          </li>
          <li>
            <Link to="/auth/turfs">Arena</Link>
          </li>
            <li>
    <Link to="/tournaments">Tournaments</Link>
  </li>
          {/* <li>
            <Link to="/auth/about">About Us</Link>
          </li> */}
        
          <li>
            <Link to="/auth/matchmaking">Find Teams</Link>
          </li>
          <li>
            <Link to="/auth/contact">Contact Us</Link>
          </li>
          <li>
            <Link to="/auth/booking-history">My Bookings</Link>
          </li>
          <li>
            <Link to="/auth/notifications" className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 ? (
                <span className="badge badge-primary badge-sm">
                  {unreadCount}
                </span>
              ) : null}
            </Link>
          </li>
          <li>
            <Link to="/auth/profile">Profile</Link>
          </li>
          <li>
            <NavLink
              to="/auth/become-owner"
              className={({ isActive }) => (isActive ? "text-accent" : "")}
            >
              Become an Owner
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="navbar-end">
        {/* Live messages badge */}
        <Link
          to="/auth/messages"
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

        {/* Notifications badge */}
        <Link
          to="/auth/notifications"
          className="btn btn-ghost btn-circle relative"
        >
          <Bell size={18} />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-content">
              {unreadCount}
            </span>
          ) : null}
        </Link>

        <ThemeSwitcher />
        <button className="btn btn-ghost" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
