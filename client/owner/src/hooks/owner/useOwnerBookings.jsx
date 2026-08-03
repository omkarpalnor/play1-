import { useState, useEffect, useMemo } from "react";
import axiosInstance from "../useAxiosInstance";

const useOwnerBookings = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDays, setFilterDays] = useState(30);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/owner/bookings");
      const result = response.data;
      setAllBookings(result);
      setLoading(false);
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to fetch bookings");
      }
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    const hasCustomRange = customStartDate || customEndDate;

    if (hasCustomRange) {
      return allBookings.filter((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        const startOk =
          !customStartDate || bookingDate >= new Date(customStartDate);
        const endDate = customEndDate ? new Date(customEndDate) : null;
        if (endDate) {
          endDate.setHours(23, 59, 59, 999);
        }
        const endOk = !endDate || bookingDate <= endDate;
        const statusOk =
          statusFilter === "all" || booking.status === statusFilter;

        return startOk && endOk && statusOk;
      });
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filterDays);
    return allBookings.filter((booking) => {
      const statusOk = statusFilter === "all" || booking.status === statusFilter;
      return new Date(booking.bookingDate) >= cutoffDate && statusOk;
    });
  }, [allBookings, filterDays, customStartDate, customEndDate, statusFilter]);

  const sortedBookings = useMemo(() => {
    let sortableBookings = [...filteredBookings];
    if (sortConfig !== null) {
      sortableBookings.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableBookings;
  }, [filteredBookings, sortConfig]);

  const bookingStats = useMemo(() => {
    const stats = filteredBookings.reduce(
      (acc, booking) => {
        if (booking.status === "cancelled") {
          acc.cancelled += 1;
        } else {
          acc.confirmed += 1;
          acc.revenue += booking.totalPrice || 0;
        }
        return acc;
      },
      { confirmed: 0, cancelled: 0, revenue: 0 }
    );

    return {
      total: filteredBookings.length,
      confirmed: stats.confirmed,
      cancelled: stats.cancelled,
      revenue: stats.revenue,
    };
  }, [filteredBookings]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const resetFilters = () => {
    setFilterDays(30);
    setCustomStartDate("");
    setCustomEndDate("");
    setStatusFilter("all");
  };

  return {
    bookings: sortedBookings,
    loading,
    error,
    fetchBookings,
    filterDays,
    setFilterDays,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    statusFilter,
    setStatusFilter,
    resetFilters,
    sortConfig,
    requestSort,
    bookingStats,
  };
};

export default useOwnerBookings;
