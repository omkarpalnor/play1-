import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  MapPin,
  Star,
  Calendar,
  PlusCircle,
  UserCircle,
  Tag,
  Bell,
  Info,
  MessageCircle,
  LifeBuoy,
  BarChart3,
  Trophy,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  OWNER_NOTIFICATIONS_EVENT,
  getUnreadOwnerNotificationCount,
} from "@utils/notificationData";
import { connectSocket } from "../../hooks/useSocket.js";
import axiosInstance from "@hooks/useAxiosInstance";

const OwnerSidebar = ({
  toggleSidebar,
  toggleCollapse,
  isCollapsed = false,
  className,
}) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(
    getUnreadOwnerNotificationCount,
  );
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // ── notification badge ────────────────────────────────────────────
  useEffect(() => {
    const syncCount = () => setUnreadCount(getUnreadOwnerNotificationCount());
    window.addEventListener(OWNER_NOTIFICATIONS_EVENT, syncCount);
    window.addEventListener("storage", syncCount);
    return () => {
      window.removeEventListener(OWNER_NOTIFICATIONS_EVENT, syncCount);
      window.removeEventListener("storage", syncCount);
    };
  }, []);

  // ── fetch initial unread message count ────────────────────────────
  const fetchUnreadMessages = async () => {
    try {
      const response = await axiosInstance.get(
        "/api/owner/messages?box=inbox&page=1&limit=50",
      );
      if (
        response.data?.success &&
        Array.isArray(response.data.conversations)
      ) {
        const total = response.data.conversations.reduce(
          (sum, c) => sum + (Number(c?.unreadCount) || 0),
          0,
        );
        setUnreadMessageCount(total);
      }
    } catch {
      // silently fail — badge is cosmetic
    }
  };

  useEffect(() => {
    fetchUnreadMessages();
  }, []);

  // ── socket: real-time unread message badge ────────────────────────
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const handleNewMessage = () => fetchUnreadMessages();
    const handleNewConversation = () => fetchUnreadMessages();
    const handleUnreadUpdate = ({ unreadCount: delta }) => {
      setUnreadMessageCount((prev) => Math.max(0, prev + (delta || 1)));
    };

    socket.on("new_message", handleNewMessage);
    socket.on("new_conversation", handleNewConversation);
    socket.on("unread_update", handleUnreadUpdate);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("new_conversation", handleNewConversation);
      socket.off("unread_update", handleUnreadUpdate);
    };
  }, []);

  const navItems = [
    { to: "/owner", label: "Dashboard", icon: Home },
    { to: "/owner/turfs", label: "My Turfs", icon: MapPin },
    { to: "/owner/add-turf", label: "Add Turf", icon: PlusCircle },
    { to: "/owner/reviews", label: "Reviews", icon: Star },
    { to: "/owner/bookings", label: "Bookings", icon: Calendar },
    {
  to: "/owner/tournaments",
  label: "Tournaments",
  icon: Trophy,
},
    { to: "/owner/reports", label: "Reports", icon: BarChart3 },
    { to: "/owner/coupons", label: "Coupons", icon: Tag },
    {
      to: "/owner/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadCount,
    },
    {
      to: "/owner/messages",
      label: "Messages",
      icon: MessageCircle,
      badge: unreadMessageCount,
      badgeColor: "badge-error",
    },
    { to: "/owner/contact", label: "Contact Support", icon: LifeBuoy },
    { to: "/owner/about", label: "About PlayRizon", icon: Info },
    { to: "/owner/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <aside
      className={`${className} bg-base-200 overflow-y-auto fixed lg:sticky lg:top-16
    ${isCollapsed ? "w-20" : "w-64"} transition-all duration-300 ease-in-out z-30 lg:z-0 min-h-[calc(100vh-4rem)]`}
    >
      <div
        className={`flex items-center border-b p-4 ${
          isCollapsed ? "justify-center lg:justify-between" : "justify-between"
        }`}
      >
        <span className={`text-xl font-semibold ${isCollapsed ? "hidden lg:hidden" : ""}`}>
          PlayRizon Owner
        </span>
        <button
          type="button"
          onClick={toggleCollapse}
          className="btn btn-ghost btn-sm hidden lg:inline-flex"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <button onClick={toggleSidebar} className="lg:hidden">
          <X size={24} />
        </button>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            title={isCollapsed ? item.label : undefined}
            className={`relative flex items-center px-4 py-2 text-sm ${
              location.pathname === item.to
                ? "bg-primary text-primary-content"
                : "hover:bg-base-300"
            } ${isCollapsed ? "justify-center lg:px-0" : ""}`}
            onClick={() => {
              if (window.innerWidth < 1024) {
                toggleSidebar();
              }
              // Clear message badge when navigating to messages
              if (item.to === "/owner/messages") {
                setUnreadMessageCount(0);
              }
            }}
          >
            <item.icon size={18} className={`${isCollapsed ? "" : "mr-2"} shrink-0`} />
            <span className={`flex-1 ${isCollapsed ? "hidden" : ""}`}>{item.label}</span>
            {item.badge > 0 ? (
              <span
                className={`badge badge-sm ${isCollapsed ? "absolute right-3 top-1.5" : "ml-auto"} ${item.badgeColor || "badge-primary"}`}
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default OwnerSidebar;
