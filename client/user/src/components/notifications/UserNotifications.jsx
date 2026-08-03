import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BellRing,
  CalendarClock,
  CheckCheck,
  Gift,
  Megaphone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  USER_NOTIFICATIONS_EVENT,
  readUserNotifications,
  writeUserNotifications,
} from "../../utils/notificationData";
import { syncUserNotifications } from "../../utils/userNotificationService";

const filterTabs = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "booking", label: "Booking" },
  { id: "account", label: "Match & Account" },
  { id: "offer", label: "Offers" },
];

const typeConfig = {
  booking: {
    icon: CalendarClock,
    pill: "bg-success/10 text-success",
    glow: "from-emerald-500 to-cyan-500",
  },
  offer: {
    icon: Megaphone,
    pill: "bg-warning/10 text-warning",
    glow: "from-amber-400 to-orange-500",
  },
  rewards: {
    icon: Gift,
    pill: "bg-secondary/10 text-secondary",
    glow: "from-fuchsia-500 to-pink-500",
  },
  account: {
    icon: ShieldCheck,
    pill: "bg-info/10 text-info",
    glow: "from-sky-500 to-indigo-500",
  },
};

// Simple JWT parser
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const UserNotifications = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [notifications, setNotifications] = useState(readUserNotifications);
  const [loading, setLoading] = useState(false);

  const authState = useSelector((state) => state.auth || {});

  // Extract ID safely from Redux, Redux Persist (localStorage), or JWT token
  const getUserId = () => {
    // 1. Direct Redux
    if (authState.user?._id || authState.user?.id) {
      return authState.user?._id || authState.user?.id;
    }

    // 2. Redux Persist in localStorage (`persist:user`)
    try {
      const persistUser = localStorage.getItem("persist:user");
      if (persistUser) {
        const parsedPersist = JSON.parse(persistUser);
        if (parsedPersist.auth) {
          const parsedAuth = JSON.parse(parsedPersist.auth);
          if (parsedAuth.user?._id || parsedAuth.user?.id) {
            return parsedAuth.user._id || parsedAuth.user.id;
          }
          if (parsedAuth.token) {
            const decoded = parseJwt(parsedAuth.token);
            if (decoded?.id || decoded?.user || decoded?._id) {
              return decoded.id || decoded.user || decoded._id;
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to parse persist:user from localStorage", e);
    }

    // 3. Fallback direct localStorage keys
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        return parsed?._id || parsed?.id;
      }
    } catch (e) {}

    return localStorage.getItem("userId") || "";
  };

  const currentUserId = getUserId();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const nextNotifications = await syncUserNotifications(currentUserId);
        setNotifications(nextNotifications);
      } catch (error) {
        console.error("Failed to fetch user notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const syncFromStorage = () => {
      setNotifications(readUserNotifications());
    };

    window.addEventListener(USER_NOTIFICATIONS_EVENT, syncFromStorage);
    window.addEventListener("storage", syncFromStorage);

    return () => {
      window.removeEventListener(USER_NOTIFICATIONS_EVENT, syncFromStorage);
      window.removeEventListener("storage", syncFromStorage);
    };
  }, [currentUserId]);

  const summary = useMemo(() => {
    const unread = notifications.filter((item) => item.status === "unread").length;
    const booking = notifications.filter((item) => item.type === "booking").length;
    const offers = notifications.filter((item) => item.type === "offer").length;

    return { unread, booking, offers, total: notifications.length };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    if (activeFilter === "unread") {
      return notifications.filter((item) => item.status === "unread");
    }

    return notifications.filter((item) => item.type === activeFilter);
  }, [activeFilter, notifications]);

  const updateNotifications = (updater) => {
    setNotifications((current) => {
      const next =
        typeof updater === "function" ? updater(current) : updater;
      writeUserNotifications(next);
      return next;
    });
  };

  const markAllRead = () => {
    updateNotifications((current) =>
      current.map((item) => ({ ...item, status: "read" }))
    );
  };

  const markOneRead = (id) => {
    updateNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "read" } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-base-300 bg-base-100 shadow-xl">
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.4fr_0.9fr] lg:px-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-success">
                <BellRing size={14} />
                Notification Center
              </div>
              <h1 className="mt-4 text-3xl font-bold md:text-4xl">
                Booking updates and offers in one place
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-base-content/70">
                Stay on top of booking confirmations, team match alerts, loyalty updates, refunds,
                and fresh promotions without leaving the app.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="btn btn-primary" onClick={markAllRead}>
                  <CheckCheck size={18} />
                  Mark all as read
                </button>
                <Link to="/auth/turfs" className="btn btn-outline">
                  Explore offers
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[24px] bg-gradient-to-br from-emerald-500 to-cyan-500 p-5 text-white shadow-lg">
                <p className="text-sm text-white/75">Unread now</p>
                <p className="mt-2 text-4xl font-bold">{summary.unread}</p>
                <p className="mt-3 text-sm text-white/80">
                  Important booking actions and live reminders.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                <div className="rounded-[24px] border border-base-300 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm text-base-content/60">Booking alerts</p>
                  <p className="mt-2 text-3xl font-bold">{summary.booking}</p>
                </div>
                <div className="rounded-[24px] border border-base-300 bg-base-100 p-5 shadow-sm">
                  <p className="text-sm text-base-content/60">Offer alerts</p>
                  <p className="mt-2 text-3xl font-bold">{summary.offers}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.6fr]">
          <div className="rounded-[28px] border border-base-300 bg-base-100 p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Quick filters</h2>
                <p className="text-sm text-base-content/60">
                  Focus on what needs attention first.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeFilter === tab.id
                      ? "bg-primary text-primary-content shadow-md"
                      : "bg-base-200 text-base-content/75 hover:bg-base-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-base-200 p-4">
                <p className="text-sm font-medium text-base-content/70">
                  Total notifications
                </p>
                <p className="mt-1 text-2xl font-bold">{summary.total}</p>
              </div>
              <div className="rounded-2xl bg-base-200 p-4">
                <p className="text-sm font-medium text-base-content/70">
                  Needs attention
                </p>
                <p className="mt-1 text-2xl font-bold">{summary.unread}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-[28px] border border-base-300 bg-base-100 p-10 text-center shadow-sm">
                <p className="text-lg font-semibold">Loading notifications...</p>
                <p className="mt-2 text-sm text-base-content/60">
                  Syncing your latest booking and matchmaking alerts.
                </p>
              </div>
            ) : null}

            {!loading &&
              filteredNotifications.map((item) => {
                const config = typeConfig[item.type] || typeConfig.booking;
                const Icon = config.icon;

                return (
                  <article
                    key={item.id}
                    className="rounded-[28px] border border-base-300 bg-base-100 p-5 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${config.glow} text-white shadow-lg`}
                        >
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${config.pill}`}
                            >
                              {item.type}
                            </span>
                            {item.status === "unread" ? (
                              <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                                New
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-7 text-base-content/70">
                            {item.message}
                          </p>
                          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-base-content/45">
                            {item.timestamp}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Link to={item.actionTo} className="btn btn-sm btn-primary">
                          {item.actionLabel}
                        </Link>
                        {item.status === "unread" ? (
                          <button
                            type="button"
                            onClick={() => markOneRead(item.id)}
                            className="btn btn-sm btn-ghost"
                          >
                            Mark as read
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}

            {!loading && filteredNotifications.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-base-300 bg-base-100 p-10 text-center shadow-sm">
                <p className="text-lg font-semibold">No notifications in this view</p>
                <p className="mt-2 text-sm text-base-content/60">
                  Try another filter to review booking alerts and offer updates.
                </p>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default UserNotifications;