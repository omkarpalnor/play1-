import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
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
import useOwnerBookings from "@hooks/owner/useOwnerBookings";
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

const getCurrentRange = (reportPeriod, startDate, endDate) => {
  const now = new Date();
  const end = endDate ? new Date(endDate) : now;
  const start = startDate
    ? new Date(startDate)
    : reportPeriod === "week"
      ? new Date(new Date(end).setDate(end.getDate() - 7))
      : new Date(new Date(end).setDate(end.getDate() - 30));

  return { start, end };
};

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

const getBookingCategory = (booking) =>
  getPrimaryCategoryConfig(booking?.primaryCategory, booking?.sportTypes || []);

const OwnerReports = () => {
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
  } = useOwnerBookings();

  const [activeTab, setActiveTab] = useState("overview");
  const [reportPeriod, setReportPeriod] = useState("month");
  const [emailDigestEnabled, setEmailDigestEnabled] = useState(false);
  const [emailDigestCadence, setEmailDigestCadence] = useState("monthly");
  const [emailSending, setEmailSending] = useState(false);
  const [digestSaving, setDigestSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [draftStatus, setDraftStatus] = useState(statusFilter);
  const [draftStartDate, setDraftStartDate] = useState(customStartDate);
  const [draftEndDate, setDraftEndDate] = useState(customEndDate);

  useEffect(() => {
    setDraftStatus(statusFilter);
    setDraftStartDate(customStartDate);
    setDraftEndDate(customEndDate);
  }, [statusFilter, customStartDate, customEndDate]);

  useEffect(() => {
    const loadDigestPreferences = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/owner/bookings/report/preferences",
        );
        const prefs = response.data?.preferences;
        setEmailDigestEnabled(Boolean(prefs?.enabled));
        setEmailDigestCadence(prefs?.cadence || "monthly");
      } catch (loadError) {
        console.error("Failed to load owner digest preferences", loadError);
      }
    };

    loadDigestPreferences();
  }, []);

  const persistDigestPreferences = useCallback(async (nextEnabled, nextCadence) => {
    try {
      setDigestSaving(true);
      const response = await axiosInstance.patch(
        "/api/owner/bookings/report/preferences",
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
  }, []);

  const applyPeriodToDates = useCallback(() => {
    const now = new Date();
    const start = new Date(now);
    if (reportPeriod === "week") {
      start.setDate(now.getDate() - 7);
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
      };
    }
    if (reportPeriod === "month") {
      start.setDate(now.getDate() - 30);
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate: now.toISOString().slice(0, 10),
      };
    }
    return {
      startDate: draftStartDate,
      endDate: draftEndDate,
    };
  }, [draftEndDate, draftStartDate, reportPeriod]);

  const handleApplyFilters = () => {
    const nextRange = applyPeriodToDates();
    setCustomStartDate(nextRange.startDate || "");
    setCustomEndDate(nextRange.endDate || "");
    setStatusFilter(draftStatus || "all");
  };

  const buildOwnerReportParams = useCallback(() => {
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
  }, [customEndDate, customStartDate, filterDays, statusFilter]);

  const fetchOwnerReport = useCallback(async () => {
    const response = await axiosInstance.get("/api/owner/bookings/report", {
      params: buildOwnerReportParams(),
    });
    return response.data;
  }, [buildOwnerReportParams]);

  const reportHeaders = useMemo(
    () => [
      { key: "turf", label: "Turf" },
      { key: "category", label: "Category" },
      { key: "user", label: "User" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status" },
      { key: "duration", label: "Duration (hrs)" },
      { key: "price", label: "Price (INR)" },
    ],
    [],
  );

  const mapOwnerReportRows = useCallback(
    (records) =>
      (records || []).map((booking) => ({
        turf: booking.turfName,
        category: getBookingCategory(booking).label,
        user: booking.userName,
        date: format(new Date(booking.bookingDate), "dd MMM yyyy"),
        status: booking.status,
        duration: Number(booking.duration || 0).toFixed(2),
        price: booking.totalPrice,
      })),
    [],
  );

  const compareSummary = useMemo(() => {
    const { start, end } = getCurrentRange(
      reportPeriod,
      customStartDate,
      customEndDate,
    );
    const duration = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - duration);
    const inRange = (booking, rangeStart, rangeEnd) => {
      const value = new Date(booking.bookingDate);
      return value >= rangeStart && value <= rangeEnd;
    };
    const summarize = (rows) =>
      rows.reduce(
        (acc, booking) => {
          acc.total += 1;
          if (booking.status === "cancelled") {
            acc.cancelled += 1;
          } else {
            acc.confirmed += 1;
            acc.revenue += Number(booking.totalPrice || 0);
          }
          return acc;
        },
        { total: 0, confirmed: 0, cancelled: 0, revenue: 0 },
      );

    const current = summarize(bookings.filter((b) => inRange(b, start, end)));
    const previous = summarize(
      bookings.filter((b) => inRange(b, previousStart, previousEnd)),
    );
    const percent = (currentValue, previousValue) =>
      previousValue
        ? (((currentValue - previousValue) / previousValue) * 100).toFixed(1)
        : currentValue > 0
          ? "100.0"
          : "0.0";

    return {
      totalPct: percent(current.total, previous.total),
      revenuePct: percent(current.revenue, previous.revenue),
      cancelledPct: percent(current.cancelled, previous.cancelled),
    };
  }, [bookings, customEndDate, customStartDate, reportPeriod]);

  const trendData = useMemo(() => {
    const dailyMap = new Map();

    bookings.forEach((booking) => {
      const key = new Date(booking.bookingDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      if (!dailyMap.has(key)) {
        dailyMap.set(key, { label: key, bookings: 0, revenue: 0 });
      }
      const row = dailyMap.get(key);
      row.bookings += 1;
      if (booking.status !== "cancelled") {
        row.revenue += Number(booking.totalPrice || 0);
      }
    });

    return Array.from(dailyMap.values()).slice(-14);
  }, [bookings]);

  const analytics = useMemo(() => {
    const total = bookings.length;
    const confirmedRows = bookings.filter((booking) => booking.status !== "cancelled");
    const cancelledRows = bookings.filter((booking) => booking.status === "cancelled");
    const totalRevenue = confirmedRows.reduce(
      (sum, booking) => sum + Number(booking.totalPrice || 0),
      0,
    );
    const cancelledValue = cancelledRows.reduce(
      (sum, booking) => sum + Number(booking.totalPrice || 0),
      0,
    );
    const confirmationRate = total ? (confirmedRows.length / total) * 100 : 0;
    const averageBookingValue = confirmedRows.length
      ? totalRevenue / confirmedRows.length
      : 0;
    const averageDuration = confirmedRows.length
      ? confirmedRows.reduce(
          (sum, booking) => sum + Number(booking.duration || 0),
          0,
        ) / confirmedRows.length
      : 0;

    const statusMap = new Map();
    const weekdayMap = new Map(
      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => [
        day,
        { day, bookings: 0 },
      ]),
    );
    const turfMap = new Map();
    const customerMap = new Map();
    const categoryMap = new Map();

    bookings.forEach((booking) => {
      const status = booking.status || "confirmed";
      const category = getBookingCategory(booking);
      statusMap.set(status, (statusMap.get(status) || 0) + 1);

      const day = new Date(booking.bookingDate).toLocaleDateString("en-US", {
        weekday: "short",
      });
      if (weekdayMap.has(day)) {
        weekdayMap.get(day).bookings += 1;
      }

      const turfName = booking.turfName || "Unknown turf";
      if (!turfMap.has(turfName)) {
        turfMap.set(turfName, {
          name: turfName,
          bookings: 0,
          revenue: 0,
          cancellations: 0,
        });
      }
      const turfEntry = turfMap.get(turfName);
      turfEntry.bookings += 1;
      if (status === "cancelled") {
        turfEntry.cancellations += 1;
      } else {
        turfEntry.revenue += Number(booking.totalPrice || 0);
      }

      const customer = booking.userName || "Unknown user";
      if (!customerMap.has(customer)) {
        customerMap.set(customer, {
          name: customer,
          bookings: 0,
          spend: 0,
          cancellations: 0,
        });
      }
      const customerEntry = customerMap.get(customer);
      customerEntry.bookings += 1;
      if (status === "cancelled") {
        customerEntry.cancellations += 1;
      } else {
        customerEntry.spend += Number(booking.totalPrice || 0);
      }

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
      if (status === "cancelled") {
        categoryEntry.cancelled += 1;
      } else {
        categoryEntry.revenue += Number(booking.totalPrice || 0);
      }
    });

    const turfPerformance = Array.from(turfMap.values()).sort(
      (a, b) => b.revenue - a.revenue || b.bookings - a.bookings,
    );
    const topCustomers = Array.from(customerMap.values()).sort(
      (a, b) => b.spend - a.spend || b.bookings - a.bookings,
    );
    const statusDistribution = Array.from(statusMap.entries()).map(
      ([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }),
    );
    const weekdayData = Array.from(weekdayMap.values());
    const categoryPerformance = Array.from(categoryMap.values())
      .map((entry) => ({
        ...entry,
        cancellationRate: entry.bookings
          ? (entry.cancelled / entry.bookings) * 100
          : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings);
    const busiestDay = weekdayData.reduce(
      (best, entry) => (entry.bookings > best.bookings ? entry : best),
      { day: "N/A", bookings: 0 },
    );

    return {
      confirmationRate,
      averageBookingValue,
      averageDuration,
      cancelledValue,
      topTurf: turfPerformance[0] || null,
      turfPerformance: turfPerformance.slice(0, 5),
      topCustomers: topCustomers.slice(0, 5),
      statusDistribution,
      weekdayData,
      categoryPerformance,
      topCategory: categoryPerformance[0] || null,
      busiestDay,
      revenue: totalRevenue,
    };
  }, [bookings]);

  const handleDownloadCsv = async () => {
    try {
      setExporting(true);
      const report = await fetchOwnerReport();
      downloadCsvReport({
        fileName: `owner-booking-report-${Date.now()}.csv`,
        headers: reportHeaders,
        rows: mapOwnerReportRows(report.bookings),
      });
      toast.success("CSV report downloaded");
    } catch (downloadError) {
      console.error("CSV download failed:", downloadError);
      toast.error("Failed to download CSV report");
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
        fileName: `owner-booking-report-${Date.now()}.pdf`,
        reportLabel: "PlayRizon Owner Analytics",
        subtitle:
          "A branded performance pack covering bookings, revenue, customers, and category performance for the selected reporting window.",
        headers: reportHeaders,
        rows: mapOwnerReportRows(report.bookings),
        summary: [
          { label: "Total", value: bookingStats.total },
          { label: "Confirmed", value: bookingStats.confirmed },
          { label: "Cancelled", value: bookingStats.cancelled },
          { label: "Revenue", value: formatCurrency(bookingStats.revenue) },
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
          { label: "Status", value: draftStatus || "all" },
          {
            label: "Date range",
            value:
              customStartDate || customEndDate
                ? `${customStartDate || "Start"} to ${customEndDate || "Now"}`
                : `${filterDays} day rolling window`,
          },
        ],
        highlights: [
          {
            label: "Confirmation rate",
            value: `${analytics.confirmationRate.toFixed(1)}%`,
            note: "Share of bookings that completed without cancellation.",
          },
          {
            label: "Top category",
            value: analytics.topCategory?.name || "No category data",
            note: analytics.topCategory
              ? `${formatCurrency(analytics.topCategory.revenue)} realized revenue`
              : "No realized revenue yet in this window.",
          },
          {
            label: "Busiest weekday",
            value: analytics.busiestDay.day,
            note: `${analytics.busiestDay.bookings} bookings in the selected range.`,
          },
          {
            label: "Top customer",
            value: analytics.topCustomers[0]?.name || "No customer data",
            note: analytics.topCustomers[0]
              ? `${formatCurrency(analytics.topCustomers[0].spend)} realized spend`
              : "No customer activity yet in this window.",
          },
        ],
        sections: [
          {
            title: "Category Performance",
            description:
              "Category-wise demand, realized revenue, and cancellation pressure for the selected report window.",
            headers: [
              "Category",
              "Bookings",
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
            title: "Top Turf Performance",
            description:
              "Venue leaders ranked by realized revenue and total booking count.",
            headers: ["Turf", "Bookings", "Revenue", "Cancelled"],
            rows: analytics.turfPerformance.map((item) => [
              item.name,
              String(item.bookings),
              formatCurrency(item.revenue),
              String(item.cancellations),
            ]),
          },
          {
            title: "Top Customers",
            description:
              "Highest-value customers in the active report window.",
            headers: ["Customer", "Bookings", "Realized Spend", "Cancelled"],
            rows: analytics.topCustomers.map((item) => [
              item.name,
              String(item.bookings),
              formatCurrency(item.spend),
              String(item.cancellations),
            ]),
          },
        ],
      });
      toast.success("PDF report generated");
    } catch (printError) {
      console.error("PDF generation failed:", printError);
      toast.error("Failed to generate PDF report");
    } finally {
      setExporting(false);
    }
  };

  const sendDigestNow = async () => {
    try {
      setEmailSending(true);
      await axiosInstance.post("/api/owner/bookings/report/email", {
        cadence: emailDigestCadence,
        status: statusFilter || "all",
      });
      toast.success("Owner digest sent");
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
          <MetricCard label="Total bookings" value={bookingStats.total} />
          <MetricCard label="Confirmed" value={bookingStats.confirmed} />
          <MetricCard label="Cancelled" value={bookingStats.cancelled} />
          <MetricCard
            label="Revenue"
            value={formatCurrency(bookingStats.revenue)}
          />
          <MetricCard
            label="Confirmation rate"
            value={`${analytics.confirmationRate.toFixed(1)}%`}
          />
          <MetricCard
            label="Busiest weekday"
            value={analytics.busiestDay.day}
            help={`${analytics.busiestDay.bookings} bookings in range`}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="modern-panel">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="modern-section-title">Trend snapshot</h3>
              <p className="modern-section-copy">
                Daily booking and revenue movement across the current report window.
              </p>
            </div>
            <div className="text-right text-sm text-base-content/65">
              <div>Bookings: {compareSummary.totalPct}%</div>
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
          <h3 className="modern-section-title">Status mix</h3>
          <p className="modern-section-copy">
            Quick read on whether booking demand is translating into healthy completion.
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
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="modern-section-title">Turf revenue leaders</h3>
            <p className="modern-section-copy">
              See which turfs are actually turning demand into realized revenue.
            </p>
          </div>
          {analytics.topTurf ? (
            <div className="text-right text-sm text-base-content/65">
              <div className="font-semibold text-base-content">
                {analytics.topTurf.name}
              </div>
              <div>{formatCurrency(analytics.topTurf.revenue)} realized</div>
            </div>
          ) : null}
        </div>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.turfPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6">
        <MetricCard
          label="Average booking value"
          value={formatCurrency(analytics.averageBookingValue)}
          help="Average realized amount from confirmed bookings in the current view."
        />
        <MetricCard
          label="Cancelled value"
          value={formatCurrency(analytics.cancelledValue)}
          help="Potential value sitting inside cancelled bookings."
        />
        <MetricCard
          label="Average duration"
          value={`${analytics.averageDuration.toFixed(1)} hrs`}
          help="Useful for spotting whether the current period skews toward longer bookings."
        />
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="modern-panel">
        <h3 className="modern-section-title">Weekday demand pattern</h3>
        <p className="modern-section-copy">
          Spot which weekdays deserve pricing, staffing, and promo attention.
        </p>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.weekdayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="modern-panel">
        <h3 className="modern-section-title">Top turf list</h3>
        <p className="modern-section-copy">
          A ranked list of the venues carrying booking volume in the filtered set.
        </p>
        <div className="mt-4 space-y-3">
          {analytics.turfPerformance.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.name}</div>
                <div className="text-sm text-base-content/60">
                  {item.bookings} bookings • {item.cancellations} cancelled
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{formatCurrency(item.revenue)}</div>
                <div className="text-base-content/60">realized revenue</div>
              </div>
            </div>
          ))}
          {analytics.turfPerformance.length === 0 ? (
            <div className="modern-empty-state">
              No turf performance data matches the current report filters.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="modern-panel">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="modern-section-title">Revenue by category</h3>
            <p className="modern-section-copy">
              See which turf categories are converting demand into revenue most effectively.
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
          A ranked view of booking volume, revenue, and cancellation rate by category.
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
                  {item.bookings} bookings • {item.cancelled} cancelled
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
              No category performance data matches the current report filters.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="modern-panel">
        <h3 className="modern-section-title">Top customers</h3>
        <p className="modern-section-copy">
          Understand who is driving repeat value in the current report window.
        </p>
        <div className="mt-4 space-y-3">
          {analytics.topCustomers.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-base-300 bg-base-200 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{item.name}</div>
                <div className="text-sm text-base-content/60">
                  {item.bookings} bookings • {item.cancellations} cancelled
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-semibold">{formatCurrency(item.spend)}</div>
                <div className="text-base-content/60">realized spend</div>
              </div>
            </div>
          ))}
          {analytics.topCustomers.length === 0 ? (
            <div className="modern-empty-state">
              No customer activity matches the current filters yet.
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6">
        <MetricCard
          label="Average customer value"
          value={
            analytics.topCustomers.length
              ? formatCurrency(
                  analytics.topCustomers.reduce((sum, entry) => sum + entry.spend, 0) /
                    analytics.topCustomers.length,
                )
              : formatCurrency(0)
          }
          help="Average realized spend across the current top-customer slice."
        />
        <MetricCard
          label="Top-customer bookings"
          value={analytics.topCustomers.reduce((sum, entry) => sum + entry.bookings, 0)}
          help="Combined booking count among your highest-value customers in this view."
        />
      </div>
    </div>
  );

  const renderExports = () => (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
      <div className="modern-panel">
        <h3 className="modern-section-title">Export center</h3>
        <p className="modern-section-copy">
          Deliver the current report window as CSV, PDF, or scheduled email digest.
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
          Keep owner reporting on autopilot with a weekly or monthly summary.
        </p>
        <div className="mt-5 space-y-4">
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-base-300 bg-base-200 px-4 py-3">
            <div>
              <div className="font-medium">Automated email digest</div>
              <div className="text-sm text-base-content/60">
                Send recurring report summaries without opening the dashboard.
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
          <div className="modern-empty-state">Loading owner reports...</div>
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
                Owner Reports
              </div>
              <h1 className="modern-hero-title mt-4">See venue performance in one place</h1>
              <p className="modern-hero-copy">
                Track booking health, revenue movement, top customers, and export-ready summaries without leaving the owner workspace.
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
                  value={draftStatus}
                  onChange={(event) => setDraftStatus(event.target.value)}
                >
                  <option value="all">All statuses</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <input
                  type="date"
                  className="modern-input"
                  value={draftStartDate}
                  onChange={(event) => setDraftStartDate(event.target.value)}
                  disabled={reportPeriod !== "custom"}
                />
                <input
                  type="date"
                  className="modern-input"
                  value={draftEndDate}
                  onChange={(event) => setDraftEndDate(event.target.value)}
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
                    setDraftStatus("all");
                    setDraftStartDate("");
                    setDraftEndDate("");
                    setStatusFilter("all");
                    setCustomStartDate("");
                    setCustomEndDate("");
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

export default OwnerReports;
