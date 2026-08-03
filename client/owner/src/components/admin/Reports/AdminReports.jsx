import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BarChart3,
  CalendarRange,
  Download,
  LayoutGrid,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Users,
} from "lucide-react";
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
import useTransactionData from "@hooks/admin/useTransactionData";
import useTransactionManagement from "@hooks/admin/useTransactionManagement.jsx";
import axiosInstance from "@hooks/useAxiosInstance";
import { downloadCsvReport, printPdfReport } from "@utils/reportExport";
import { getPrimaryCategoryConfig } from "@utils/turfCategories";

const CHART_COLORS = ["#0ea5e9", "#22c55e", "#f97316", "#8b5cf6", "#ef4444"];

const REPORT_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "revenue", label: "Revenue", icon: LineChartIcon },
  { id: "performance", label: "Performance", icon: PieChartIcon },
  { id: "categories", label: "Categories", icon: LayoutGrid },
  { id: "customers", label: "Customers", icon: Users },
  { id: "exports", label: "Exports", icon: Download },
];

const formatCurrency = (value) =>
  `INR ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const TabButton = ({ active, icon: Icon, label, onClick }) => (
  <button
    type="button"
    className={`modern-tab ${active ? "modern-tab-active" : ""}`}
    onClick={onClick}
  >
    <Icon size={16} className="mr-2" />
    {label}
  </button>
);

const MetricCard = ({ label, value, help }) => (
  <div className="modern-subpanel">
    <div className="modern-stat-label">{label}</div>
    <div className="mt-2 text-2xl font-semibold">{value}</div>
    {help ? <p className="mt-2 text-sm text-base-content/65">{help}</p> : null}
  </div>
);

const getTransactionCategory = (transaction) =>
  getPrimaryCategoryConfig(
    transaction?.turf?.primaryCategory,
    transaction?.turf?.sportTypes || [],
  );

const AdminReports = () => {
  const { transactions, loading, error } = useTransactionData();
  const [activeTab, setActiveTab] = useState("overview");
  const [reportPeriod, setReportPeriod] = useState("month");
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);
  const [emailDigestCadence, setEmailDigestCadence] = useState("monthly");
  const [emailSending, setEmailSending] = useState(false);
  const [digestSaving, setDigestSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
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
    filteredAndSortedTransactions,
    transactionSummary,
    applyFilters,
    resetFilters,
  } = useTransactionManagement(transactions);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  useEffect(() => {
    const loadDigestPreferences = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/admin/transactions/report/preferences",
        );
        const prefs = response.data?.preferences;
        setEmailDigestEnabled(Boolean(prefs?.enabled));
        setEmailDigestCadence(prefs?.cadence || "monthly");
      } catch (loadError) {
        console.error("Failed to load admin digest preferences", loadError);
      }
    };

    loadDigestPreferences();
  }, []);

  const persistDigestPreferences = async (nextEnabled, nextCadence) => {
    try {
      setDigestSaving(true);
      const response = await axiosInstance.patch(
        "/api/admin/transactions/report/preferences",
        {
          enabled: nextEnabled,
          cadence: nextCadence,
        },
      );
      const prefs = response.data?.preferences;
      setEmailDigestEnabled(Boolean(prefs?.enabled));
      setEmailDigestCadence(prefs?.cadence || "monthly");
      toast.success(response.data?.message || "Digest preferences updated");
    } catch (persistError) {
      toast.error(
        persistError?.response?.data?.message ||
          "Failed to update digest preferences",
      );
    } finally {
      setDigestSaving(false);
    }
  };

  const applyPeriodToDates = useCallback(() => {
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
  }, [draftFilters, reportPeriod]);

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
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);
    return { start: previousStart, end: previousEnd };
  }, [getCurrentRange]);

  const buildSummary = useCallback(
    (rows) =>
      rows.reduce(
        (acc, transaction) => {
          const status = transaction.status || "confirmed";
          acc.total += 1;
          if (status === "cancelled") {
            acc.cancelled += 1;
          } else {
            acc.confirmed += 1;
            acc.revenue += Number(transaction.totalPrice || 0);
          }
          return acc;
        },
        { total: 0, confirmed: 0, cancelled: 0, revenue: 0 },
      ),
    [],
  );

  const compareSummary = useMemo(() => {
    const { start, end } = getCurrentRange();
    const previous = getPreviousRange();
    const inRange = (transaction, rangeStart, rangeEnd) => {
      const value = new Date(transaction.createdAt);
      return value >= rangeStart && value <= rangeEnd;
    };
    const current = buildSummary(
      transactions.filter((transaction) => inRange(transaction, start, end)),
    );
    const old = buildSummary(
      transactions.filter((transaction) =>
        inRange(transaction, previous.start, previous.end),
      ),
    );
    const percent = (currentValue, previousValue) =>
      previousValue
        ? (((currentValue - previousValue) / previousValue) * 100).toFixed(1)
        : currentValue > 0
          ? "100.0"
          : "0.0";

    return {
      totalPct: percent(current.total, old.total),
      revenuePct: percent(current.revenue, old.revenue),
      cancelledPct: percent(current.cancelled, old.cancelled),
    };
  }, [buildSummary, getCurrentRange, getPreviousRange, transactions]);

  const trendData = useMemo(() => {
    const map = new Map();
    filteredAndSortedTransactions.forEach((transaction) => {
      const key = new Date(transaction.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      if (!map.has(key)) {
        map.set(key, { label: key, bookings: 0, revenue: 0 });
      }
      const row = map.get(key);
      row.bookings += 1;
      if ((transaction.status || "confirmed") !== "cancelled") {
        row.revenue += Number(transaction.totalPrice || 0);
      }
    });
    return Array.from(map.values()).slice(-14);
  }, [filteredAndSortedTransactions]);

  const analytics = useMemo(() => {
    const total = filteredAndSortedTransactions.length;
    const confirmedRows = filteredAndSortedTransactions.filter(
      (transaction) => (transaction.status || "confirmed") !== "cancelled",
    );
    const cancelledRows = filteredAndSortedTransactions.filter(
      (transaction) => (transaction.status || "confirmed") === "cancelled",
    );
    const totalRevenue = confirmedRows.reduce(
      (sum, transaction) => sum + Number(transaction.totalPrice || 0),
      0,
    );
    const cancelledValue = cancelledRows.reduce(
      (sum, transaction) => sum + Number(transaction.totalPrice || 0),
      0,
    );
    const successRate = total ? (confirmedRows.length / total) * 100 : 0;
    const refundExposure =
      totalRevenue + cancelledValue > 0
        ? (cancelledValue / (totalRevenue + cancelledValue)) * 100
        : 0;
    const averageTicket = confirmedRows.length
      ? totalRevenue / confirmedRows.length
      : 0;

    const turfMap = new Map();
    const userMap = new Map();
    const statusMap = new Map();
    const ownerMap = new Map();
    const categoryMap = new Map();

    filteredAndSortedTransactions.forEach((transaction) => {
      const turfName = transaction.turf?.name || "Unknown turf";
      const ownerName =
        transaction.turf?.owner?.name ||
        transaction.owner?.name ||
        "Unknown owner";
      const userName = transaction.user?.name || "Unknown user";
      const status = transaction.status || "confirmed";
      const category = getTransactionCategory(transaction);
      const amount = Number(transaction.totalPrice || 0);
      const realizedAmount = status === "cancelled" ? 0 : amount;

      if (!turfMap.has(turfName)) {
        turfMap.set(turfName, {
          name: turfName,
          bookings: 0,
          revenue: 0,
          cancelled: 0,
        });
      }
      const turfEntry = turfMap.get(turfName);
      turfEntry.bookings += 1;
      turfEntry.revenue += realizedAmount;
      if (status === "cancelled") {
        turfEntry.cancelled += 1;
      }

      if (!userMap.has(userName)) {
        userMap.set(userName, {
          name: userName,
          bookings: 0,
          spend: 0,
          cancelled: 0,
        });
      }
      const userEntry = userMap.get(userName);
      userEntry.bookings += 1;
      userEntry.spend += realizedAmount;
      if (status === "cancelled") {
        userEntry.cancelled += 1;
      }

      if (!ownerMap.has(ownerName)) {
        ownerMap.set(ownerName, {
          name: ownerName,
          bookings: 0,
          revenue: 0,
        });
      }
      const ownerEntry = ownerMap.get(ownerName);
      ownerEntry.bookings += 1;
      ownerEntry.revenue += realizedAmount;

      statusMap.set(status, (statusMap.get(status) || 0) + 1);

      if (!categoryMap.has(category.value)) {
        categoryMap.set(category.value, {
          key: category.value,
          name: category.label,
          bookings: 0,
          revenue: 0,
          cancelled: 0,
          color: CHART_COLORS[categoryMap.size % CHART_COLORS.length],
        });
      }
      const categoryEntry = categoryMap.get(category.value);
      categoryEntry.bookings += 1;
      categoryEntry.revenue += realizedAmount;
      if (status === "cancelled") {
        categoryEntry.cancelled += 1;
      }
    });

    const categoryPerformance = Array.from(categoryMap.values())
      .map((entry) => ({
        ...entry,
        cancellationRate: entry.bookings
          ? (entry.cancelled / entry.bookings) * 100
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings);

    return {
      successRate,
      refundExposure,
      averageTicket,
      confirmedValue: totalRevenue,
      cancelledValue,
      topTurfs: Array.from(turfMap.values())
        .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings)
        .slice(0, 5),
      topUsers: Array.from(userMap.values())
        .sort((a, b) => b.spend - a.spend || b.bookings - a.bookings)
        .slice(0, 5),
      topOwners: Array.from(ownerMap.values())
        .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings)
        .slice(0, 5),
      categoryPerformance,
      topCategory: categoryPerformance[0] || null,
      statusDistribution: Array.from(statusMap.entries()).map(
        ([name, value], index) => ({
          name,
          value,
          color: CHART_COLORS[index % CHART_COLORS.length],
        }),
      ),
    };
  }, [filteredAndSortedTransactions]);

  const reportHeaders = useMemo(
    () => [
      { key: "date", label: "Date" },
      { key: "userName", label: "User" },
      { key: "turfName", label: "Turf" },
      { key: "category", label: "Category" },
      { key: "status", label: "Status" },
      { key: "amount", label: "Amount (INR)" },
      { key: "paymentId", label: "Payment ID" },
    ],
    [],
  );

  const fetchServerReport = useCallback(async () => {
    const response = await axiosInstance.get("/api/admin/transactions/report", {
      params: {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: filters.status || "all",
      },
    });
    return response.data;
  }, [filters.endDate, filters.startDate, filters.status]);

  const mapTransactionRows = useCallback(
    (records) =>
      (records || []).map((transaction) => ({
        date: new Date(transaction.createdAt).toLocaleDateString("en-IN"),
        userName: transaction.user?.name || "N/A",
        turfName: transaction.turf?.name || "N/A",
        category: getTransactionCategory(transaction).label,
        status: transaction.status || "confirmed",
        amount: transaction.totalPrice || 0,
        paymentId: transaction.payment?.paymentId || "N/A",
      })),
    [],
  );

  const handleApplyFilters = () => {
    const next = applyPeriodToDates();
    setDraftFilters(next);
    applyFilters(next);
  };

  const handleDownloadCsv = async () => {
    try {
      setExporting(true);
      const report = await fetchServerReport();
      downloadCsvReport({
        fileName: `admin-booking-report-${Date.now()}.csv`,
        headers: reportHeaders,
        rows: mapTransactionRows(report.transactions),
      });
      toast.success("CSV report downloaded");
    } catch (downloadError) {
      console.error("Failed to download admin CSV report:", downloadError);
      toast.error("Failed to download CSV report");
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPdf = async () => {
    try {
      setExporting(true);
      const report = await fetchServerReport();
      printPdfReport({
        title: "Admin Transaction Report",
        fileName: `admin-booking-report-${Date.now()}.pdf`,
        reportLabel: "PlayRizon Admin Analytics",
        subtitle:
          "A branded platform performance pack covering revenue, customers, owner health, and category performance for the active report window.",
        headers: reportHeaders,
        rows: mapTransactionRows(report.transactions),
        summary: [
          { label: "Total", value: transactionSummary.total },
          { label: "Confirmed", value: transactionSummary.confirmed },
          { label: "Cancelled", value: transactionSummary.cancelled },
          { label: "Revenue", value: formatCurrency(transactionSummary.revenue) },
          {
            label: "Cancelled value",
            value: formatCurrency(transactionSummary.cancelledValue),
          },
        ],
        filters: [
          {
            label: "Period",
            value:
              reportPeriod === "week"
                ? "Last 7 days"
                : reportPeriod === "month"
                  ? "Last 30 days"
                  : "Custom range",
          },
          { label: "Status", value: draftFilters.status || "all" },
          {
            label: "Date range",
            value:
              draftFilters.startDate || draftFilters.endDate
                ? `${draftFilters.startDate || "Start"} to ${draftFilters.endDate || "Now"}`
                : "Current platform window",
          },
        ],
        highlights: [
          {
            label: "Success rate",
            value: `${analytics.successRate.toFixed(1)}%`,
            note: "Share of transactions that completed without cancellation.",
          },
          {
            label: "Top category",
            value: analytics.topCategory?.name || "No category data",
            note: analytics.topCategory
              ? `${formatCurrency(analytics.topCategory.revenue)} realized revenue`
              : "No realized category performance in this window.",
          },
          {
            label: "Top owner",
            value: analytics.topOwners[0]?.name || "No owner data",
            note: analytics.topOwners[0]
              ? `${formatCurrency(analytics.topOwners[0].revenue)} realized revenue`
              : "No owner revenue in this window.",
          },
          {
            label: "Top customer",
            value: analytics.topUsers[0]?.name || "No customer data",
            note: analytics.topUsers[0]
              ? `${formatCurrency(analytics.topUsers[0].spend)} realized spend`
              : "No customer activity in this window.",
          },
        ],
        sections: [
          {
            title: "Category Performance",
            description:
              "Category-wise bookings, realized revenue, and cancellation pressure across the platform.",
            headers: [
              "Category",
              "Transactions",
              "Revenue",
              "Cancelled",
              "Cancellation Rate",
            ],
            rows: analytics.categoryPerformance.map((item) => [
              item.name,
              String(item.bookings),
              formatCurrency(item.revenue),
              String(item.cancelled),
              `${item.cancellationRate.toFixed(1)}%`,
            ]),
          },
          {
            title: "Top Owners",
            description:
              "Owner leaderboard by realized platform revenue.",
            headers: ["Owner", "Transactions", "Revenue"],
            rows: analytics.topOwners.map((item) => [
              item.name,
              String(item.bookings),
              formatCurrency(item.revenue),
            ]),
          },
          {
            title: "Top Customers",
            description:
              "Highest-value customers in the active report window.",
            headers: ["Customer", "Transactions", "Realized Spend", "Cancelled"],
            rows: analytics.topUsers.map((item) => [
              item.name,
              String(item.bookings),
              formatCurrency(item.spend),
              String(item.cancelled),
            ]),
          },
        ],
      });
      toast.success("PDF report generated");
    } catch (printError) {
      console.error("Failed to generate admin PDF report:", printError);
      toast.error("Failed to generate PDF report");
    } finally {
      setExporting(false);
    }
  };

  const sendDigestNow = async () => {
    try {
      setEmailSending(true);
      await axiosInstance.post("/api/admin/transactions/report/email", {
        cadence: emailDigestCadence,
        status: filters.status || "all",
      });
      toast.success("Admin digest sent");
    } catch (sendError) {
      toast.error(sendError?.response?.data?.message || "Failed to send digest");
    } finally {
      setEmailSending(false);
    }
  };

  const renderOverview = () => (
    <div className="grid gap-6">
      <div className="modern-panel">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="Total transactions" value={transactionSummary.total} />
          <MetricCard label="Confirmed" value={transactionSummary.confirmed} />
          <MetricCard label="Cancelled" value={transactionSummary.cancelled} />
          <MetricCard
            label="Revenue"
            value={formatCurrency(transactionSummary.revenue)}
          />
          <MetricCard
            label="Success rate"
            value={`${analytics.successRate.toFixed(1)}%`}
          />
          <MetricCard
            label="Refund exposure"
            value={`${analytics.refundExposure.toFixed(1)}%`}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="modern-panel">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="modern-section-title">Platform trend snapshot</h3>
              <p className="modern-section-copy">
                Monitor booking count and realized revenue across the active report window.
              </p>
            </div>
            <div className="text-right text-sm text-base-content/65">
              <div>Transactions: {compareSummary.totalPct}%</div>
              <div>Revenue: {compareSummary.revenuePct}%</div>
              <div>Cancelled: {compareSummary.cancelledPct}%</div>
            </div>
          </div>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="modern-panel">
          <h3 className="modern-section-title">Transaction status mix</h3>
          <p className="modern-section-copy">
            Quick view of how healthy the current transaction outcomes look.
          </p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {analytics.statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {analytics.statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="capitalize">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="modern-panel">
        <h3 className="modern-section-title">Top revenue turfs</h3>
        <p className="modern-section-copy">
          See which venues are carrying confirmed value and where cancellation drag is clustering.
        </p>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.topTurfs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="cancelled" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6">
        <MetricCard
          label="Average ticket"
          value={formatCurrency(analytics.averageTicket)}
          help="Average confirmed booking amount in the current report range."
        />
        <MetricCard
          label="Confirmed value"
          value={formatCurrency(analytics.confirmedValue)}
          help="Realized GMV from successful transactions."
        />
        <MetricCard
          label="Cancelled value"
          value={formatCurrency(analytics.cancelledValue)}
          help="Value trapped in cancelled transactions inside the current filters."
        />
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <div className="modern-panel">
        <h3 className="modern-section-title">Top owners</h3>
        <p className="modern-section-copy">
          A fast read on which owners are driving the most realized platform value.
        </p>
        <div className="mt-4 space-y-3">
          {analytics.topOwners.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.name}</div>
                <div className="text-sm text-base-content/60">
                  {item.bookings} transactions
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                <div className="text-base-content/60">realized revenue</div>
              </div>
            </div>
          ))}
          {analytics.topOwners.length === 0 ? (
            <div className="modern-empty-state">
              No owner performance data matches the current filters.
            </div>
          ) : null}
        </div>
      </div>

      <div className="modern-panel">
        <h3 className="modern-section-title">Top turf list</h3>
        <p className="modern-section-copy">
          Ranked venues by realized revenue and cancellation volume in the report window.
        </p>
        <div className="mt-4 space-y-3">
          {analytics.topTurfs.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.name}</div>
                <div className="text-sm text-base-content/60">
                  {item.bookings} transactions • {item.cancelled} cancelled
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                <div className="text-base-content/60">confirmed revenue</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="modern-panel">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="modern-section-title">Platform revenue by category</h3>
            <p className="modern-section-copy">
              Compare which turf categories are actually carrying confirmed platform value.
            </p>
          </div>
          {analytics.topCategory ? (
            <div className="text-right text-sm text-base-content/65">
              <div className="font-semibold text-base-content">
                {analytics.topCategory.name}
              </div>
              <div>{formatCurrency(analytics.topCategory.revenue)} realized</div>
            </div>
          ) : null}
        </div>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="modern-panel">
        <h3 className="modern-section-title">Category leaderboard</h3>
        <p className="modern-section-copy">
          Ranked category view with bookings, revenue, and cancellation rate.
        </p>
        <div className="mt-4 space-y-3">
          {analytics.categoryPerformance.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.name}</div>
                <div className="text-sm text-base-content/60">
                  {item.bookings} transactions • {item.cancelled} cancelled
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                <div className="text-base-content/60">
                  {item.cancellationRate.toFixed(1)}% cancellation rate
                </div>
              </div>
            </div>
          ))}
          {analytics.categoryPerformance.length === 0 ? (
            <div className="modern-empty-state">
              No category analytics match the active platform filters.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="modern-panel">
        <h3 className="modern-section-title">Highest value customers</h3>
        <p className="modern-section-copy">
          Understand who is driving realized spend inside the active filtered set.
        </p>
        <div className="mt-4 space-y-3">
          {analytics.topUsers.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.name}</div>
                <div className="text-sm text-base-content/60">
                  {item.bookings} transactions • {item.cancelled} cancelled
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{formatCurrency(item.spend)}</div>
                <div className="text-base-content/60">realized spend</div>
              </div>
            </div>
          ))}
          {analytics.topUsers.length === 0 ? (
            <div className="modern-empty-state">
              No customer activity matches the current filters yet.
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6">
        <MetricCard
          label="Average top-customer spend"
          value={
            analytics.topUsers.length
              ? formatCurrency(
                  analytics.topUsers.reduce((sum, entry) => sum + entry.spend, 0) /
                    analytics.topUsers.length,
                )
              : formatCurrency(0)
          }
          help="Average realized spend across the top customers in this report view."
        />
        <MetricCard
          label="Top-customer transaction count"
          value={analytics.topUsers.reduce((sum, entry) => sum + entry.bookings, 0)}
          help="Combined transaction count from the highest-value customers in the filtered set."
        />
      </div>
    </div>
  );

  const renderExports = () => (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
      <div className="modern-panel">
        <h3 className="modern-section-title">Export center</h3>
        <p className="modern-section-copy">
          Download the platform report window or hand it off as a recurring digest.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className={`btn btn-primary ${exporting ? "loading" : ""}`}
            onClick={handleDownloadCsv}
            disabled={exporting}
          >
            Download CSV
          </button>
          <button
            type="button"
            className={`btn btn-outline ${exporting ? "loading" : ""}`}
            onClick={handlePrintPdf}
            disabled={exporting}
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="modern-panel">
        <h3 className="modern-section-title">Digest delivery</h3>
        <p className="modern-section-copy">
          Keep platform reporting on autopilot with a weekly or monthly summary.
        </p>
        <div className="mt-5 space-y-4">
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-200 px-4 py-3">
            <div>
              <div className="font-medium">Automated email digest</div>
              <div className="text-sm text-base-content/60">
                Send recurring platform summaries without opening the transaction screen.
              </div>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={emailDigestEnabled}
              onChange={(event) =>
                persistDigestPreferences(
                  event.target.checked,
                  emailDigestCadence,
                )
              }
              disabled={digestSaving}
            />
          </label>

          <select
            className="modern-select w-full"
            value={emailDigestCadence}
            onChange={(event) => {
              const nextCadence = event.target.value;
              setEmailDigestCadence(nextCadence);
              persistDigestPreferences(emailDigestEnabled, nextCadence);
            }}
            disabled={digestSaving}
          >
            <option value="monthly">Monthly cadence</option>
            <option value="weekly">Weekly cadence</option>
          </select>

          <button
            type="button"
            className={`btn btn-outline w-full ${emailSending ? "loading" : ""}`}
            onClick={sendDigestNow}
            disabled={emailSending}
          >
            Send digest now
          </button>
        </div>
      </div>
    </div>
  );

  const contentByTab = {
    overview: renderOverview(),
    revenue: renderRevenue(),
    performance: renderPerformance(),
    categories: renderCategories(),
    customers: renderCustomers(),
    exports: renderExports(),
  };

  if (loading) {
    return (
      <div className="modern-shell">
        <div className="modern-container">
          <div className="modern-empty-state">Loading admin reports...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-shell">
        <div className="modern-container">
          <div className="modern-empty-state">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-shell">
      <div className="modern-container">
        <section className="modern-hero">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/65">
                <CalendarRange size={14} />
                Admin Reports
              </div>
              <h1 className="modern-hero-title mt-4">Watch platform health without digging</h1>
              <p className="modern-hero-copy">
                Review platform bookings, realized revenue, top owners, customer value, and export-ready summaries from one dedicated analytics workspace.
              </p>
            </div>

            <div className="modern-subpanel space-y-4">
              <div>
                <div className="modern-stat-label">Report controls</div>
                <p className="mt-2 text-sm text-base-content/65">
                  Apply one report window, then move across overview, revenue, performance, customers, and exports.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="modern-select"
                  value={reportPeriod}
                  onChange={(event) => setReportPeriod(event.target.value)}
                >
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="custom">Custom range</option>
                </select>
                <select
                  className="modern-select"
                  name="status"
                  value={draftFilters.status}
                  onChange={(event) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  className="modern-input"
                  value={draftFilters.startDate}
                  onChange={(event) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      startDate: event.target.value,
                    }))
                  }
                  disabled={reportPeriod !== "custom"}
                />
                <input
                  type="date"
                  className="modern-input"
                  value={draftFilters.endDate}
                  onChange={(event) =>
                    setDraftFilters((prev) => ({
                      ...prev,
                      endDate: event.target.value,
                    }))
                  }
                  disabled={reportPeriod !== "custom"}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleApplyFilters}
                >
                  Display report
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setReportPeriod("month");
                    setDraftFilters({
                      search: "",
                      minAmount: "",
                      maxAmount: "",
                      startDate: "",
                      endDate: "",
                      status: "all",
                    });
                    resetFilters();
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="modern-tabbar">
          {REPORT_TABS.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>

        <div className="mt-6">{contentByTab[activeTab]}</div>
      </div>
    </div>
  );
};

export default AdminReports;
