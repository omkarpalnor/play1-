import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import useOwnerBookings from "@hooks/owner/useOwnerBookings";
import BookingsSkeleton from "./BookingsSkeleton";
import { downloadCsvReport, printPdfReport } from "../../../utils/reportExport";
import axiosInstance from "@hooks/useAxiosInstance";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CHART_COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#8b5cf6", "#ef4444"];

const formatRefundLabel = (refund) => {
  if (!refund || refund.type === "none" || refund.status === "not_applicable") {
    return "No refund";
  }

  const amount = Number(refund.amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix =
    refund.type === "full" ? "Full" : `${refund.percent || 0}%`;

  if (refund.status === "processed") {
    return `${prefix} processed (${amount})`;
  }

  if (refund.status === "pending") {
    return `${prefix} initiated (${amount})`;
  }

  if (refund.status === "failed") {
    return `${prefix} failed (${amount})`;
  }

  return `${prefix} (${amount})`;
};

const formatRescheduleSettlementLabel = (reschedule) => {
  const settlement = reschedule?.settlement;

  if (!settlement || reschedule?.status === "none") {
    return null;
  }

  const amount = Number(settlement.amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (settlement.kind === "payment") {
    if (settlement.status === "payment_completed") {
      return `Additional payment completed (${amount})`;
    }

    if (settlement.status === "awaiting_payment") {
      return `Additional payment pending (${amount})`;
    }

    return `Additional payment if approved (${amount})`;
  }

  if (settlement.kind === "refund") {
    if (settlement.status === "refund_processed") {
      return `Refund processed (${amount})`;
    }

    if (settlement.status === "refund_pending") {
      return `Refund initiated (${amount})`;
    }

    if (settlement.status === "refund_failed") {
      return `Refund failed (${amount})`;
    }

    return `Refund due if approved (${amount})`;
  }

  return "No price difference";
};

const OwnerBookings = () => {
  const {
    bookings,
    loading,
    error,
    filterDays,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    statusFilter,
    setStatusFilter,
    bookingStats,
    resetFilters,
    sortConfig,
    requestSort,
    fetchBookings,
  } = useOwnerBookings();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [exporting, setExporting] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("month");
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);
  const [emailDigestCadence, setEmailDigestCadence] = useState("monthly");
  const [emailSending, setEmailSending] = useState(false);
  const [digestSaving, setDigestSaving] = useState(false);
  const [reviewingBookingId, setReviewingBookingId] = useState(null);
  const [draftStatus, setDraftStatus] = useState(statusFilter);
  const [draftStartDate, setDraftStartDate] = useState(customStartDate);
  const [draftEndDate, setDraftEndDate] = useState(customEndDate);

  const reportHeaders = useMemo(
    () => [
      { key: "turf", label: "Turf" },
      { key: "user", label: "User" },
      { key: "date", label: "Date" },
      { key: "startTime", label: "Start Time" },
      { key: "endTime", label: "End Time" },
      { key: "duration", label: "Duration (hrs)" },
      { key: "status", label: "Status" },
      { key: "price", label: "Price (INR)" },
    ],
    []
  );

  const reportSummary = useMemo(
    () => [
      { label: "Total", value: bookingStats.total },
      { label: "Confirmed", value: bookingStats.confirmed },
      { label: "Cancelled", value: bookingStats.cancelled },
      { label: "Revenue", value: `INR ${bookingStats.revenue}` },
    ],
    [bookingStats.cancelled, bookingStats.confirmed, bookingStats.revenue, bookingStats.total]
  );

  const formatTime = (dateString) => format(new Date(dateString), "h:mm aa");
  const formatCurrency = (value) => `INR ${Number(value || 0).toLocaleString("en-IN")}`;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const turf = String(b?.turfName || "").toLowerCase();
      const user = String(b?.userName || "").toLowerCase();
      const status = String(b?.status || "").toLowerCase();
      return turf.includes(q) || user.includes(q) || status.includes(q);
    });
  }, [bookings, search]);

  useEffect(() => {
    setPage(1);
  }, [search, filterDays, customStartDate, customEndDate, statusFilter, pageSize]);

  useEffect(() => {
    setDraftStatus(statusFilter);
    setDraftStartDate(customStartDate);
    setDraftEndDate(customEndDate);
  }, [statusFilter, customStartDate, customEndDate]);

  const persistDigestPreferences = useCallback(async (nextEnabled, nextCadence) => {
    try {
      setDigestSaving(true);
      const response = await axiosInstance.patch("/api/owner/bookings/report/preferences", {
        enabled: nextEnabled,
        cadence: nextCadence,
      });
      const prefs = response.data?.preferences;
      setEmailDigestEnabled(Boolean(prefs?.enabled));
      setEmailDigestCadence(prefs?.cadence || "monthly");
      toast.success(response.data?.message || "Digest preferences updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update digest preferences");
    } finally {
      setDigestSaving(false);
    }
  }, []);

  const pagination = useMemo(() => {
    const total = filteredRows.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, pages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return { total, pages, page: safePage, start, end };
  }, [filteredRows.length, page, pageSize]);

  const pagedBookings = filteredRows.slice(pagination.start, pagination.end);

  const buildOwnerReportParams = () => {
    if (customStartDate || customEndDate) {
      return {
        startDate: customStartDate || undefined,
        endDate: customEndDate || undefined,
        status: statusFilter || "all",
      };
    }

    const start = new Date();
    start.setDate(start.getDate() - filterDays);

    return {
      startDate: start.toISOString(),
      endDate: new Date().toISOString(),
      status: statusFilter || "all",
    };
  };

  const fetchOwnerReport = async () => {
    const response = await axiosInstance.get("/api/owner/bookings/report", {
      params: buildOwnerReportParams(),
    });
    return response.data;
  };

  const mapOwnerReportRows = useCallback(
    (records) =>
      (records || []).map((booking) => ({
        turf: booking.turfName,
        user: booking.userName,
        date: format(new Date(booking.bookingDate), "dd MMM yyyy"),
        startTime: formatTime(booking.startTime),
        endTime: formatTime(booking.endTime),
        duration: booking.duration.toFixed(2),
        status: booking.status,
        price: booking.totalPrice,
      })),
    []
  );

  const handleDownloadCsv = async () => {
    try {
      setExporting(true);
      const report = await fetchOwnerReport();
      downloadCsvReport({
        fileName: `owner-booking-report-${Date.now()}.csv`,
        headers: reportHeaders,
        rows: mapOwnerReportRows(report.bookings),
      });
    } catch (error) {
      console.error("CSV download failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPdf = async () => {
    try {
      setExporting(true);
      const report = await fetchOwnerReport();
      printPdfReport({
        title: "Owner Booking Report",
        subtitle: `Generated on ${new Date().toLocaleString()}`,
        headers: reportHeaders,
        rows: mapOwnerReportRows(report.bookings),
        summary: reportSummary,
      });
    } catch (error) {
      console.error("PDF generation failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleDisplayReport = () => {
    setStatusFilter(draftStatus || "all");
    if (reportPeriod === "week") {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 7);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = now.toISOString().slice(0, 10);
      setCustomStartDate(startStr);
      setCustomEndDate(endStr);
      setDraftStartDate(startStr);
      setDraftEndDate(endStr);
      return;
    }
    if (reportPeriod === "month") {
      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 30);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = now.toISOString().slice(0, 10);
      setCustomStartDate(startStr);
      setCustomEndDate(endStr);
      setDraftStartDate(startStr);
      setDraftEndDate(endStr);
      return;
    }
    setCustomStartDate(draftStartDate || "");
    setCustomEndDate(draftEndDate || "");
  };

  const getCurrentRange = useCallback(() => {
    const now = new Date();
    const end = draftEndDate ? new Date(draftEndDate) : now;
    const start = draftStartDate
      ? new Date(draftStartDate)
      : reportPeriod === "week"
        ? new Date(new Date(end).setDate(end.getDate() - 7))
        : new Date(new Date(end).setDate(end.getDate() - 30));
    return { start, end };
  }, [draftEndDate, draftStartDate, reportPeriod]);

  const getPreviousRange = useCallback(() => {
    const { start, end } = getCurrentRange();
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    return { start: prevStart, end: prevEnd };
  }, [getCurrentRange]);

  const summarizeBookings = (rows) =>
    rows.reduce(
      (acc, b) => {
        const status = b.status || "confirmed";
        acc.total += 1;
        if (status === "cancelled") acc.cancelled += 1;
        else acc.confirmed += 1;
        acc.revenue += status === "cancelled" ? 0 : Number(b.totalPrice || 0);
        return acc;
      },
      { total: 0, confirmed: 0, cancelled: 0, revenue: 0 }
    );

  const compareSummary = useMemo(() => {
    const { start, end } = getCurrentRange();
    const prev = getPreviousRange();
    const inRange = (b, s, e) => {
      const d = new Date(b.bookingDate);
      return d >= s && d <= e;
    };
    const currentRows = bookings.filter((b) => inRange(b, start, end));
    const previousRows = bookings.filter((b) => inRange(b, prev.start, prev.end));
    const current = summarizeBookings(currentRows);
    const previous = summarizeBookings(previousRows);
    const pct = (cur, old) => (old ? (((cur - old) / old) * 100).toFixed(1) : cur > 0 ? "100.0" : "0.0");
    return {
      totalPct: pct(current.total, previous.total),
      revenuePct: pct(current.revenue, previous.revenue),
      cancelledPct: pct(current.cancelled, previous.cancelled),
    };
  }, [bookings, getCurrentRange, getPreviousRange]);

  const trendData = useMemo(() => {
    const map = new Map();
    filteredRows.forEach((b) => {
      const key = new Date(b.bookingDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      if (!map.has(key)) map.set(key, { label: key, bookings: 0, revenue: 0 });
      const row = map.get(key);
      row.bookings += 1;
      if ((b.status || "confirmed") !== "cancelled") row.revenue += Number(b.totalPrice || 0);
    });
    return Array.from(map.values()).slice(-14);
  }, [filteredRows]);

  const advancedAnalytics = useMemo(() => {
    const total = filteredRows.length;
    const confirmedRows = filteredRows.filter((booking) => (booking.status || "confirmed") !== "cancelled");
    const cancelledRows = filteredRows.filter((booking) => (booking.status || "confirmed") === "cancelled");
    const totalRevenue = confirmedRows.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
    const cancelledValue = cancelledRows.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
    const averageBookingValue = confirmedRows.length ? totalRevenue / confirmedRows.length : 0;
    const averageDuration = filteredRows.length
      ? filteredRows.reduce((sum, booking) => sum + Number(booking.duration || 0), 0) / filteredRows.length
      : 0;
    const confirmationRate = total ? (confirmedRows.length / total) * 100 : 0;
    const cancellationRate = total ? (cancelledRows.length / total) * 100 : 0;

    const turfMap = new Map();
    const weekdayMap = new Map();
    const statusMap = new Map();

    filteredRows.forEach((booking) => {
      const turfKey = booking.turfName || "Unknown turf";
      const weekday = format(new Date(booking.bookingDate), "EEE");
      const status = booking.status || "confirmed";
      const revenue = status === "cancelled" ? 0 : Number(booking.totalPrice || 0);

      if (!turfMap.has(turfKey)) {
        turfMap.set(turfKey, {
          name: turfKey,
          bookings: 0,
          revenue: 0,
          cancellations: 0,
        });
      }

      const turfEntry = turfMap.get(turfKey);
      turfEntry.bookings += 1;
      turfEntry.revenue += revenue;
      if (status === "cancelled") {
        turfEntry.cancellations += 1;
      }

      weekdayMap.set(weekday, (weekdayMap.get(weekday) || 0) + 1);
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const turfPerformance = Array.from(turfMap.values()).sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings);
    const topTurf = turfPerformance[0] || null;

    const weekdayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekdayData = weekdayOrder.map((day) => ({
      day,
      bookings: weekdayMap.get(day) || 0,
    }));
    const busiestDay = weekdayData.reduce((best, current) => (current.bookings > best.bookings ? current : best), {
      day: "-",
      bookings: 0,
    });

    const statusDistribution = Array.from(statusMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    return {
      averageBookingValue,
      averageDuration,
      confirmationRate,
      cancellationRate,
      cancelledValue,
      topTurf,
      turfPerformance: turfPerformance.slice(0, 5),
      weekdayData,
      busiestDay,
      statusDistribution,
    };
  }, [filteredRows]);

  const sendMonthlyDigest = async () => {
    try {
      setEmailSending(true);
      await axiosInstance.post("/api/owner/bookings/report/email", {
        cadence: emailDigestCadence,
        status: "all",
      });
      toast.success("Monthly email digest sent");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send digest");
    } finally {
      setEmailSending(false);
    }
  };

  const handleRescheduleDecision = async (bookingId, decision) => {
    try {
      setReviewingBookingId(bookingId);
      const response = await axiosInstance.patch(
        `/api/owner/bookings/${bookingId}/reschedule-decision`,
        {
          decision,
          ownerNotes:
            decision === "rejected"
              ? "Requested slot was not approved by owner."
              : "Requested slot approved.",
        }
      );
      toast.success(response.data?.message || "Reschedule decision updated");
      await fetchBookings();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to review reschedule request"
      );
    } finally {
      setReviewingBookingId(null);
    }
  };

  useEffect(() => {
    const loadDigestPreferences = async () => {
      try {
        const response = await axiosInstance.get("/api/owner/bookings/report/preferences");
        const prefs = response.data?.preferences;
        setEmailDigestEnabled(Boolean(prefs?.enabled));
        setEmailDigestCadence(prefs?.cadence || "monthly");
      } catch (error) {
        console.error("Failed to load owner digest preferences", error);
      }
    };

    loadDigestPreferences();
  }, []);

  if (loading) {
    return <BookingsSkeleton />;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="modern-shell">
      <div className="modern-container">
      <div className="modern-hero">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="modern-hero-title">Bookings Report</h1>
          <p className="modern-hero-copy">
            Filter bookings, review performance, and export CSV/PDF reports.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handlePrintPdf} className="btn btn-primary" disabled={exporting}>
            {exporting ? "Working..." : "PDF"}
          </button>
          <button onClick={handleDownloadCsv} className="btn btn-outline" disabled={exporting}>
            {exporting ? "Working..." : "CSV"}
          </button>
        </div>
      </div>

      <div className="modern-stat-grid">
        {[
          { label: "Total", value: bookingStats.total },
          { label: "Confirmed", value: bookingStats.confirmed },
          { label: "Cancelled", value: bookingStats.cancelled },
          { label: "Revenue", value: `₹${Number(bookingStats.revenue || 0).toLocaleString("en-IN")}` },
        ].map((item) => (
          <div key={item.label} className="modern-stat-card">
            <div className="modern-stat-label">{item.label}</div>
            <div className="modern-stat-value">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="modern-subpanel">
          <div className="modern-stat-label">Vs previous period</div>
          <div className="mt-2 text-sm">Bookings: <span className="font-semibold">{compareSummary.totalPct}%</span></div>
          <div className="text-sm">Revenue: <span className="font-semibold">{compareSummary.revenuePct}%</span></div>
          <div className="text-sm">Cancelled: <span className="font-semibold">{compareSummary.cancelledPct}%</span></div>
        </div>
        <div className="modern-subpanel md:col-span-2">
          <div className="modern-stat-label mb-2">Trend (last 14 points)</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="bookings" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="modern-subpanel">
          <div className="modern-stat-label">Confirmation rate</div>
          <div className="mt-2 text-2xl font-semibold">{advancedAnalytics.confirmationRate.toFixed(1)}%</div>
          <p className="mt-2 text-sm text-base-content/65">Share of filtered bookings that stayed active or completed.</p>
        </div>
        <div className="modern-subpanel">
          <div className="modern-stat-label">Average booking value</div>
          <div className="mt-2 text-2xl font-semibold">{formatCurrency(advancedAnalytics.averageBookingValue)}</div>
          <p className="mt-2 text-sm text-base-content/65">Average realized booking value excluding cancelled rows.</p>
        </div>
        <div className="modern-subpanel">
          <div className="modern-stat-label">Average duration</div>
          <div className="mt-2 text-2xl font-semibold">{advancedAnalytics.averageDuration.toFixed(2)} hrs</div>
          <p className="mt-2 text-sm text-base-content/65">Typical session length across the current filtered period.</p>
        </div>
        <div className="modern-subpanel">
          <div className="modern-stat-label">Busiest booking day</div>
          <div className="mt-2 text-2xl font-semibold">{advancedAnalytics.busiestDay.day}</div>
          <p className="mt-2 text-sm text-base-content/65">{advancedAnalytics.busiestDay.bookings} bookings in the current range.</p>
        </div>
      </div>
      </div>

      <div className="modern-toolbar">
        <div className="grid gap-3 lg:grid-cols-[1fr_160px_160px_160px_auto]">
          <label className="modern-input flex items-center gap-2">
            <span className="text-base-content/50">Search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="grow"
              placeholder="User, turf, status…"
            />
          </label>

          <select
            className="modern-select"
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            className="modern-input"
            value={draftStartDate}
            onChange={(e) => setDraftStartDate(e.target.value)}
          />
          <input
            type="date"
            className="modern-input"
            value={draftEndDate}
            onChange={(e) => setDraftEndDate(e.target.value)}
          />

          <div className="flex flex-wrap gap-2">
            <select className="modern-select" value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}>
              <option value="week">Display Weekly</option>
              <option value="month">Display Monthly</option>
              <option value="custom">Display Custom Range</option>
            </select>
            <button className="btn btn-primary" onClick={handleDisplayReport}>
              Display Report
            </button>
            <label className="label cursor-pointer gap-2">
              <span className="label-text">Automated email digest</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={emailDigestEnabled}
                onChange={(e) =>
                  persistDigestPreferences(e.target.checked, emailDigestCadence)
                }
                disabled={digestSaving}
              />
            </label>
            <select
              className="modern-select"
              value={emailDigestCadence}
              onChange={(e) => {
                const nextCadence = e.target.value;
                setEmailDigestCadence(nextCadence);
                persistDigestPreferences(emailDigestEnabled, nextCadence);
              }}
              disabled={digestSaving}
            >
              <option value="monthly">Monthly cadence</option>
              <option value="weekly">Weekly cadence</option>
            </select>
            <button className={`btn btn-outline ${emailSending ? "loading" : ""}`} onClick={sendMonthlyDigest}>
              Send digest now
            </button>
            <button
              className="btn btn-outline"
              onClick={() => {
                resetFilters();
                setSearch("");
                setReportPeriod("month");
                setDraftStatus("all");
                setDraftStartDate("");
                setDraftEndDate("");
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-base-content/70">
            Showing{" "}
            <span className="font-semibold text-base-content">{Math.min(pagination.total, pagination.start + 1)}</span>{" "}
            to{" "}
            <span className="font-semibold text-base-content">{Math.min(pagination.total, pagination.end)}</span>{" "}
            of <span className="font-semibold text-base-content">{pagination.total}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select className="modern-select select-sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <div className="join">
              <button className="btn btn-sm join-item" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={pagination.page <= 1}>
                Prev
              </button>
              <button className="btn btn-sm join-item btn-ghost" disabled>
                Page {pagination.page} / {pagination.pages}
              </button>
              <button className="btn btn-sm join-item" onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={pagination.page >= pagination.pages}>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="modern-panel">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="modern-section-title">Top Turf Performance</h3>
              <p className="modern-section-copy">
                Compare which turfs are driving bookings, revenue, and cancellation drag.
              </p>
            </div>
            {advancedAnalytics.topTurf ? (
              <div className="text-right text-sm text-base-content/65">
                <div className="font-semibold text-base-content">{advancedAnalytics.topTurf.name}</div>
                <div>{formatCurrency(advancedAnalytics.topTurf.revenue)} revenue</div>
              </div>
            ) : null}
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advancedAnalytics.turfPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {advancedAnalytics.turfPerformance.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-100 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{item.name}</div>
                  <div className="text-sm text-base-content/60">{item.bookings} bookings • {item.cancellations} cancelled</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                  <div className="text-base-content/60">realized revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="modern-panel">
            <h3 className="modern-section-title">Status Mix</h3>
            <p className="modern-section-copy">See whether booking volume is translating into healthy completion.</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={advancedAnalytics.statusDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={84} paddingAngle={3}>
                    {advancedAnalytics.statusDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {advancedAnalytics.statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="capitalize">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modern-panel">
            <h3 className="modern-section-title">Weekly Demand Pattern</h3>
            <p className="modern-section-copy">Spot which weekdays should carry more pricing, promos, or staffing attention.</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={advancedAnalytics.weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-table-shell">
      <div className="modern-table-scroll">
      <table className="modern-table">
        <thead>
          <tr>
            <th className="cursor-pointer" onClick={() => requestSort("turfName")}>
              Turf {sortConfig?.key === "turfName" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
            </th>
            <th className="cursor-pointer" onClick={() => requestSort("userName")}>
              User {sortConfig?.key === "userName" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
            </th>
            <th>Time</th>
            <th className="cursor-pointer" onClick={() => requestSort("bookingDate")}>
              Date {sortConfig?.key === "bookingDate" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
            </th>
            <th className="cursor-pointer" onClick={() => requestSort("status")}>
              Status {sortConfig?.key === "status" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
            </th>
            <th>Cancellation / Refund / Reschedule</th>
            <th className="cursor-pointer" onClick={() => requestSort("totalPrice")}>
              Price {sortConfig?.key === "totalPrice" ? (sortConfig.direction === "ascending" ? "▲" : "▼") : ""}
            </th>
          </tr>
        </thead>
        <tbody>
          {pagedBookings.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-10 text-center text-sm text-base-content/60">
                No bookings match the current filters.
              </td>
            </tr>
          ) : pagedBookings.map((booking) => (
            <tr key={booking.id}>
              <td>{booking.turfName}</td>
              <td>{booking.userName}</td>
              <td>{formatTime(booking.startTime)}</td>
              <td>{format(new Date(booking.bookingDate), "dd MMM yyyy")}</td>
              <td>
                <span className={`badge ${booking.status === "cancelled" ? "badge-error badge-outline" : "badge-success badge-outline"}`}>
                  {booking.status}
                </span>
              </td>
              <td>
                {booking.status === "cancelled" ? (
                  <div className="space-y-1 text-sm">
                    <div className="text-base-content/70">
                      {booking.cancellationReason || "No reason provided"}
                    </div>
                    <div className="text-base-content/60">
                      Refund:{" "}
                      {formatRefundLabel(booking.refund)}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    {booking.reschedule?.status &&
                    booking.reschedule?.status !== "none" ? (
                      <>
                        <div className="text-base-content/70">
                          Reschedule: {booking.reschedule.status}
                        </div>
                        {booking.reschedule?.requestedStartTime ? (
                          <div className="text-base-content/60">
                            Requested:{" "}
                            {format(
                              new Date(booking.reschedule.requestedStartTime),
                              "dd MMM yyyy h:mm aa"
                            )}
                          </div>
                        ) : null}
                        {booking.reschedule?.reason ? (
                          <div className="text-base-content/60">
                            Reason: {booking.reschedule.reason}
                          </div>
                        ) : null}
                        {formatRescheduleSettlementLabel(booking.reschedule) ? (
                          <div className="text-base-content/60">
                            Settlement: {formatRescheduleSettlementLabel(booking.reschedule)}
                          </div>
                        ) : null}
                        {booking.reschedule?.status === "requested" ? (
                          <div className="text-base-content/50">
                            Pricing rule: the user&apos;s original discount is preserved, and only the net slot-price difference will be collected or refunded after approval.
                          </div>
                        ) : null}
                        {booking.reschedule?.status === "requested" ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              className="btn btn-xs btn-success"
                              onClick={() =>
                                handleRescheduleDecision(booking.id, "approved")
                              }
                              disabled={reviewingBookingId === booking.id}
                            >
                              {reviewingBookingId === booking.id
                                ? "Working..."
                                : "Approve"}
                            </button>
                            <button
                              className="btn btn-xs btn-error btn-outline"
                              onClick={() =>
                                handleRescheduleDecision(booking.id, "rejected")
                              }
                              disabled={reviewingBookingId === booking.id}
                            >
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-base-content/50">-</span>
                    )}
                  </div>
                )}
              </td>
              <td>₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      </div>
      </div>
    </div>
  );
};

export default OwnerBookings;
