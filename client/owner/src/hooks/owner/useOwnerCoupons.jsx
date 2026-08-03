import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../useAxiosInstance";

const useOwnerCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const lastErrorRef = useRef({ message: "", at: 0 });

  const showLoadError = (message) => {
    const now = Date.now();
    if (
      lastErrorRef.current.message === message &&
      now - lastErrorRef.current.at < 2500
    ) {
      return;
    }
    lastErrorRef.current = { message, at: now };
    toast.error(message);
  };

  const fetchCouponsFromEndpoint = async (endpoint) => {
    const { data } = await axiosInstance.get(endpoint);
    if (Array.isArray(data)) {
      return data;
    }
    return data?.coupons || [];
  };

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchCouponsFromEndpoint("/api/owner/coupons");
      setCoupons(list);
    } catch (e) {
      // Backward-compatible fallback for environments using singular route.
      try {
        const list = await fetchCouponsFromEndpoint("/api/owner/coupon");
        setCoupons(list);
      } catch (fallbackError) {
        showLoadError(
          fallbackError?.response?.data?.message ||
            e?.response?.data?.message ||
            "Failed to load coupons"
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createCoupon = async (payload) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/api/owner/coupons", payload);
      toast.success("Coupon created");
      setCoupons((prev) => [data.coupon, ...prev]);
      return data.coupon;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to create coupon");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const toggleCoupon = async (couponId, isActive) => {
    try {
      const { data } = await axiosInstance.patch(`/api/owner/coupons/${couponId}`, {
        isActive,
      });
      setCoupons((prev) =>
        prev.map((c) => (c._id === couponId ? data.coupon : c))
      );
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update coupon");
    }
  };

  const deleteCoupon = async (couponId) => {
    try {
      await axiosInstance.delete(`/api/owner/coupons/${couponId}`);
      toast.success("Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete coupon");
    }
  };

  return {
    coupons,
    loading,
    fetchCoupons,
    createCoupon,
    toggleCoupon,
    deleteCoupon,
  };
};

export default useOwnerCoupons;

