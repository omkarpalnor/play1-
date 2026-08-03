import useTransactionData from "@hooks/admin/useTransactionData";
import TransactionSkeleton from "./TransactionSkeleton";
import TransactionFilters from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import useTransactionManagement from "@hooks/admin/useTransactionManagement.jsx";
import { downloadCsvReport, printPdfReport } from "../../../utils/reportExport";
import axiosInstance from "@hooks/useAxiosInstance";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import toast from "react-hot-toast";

const CHART_COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#8b5cf6", "#ef4444"];

const TransactionSection = () => {
  const { transactions, loading, error } = useTransactionData();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [reportPeriod, setReportPeriod] = useState("month");
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);
  const [emailDigestCadence, setEmailDigestCadence] = useState("monthly");
  const [emailSending, setEmailSending] = useState(false);
  const [digestSaving, setDigestSaving] = useState(false);
  const [draftFilters, setDraftFilters] = useState({
    search: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
    status: "all",
  });

  const {
    filters,
    sortField,
    sortDirection,
    filteredAndSortedTransactions,
    transactionSummary,
    applyFilters,
    resetFilters,
    toggleSort,
  } = useTransactionManagement(transactions);

  useEffect(() => {
    setPage(1);
  }, [filters, sortField, sortDirection, transactions.length]);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const onDraftFilterChange = (e) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  };

  const persistDigestPreferences = async (nextEnabled, nextCadence) => {
    try {
      setDigestSaving(true);
      const response = await axiosInstance.patch("/api/admin/transactions/report/preferences", {
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
  };

  const getCurrentRange = useCallback(() => {
    const now = new Date();
    const end = draftFilters.endDate ? new Date(draftFilters.endDate) : now;
    const start = draftFilters.startDate
      ? new Date(draftFilters.startDate)
      : reportPeriod === "week"
        ? new Date(new Date(end).setDate(end.getDate() - 7))
        : new Date(new Date(end).setDate(end.getDate() - 30));
    return { start, end };
  }, [draftFilters.endDate, draftFilters.startDate, reportPeriod]);

  const getPreviousRange = useCallback(() => {
    const { start, end } = getCurrentRange();
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);
    return { start: prevStart, end: prevEnd };
  }, [getCurrentRange]);

  const buildSummary = (rows) =>
    rows.reduce(
      (acc, t) => {
        const status = t.status || "confirmed";
        acc.total += 1;
        if (status === "cancelled") acc.cancelled += 1;
        else acc.confirmed += 1;
        acc.revenue += status === "cancelled" ? 0 : Number(t.totalPrice || 0);
        return acc;
      },
      { total: 0, confirmed: 0, cancelled: 0, revenue: 0 }
    );

  const compareSummary = useMemo(() => {
    const { start, end } = getCurrentRange();
    const prev = getPreviousRange();
    const inRange = (t, s, e) => {
      const d = new Date(t.createdAt);
      return d >= s && d <= e;
    };
    const currentRows = transactions.filter((t) => inRange(t, start, end));
    const previousRows = transactions.filter((t) => inRange(t, prev.start, prev.end));
    const current = buildSummary(currentRows);
    const previous = buildSummary(previousRows);
    const pct = (cur, old) => (old ? (((cur - old) / old) * 100).toFixed(1) : cur > 0 ? "100.0" : "0.0");
    return {
      current,
      previous,
      totalPct: pct(current.total, previous.total),
      revenuePct: pct(current.revenue, previous.revenue),
      cancelledPct: pct(current.cancelled, previous.cancelled),
    };
  }, [getCurrentRange, getPreviousRange, transactions]);

  const trendData = useMemo(() => {
    const map = new Map();
    filteredAndSortedTransactions.forEach((t) => {
      const key = new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit" });
      if (!map.has(key)) map.set(key, { label: key, bookings: 0, revenue: 0 });
      const row = map.get(key);
      row.bookings += 1;
      if ((t.status || "confirmed") !== "cancelled") row.revenue += Number(t.totalPrice || 0);
    });
    return Array.from(map.values()).slice(-14);
  }, [filteredAndSortedTransactions]);

  const advancedAnalytics = useMemo(() => {
    const total = filteredAndSortedTransactions.length;
    const confirmedRows = filteredAndSortedTransactions.filter((transaction) => (transaction.status || "confirmed") !== "cancelled");
    const cancelledRows = filteredAndSortedTransactions.filter((transaction) => (transaction.status || "confirmed") === "cancelled");
    const totalRevenue = confirmedRows.reduce((sum, transaction) => sum + Number(transaction.totalPrice || 0), 0);
    const cancelledValue = cancelledRows.reduce((sum, transaction) => sum + Number(transaction.totalPrice || 0), 0);
    const successRate = total ? (confirmedRows.length / total) * 100 : 0;
    const refundExposure = totalRevenue + cancelledValue > 0 ? (cancelledValue / (totalRevenue + cancelledValue)) * 100 : 0;
    const averageTicket = confirmedRows.length ? totalRevenue / confirmedRows.length : 0;

    const turfMap = new Map();
    const userMap = new Map();
    const statusMap = new Map();

    filteredAndSortedTransactions.forEach((transaction) => {
      const turfName = transaction.turf?.name || "Unknown turf";
      const userName = transaction.user?.name || "Unknown user";
      const status = transaction.status || "confirmed";
      const amount = Number(transaction.totalPrice || 0);
      const realizedAmount = status === "cancelled" ? 0 : amount;

      if (!turfMap.has(turfName)) {
        turfMap.set(turfName, { name: turfName, bookings: 0, revenue: 0, cancelled: 0 });
      }
      const turfEntry = turfMap.get(turfName);
      turfEntry.bookings += 1;
      turfEntry.revenue += realizedAmount;
      if (status === "cancelled") turfEntry.cancelled += 1;

      if (!userMap.has(userName)) {
        userMap.set(userName, { name: userName, bookings: 0, spend: 0 });
      }
      const userEntry = userMap.get(userName);
      userEntry.bookings += 1;
      userEntry.spend += realizedAmount;

      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const topTurfs = Array.from(turfMap.values()).sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings).slice(0, 5);
    const topUsers = Array.from(userMap.values()).sort((a, b) => b.spend - a.spend || b.bookings - a.bookings).slice(0, 5);
    const statusDistribution = Array.from(statusMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    return {
      successRate,
      refundExposure,
      averageTicket,
      confirmedValue: totalRevenue,
      cancelledValue,
      topTurfs,
      topUsers,
      statusDistribution,
    };
  }, [filteredAndSortedTransactions]);

  const applyPeriodToDates = () => {
    const now = new Date();
    const start = new Date(now);
    if (reportPeriod === "week") {
      start.setDate(now.getDate() - 7);
      return {
        ...draftFilters,
        startDate: start.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
      };
    }
    if (reportPeriod === "month") {
      start.setDate(now.getDate() - 30);
      return {
        ...draftFilters,
        startDate: start.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
      };
    }
    return draftFilters;
  };

  const handleDisplayReport = () => {
    const next = applyPeriodToDates();
    setDraftFilters(next);
    applyFilters(next);
    setPage(1);
  };

  const sendMonthlyDigest = async () => {
    try {
      setEmailSending(true);
      await axiosInstance.post("/api/admin/transactions/report/email", {
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

  useEffect(() => {
    const loadDigestPreferences = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/transactions/report/preferences");
        const prefs = response.data?.preferences;
        setEmailDigestEnabled(Boolean(prefs?.enabled));
        setEmailDigestCadence(prefs?.cadence || "monthly");
      } catch (error) {
        console.error("Failed to load admin digest preferences", error);
      }
    };

    loadDigestPreferences();
  }, []);

  const handleResetAllFilters = () => {
    const base = {
      search: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
      status: "all",
    };
    setReportPeriod("month");
    setDraftFilters(base);
    resetFilters();
  };

  const pagination = useMemo(() => {
    const total = filteredAndSortedTransactions.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, pages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return { total, pages, page: safePage, start, end };
  }, [filteredAndSortedTransactions.length, page, pageSize]);

  const pagedTransactions = filteredAndSortedTransactions.slice(pagination.start, pagination.end);

  // ✅ After all hooks (safe)
  if (loading) return <TransactionSkeleton />;
  if (error)
    return <div className="alert alert-error shadow-lg">{error}</div>;

  // =========================
  // REPORT CONFIG
  // =========================
  const reportHeaders = [
    { key: "userName", label: "User" },
    { key: "date", label: "Date" },
    { key: "turfName", label: "Turf" },
    { key: "status", label: "Status" },
    { key: "orderId", label: "Order ID" },
    { key: "paymentId", label: "Payment ID" },
    { key: "amount", label: "Amount (INR)" },
  ];

  const reportSummary = [
    { label: "Total", value: transactionSummary.total },
    { label: "Confirmed", value: transactionSummary.confirmed },
    { label: "Cancelled", value: transactionSummary.cancelled },
    { label: "Revenue", value: `INR ${transactionSummary.revenue}` },
    {
      label: "Cancelled Value",
      value: `INR ${transactionSummary.cancelledValue}`,
    },
  ];

  const buildReportParams = () => ({
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    status: filters.status || "all",
  });

  const fetchServerReport = async () => {
    const response = await axiosInstance.get(
      "/api/admin/transactions/report",
      {
        params: buildReportParams(),
      }
    );
    return response.data;
  };

  // =========================
  // CSV DOWNLOAD
  // =========================
  const handleDownloadCsv = async () => {
    try {
      const report = await fetchServerReport();

      const rows = (report.transactions || []).map((transaction) => ({
        userName: transaction.user?.name || "N/A",
        date: new Date(transaction.createdAt).toLocaleDateString(),
        turfName: transaction.turf?.name || "N/A",
        status: transaction.status || "confirmed",
        orderId: transaction.payment?.orderId || "N/A",
        paymentId: transaction.payment?.paymentId || "N/A",
        amount: transaction.totalPrice || 0,
      }));

      downloadCsvReport({
        fileName: `admin-booking-report-${Date.now()}.csv`,
        headers: reportHeaders,
        rows,
      });
    } catch (error) {
      console.error("Failed to download admin CSV report:", error);
    }
  };

  // =========================
  // PDF GENERATE
  // =========================
  const handlePrintPdf = async () => {
    try {
      const report = await fetchServerReport();

      const rows = (report.transactions || []).map((transaction) => ({
        userName: transaction.user?.name || "N/A",
        date: new Date(transaction.createdAt).toLocaleDateString(),
        turfName: transaction.turf?.name || "N/A",
        status: transaction.status || "confirmed",
        orderId: transaction.payment?.orderId || "N/A",
        paymentId: transaction.payment?.paymentId || "N/A",
        amount: transaction.totalPrice || 0,
      }));

      const summary = report.summary
        ? [
            { label: "Total", value: report.summary.total },
            { label: "Confirmed", value: report.summary.confirmed },
            { label: "Cancelled", value: report.summary.cancelled },
            { label: "Revenue", value: `INR ${report.summary.revenue}` },
            {
              label: "Cancelled Value",
              value: `INR ${report.summary.cancelledValue}`,
            },
          ]
        : reportSummary;

      printPdfReport({
        title: "Admin Booking Report",
        subtitle: `Generated on ${new Date().toLocaleString()}`,
        headers: reportHeaders,
        rows,
        summary,
      });
    } catch (error) {
      console.error("Failed to generate admin PDF report:", error);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="modern-shell">
      <div className="modern-container">
      <div className="modern-hero">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="modern-hero-title">Transactions Report</h2>
            <p className="modern-hero-copy">
              Filter, sort, export CSV/PDF, and review payment history.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={handlePrintPdf}>
              Generate PDF Report
            </button>
            <button className="btn btn-outline" onClick={handleDownloadCsv}>
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            { label: "Total", value: transactionSummary.total },
            { label: "Confirmed", value: transactionSummary.confirmed },
            { label: "Cancelled", value: transactionSummary.cancelled },
            { label: "Revenue", value: `₹${transactionSummary.revenue}` },
            { label: "Cancelled Value", value: `₹${transactionSummary.cancelledValue}` },
          ].map((item) => (
            <div key={item.label} className="modern-stat-card">
              <div className="modern-stat-label">
                {item.label}
              </div>
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
            <div className="modern-stat-label">Success rate</div>
            <div className="mt-2 text-2xl font-semibold">{advancedAnalytics.successRate.toFixed(1)}%</div>
            <p className="mt-2 text-sm text-base-content/65">Share of filtered transactions that completed without cancellation.</p>
          </div>
          <div className="modern-subpanel">
            <div className="modern-stat-label">Average ticket</div>
            <div className="mt-2 text-2xl font-semibold">INR {advancedAnalytics.averageTicket.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            <p className="mt-2 text-sm text-base-content/65">Average confirmed booking amount in the current view.</p>
          </div>
          <div className="modern-subpanel">
            <div className="modern-stat-label">Confirmed value</div>
            <div className="mt-2 text-2xl font-semibold">INR {advancedAnalytics.confirmedValue.toLocaleString("en-IN")}</div>
            <p className="mt-2 text-sm text-base-content/65">Realized GMV from successful transactions in this range.</p>
          </div>
          <div className="modern-subpanel">
            <div className="modern-stat-label">Refund exposure</div>
            <div className="mt-2 text-2xl font-semibold">{advancedAnalytics.refundExposure.toFixed(1)}%</div>
            <p className="mt-2 text-sm text-base-content/65">Share of total transaction value sitting in cancelled volume.</p>
          </div>
        </div>
      </div>

        <div className="modern-toolbar">
          <div>
            <h3 className="modern-section-title">Filters and Delivery</h3>
            <p className="modern-section-copy">
              Refine the transaction set, compare a report window, and control automated digests.
            </p>
          </div>
          <TransactionFilters
          filters={draftFilters}
          onFilterChange={onDraftFilterChange}
          onResetFilters={handleResetAllFilters}
          />

        <div className="modern-toolbar-row">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="modern-select"
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
          >
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
        </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-base-content/70">
            Showing <span className="font-semibold text-base-content">{Math.min(pagination.total, pagination.start + 1)}</span>
            {" "}to{" "}
            <span className="font-semibold text-base-content">{Math.min(pagination.total, pagination.end)}</span>
            {" "}of{" "}
            <span className="font-semibold text-base-content">{pagination.total}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="modern-select select-sm"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <div className="join">
              <button
                className="btn btn-sm join-item"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
              >
                Prev
              </button>
              <button className="btn btn-sm join-item btn-ghost" disabled>
                Page {pagination.page} / {pagination.pages}
              </button>
              <button
                className="btn btn-sm join-item"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={pagination.page >= pagination.pages}
              >
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
              <h3 className="modern-section-title">Top Revenue Turfs</h3>
              <p className="modern-section-copy">
                See which turfs are actually carrying transaction volume and where cancellation drag is building.
              </p>
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={advancedAnalytics.topTurfs}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
                <Bar dataKey="cancelled" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {advancedAnalytics.topTurfs.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-100 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{item.name}</div>
                  <div className="text-sm text-base-content/60">{item.bookings} bookings • {item.cancelled} cancelled</div>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold">INR {item.revenue.toLocaleString("en-IN")}</div>
                  <div className="text-base-content/60">confirmed revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="modern-panel">
            <h3 className="modern-section-title">Transaction Status Mix</h3>
            <p className="modern-section-copy">Quick read on how healthy current transaction outcomes look.</p>
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
            <h3 className="modern-section-title">Highest Value Customers</h3>
            <p className="modern-section-copy">A simple list of who is driving the most realized spend in the current filtered set.</p>
            <div className="mt-4 space-y-3">
              {advancedAnalytics.topUsers.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-100 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{item.name}</div>
                    <div className="text-sm text-base-content/60">{item.bookings} transactions</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">INR {item.spend.toLocaleString("en-IN")}</div>
                    <div className="text-base-content/60">realized spend</div>
                  </div>
                </div>
              ))}
              {advancedAnalytics.topUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-base-300 px-4 py-6 text-sm text-base-content/60">
                  No customer activity matches the current filter set.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <TransactionTable
        transactions={pagedTransactions}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={toggleSort}
      />
      </div>
    </div>
  );
};

export default TransactionSection;
