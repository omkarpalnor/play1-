import { useState, useMemo, useEffect } from "react";

const useTransactionManagement = (initialTransactions) => {
  const [transactions, setTransactions] = useState([]);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filters, setFilters] = useState({
    search: "",
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
    status: "all",
  });

  useEffect(() => {
     setTransactions(initialTransactions || []);
  }, [initialTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = (nextFilters) => {
    setFilters((prev) => ({ ...prev, ...(nextFilters || {}) }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      minAmount: "",
      maxAmount: "",
      startDate: "",
      endDate: "",
      status: "all",
    });
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredAndSortedTransactions = useMemo(() => {
 

    try {
      const filtered = transactions.filter((transaction) => {
        const searchLower = (filters.search || "").toLowerCase().trim();
        const userName = String(transaction?.user?.name || "").toLowerCase();
        const turfName = String(transaction?.turf?.name || "").toLowerCase();
        const orderId = String(transaction?.payment?.orderId || "").toLowerCase();
        const paymentId = String(transaction?.payment?.paymentId || "").toLowerCase();
        const matchesSearch =
          !searchLower ||
          userName.includes(searchLower) ||
          turfName.includes(searchLower) ||
          orderId.includes(searchLower) ||
          paymentId.includes(searchLower);

        const withinPriceRange =
          (!filters.minAmount ||
            (Number(transaction?.totalPrice) || 0) >= Number(filters.minAmount)) &&
          (!filters.maxAmount ||
            (Number(transaction?.totalPrice) || 0) <= Number(filters.maxAmount));

        const withinDateRange =
          (!filters.startDate ||
            new Date(transaction.createdAt) >= new Date(filters.startDate)) &&
          (!filters.endDate ||
            new Date(transaction.createdAt) <= new Date(filters.endDate));

        const status = transaction.status || "confirmed";
        const matchesStatus =
          filters.status === "all" || status === filters.status;

        return (
          matchesSearch &&
          withinPriceRange &&
          withinDateRange &&
          matchesStatus
        );
      });

      const sorted = [...filtered].sort((a, b) => {
        if (sortField === "createdAt") {
          return sortDirection === "asc"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortField === "totalPrice") {
          return sortDirection === "asc"
            ? (Number(a.totalPrice) || 0) - (Number(b.totalPrice) || 0)
            : (Number(b.totalPrice) || 0) - (Number(a.totalPrice) || 0);
        }
        return 0;
      });

       return sorted;
    } catch (error) {
      console.error("Error in filtering and sorting:", error);
      return [];
    }
  }, [transactions, filters, sortField, sortDirection]);

  const transactionSummary = useMemo(() => {
    return filteredAndSortedTransactions.reduce(
      (acc, transaction) => {
        const status = transaction.status || "confirmed";
        acc.total += 1;
        if (status === "cancelled") {
          acc.cancelled += 1;
          acc.cancelledValue += transaction.totalPrice || 0;
        } else {
          acc.confirmed += 1;
          acc.revenue += transaction.totalPrice || 0;
        }
        return acc;
      },
      {
        total: 0,
        confirmed: 0,
        cancelled: 0,
        revenue: 0,
        cancelledValue: 0,
      }
    );
  }, [filteredAndSortedTransactions]);

  return {
    filters,
    sortField,
    sortDirection,
    filteredAndSortedTransactions,
    transactionSummary,
    handleFilterChange,
    applyFilters,
    resetFilters,
    toggleSort,
  };
};

export default useTransactionManagement;
