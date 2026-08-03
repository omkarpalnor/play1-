import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BellRing,
  CalendarRange,
  CheckCheck,
  LineChart,
  MessageSquareText,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import {
  buildOwnerBookingNotifications,
  readOwnerNotifications,
  writeOwnerNotifications,
} from "@utils/notificationData";
import axiosInstance from "@hooks/useAxiosInstance";

const filterTabs = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "booking", label: "Booking" },
  { id: "offer", label: "Offers" },
];

const typeConfig = {
  booking: {
    icon: CalendarRange,
    pill: "bg-success/10 text-success",
    glow: "from-emerald-500 to-cyan-500",
  },
  offer: {
    icon: TicketPercent,
    pill: "bg-warning/10 text-warning",
    glow: "from-amber-400 to-orange-500",
  },
  review: {
    icon: MessageSquareText,
    pill: "bg-secondary/10 text-secondary",
    glow: "from-violet-500 to-fuchsia-500",
  },
  operations: {
    icon: LineChart,
    pill: "bg-info/10 text-info",
    glow: "from-sky-500 to-indigo-500",
  },
};

const OwnerNotifications = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [notifications, setNotifications] = useState(readOwnerNotifications);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get("/api/owner/bookings");
        const nextNotifications = buildOwnerBookingNotifications(response.data);
        setNotifications(nextNotifications);
        writeOwnerNotifications(nextNotifications);
      } catch (error) {
        console.error("Failed to fetch owner notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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
      writeOwnerNotifications(next);
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
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-base-300 bg-base-100 shadow-xl">
        <div className="grid gap-6 px-6 py-8 xl:grid-cols-[1.45fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-info/30 bg-info/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-info">
              <BellRing size={14} />
              Owner Notifications
            </div>
            <h1 className="mt-4 text-3xl font-bold md:text-4xl">
              Monitor bookings, offers, and venue activity
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-base-content/70">
              Keep your turf operation responsive with booking alerts, cancellation
              warnings, coupon performance notes, and customer review signals.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={markAllRead}>
                <CheckCheck size={18} />
                Mark all as read
              </button>
              <Link to="/owner/coupons" className="btn btn-outline">
                Manage offers
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] bg-gradient-to-br from-slate-900 via-cyan-700 to-emerald-500 p-5 text-white shadow-lg">
              <p className="text-sm text-white/75">Unread alerts</p>
              <p className="mt-2 text-4xl font-bold">{summary.unread}</p>
              <p className="mt-3 text-sm text-white/80">
                Recent actions that may affect occupancy and revenue.
              </p>
            </div>
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
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.78fr_1.7fr]">
        <div className="rounded-[28px] border border-base-300 bg-base-100 p-5 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-500 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Control center</h2>
              <p className="text-sm text-base-content/60">
                Filter the alerts that matter most to your team.
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
              <p className="text-sm font-medium text-base-content/70">Total alerts</p>
              <p className="mt-1 text-2xl font-bold">{summary.total}</p>
            </div>
            <div className="rounded-2xl bg-base-200 p-4">
              <p className="text-sm font-medium text-base-content/70">
                Unread actions
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
                Syncing booking alerts with the real booking schedule.
              </p>
            </div>
          ) : null}

          {!loading && filteredNotifications.map((item) => {
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
              <p className="text-lg font-semibold">No alerts in this filter</p>
              <p className="mt-2 text-sm text-base-content/60">
                Try another view to review booking activity, promotions, and review updates.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default OwnerNotifications;
