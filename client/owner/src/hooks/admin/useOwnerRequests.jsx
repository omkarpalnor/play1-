import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../useAxiosInstance";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const useOwnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);
  const [allRejectedRequests, setAllRejectedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();

  const currentPath = location.pathname.split("/").pop();

  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      if (term === "") {
        setRequests(allRequests);
        setRejectedRequests(allRejectedRequests);
        return;
      }
      setSearchTerm(term);
      const filtered =
        currentPath === "new"
          ? requests.filter(
              (request) =>
                request.name.toLowerCase().includes(term.toLowerCase()) ||
                request.email.toLowerCase().includes(term.toLowerCase())
            )
          : rejectedRequests.filter(
              (request) =>
                request.name.toLowerCase().includes(term.toLowerCase()) ||
                request.email.toLowerCase().includes(term.toLowerCase())
            );

      if (currentPath === "new") {
        setRequests(filtered);
      } else if (currentPath === "rejected") {
        setRejectedRequests(filtered);
      }
    },
    [allRequests, allRejectedRequests, currentPath, rejectedRequests, requests]
  );

const fetchRequests = async () => {
  setLoading(true);

  try {
    const response = await axiosInstance.get("/api/admin/owners/pending");

    console.log("Pending Owners:", response.data);

    setRequests(response.data);
    setAllRequests(response.data);

    setRejectedRequests([]);
    setAllRejectedRequests([]);
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to fetch owner requests.");
  } finally {
    setLoading(false);
  }
};

 const handleAccept = async (id) => {
  setRequestId(id);

  try {
    const response = await axiosInstance.put(
      `/api/admin/owners/${id}/approve`
    );

    toast.success(response.data.message);

    setRequests((prev) => prev.filter((r) => r.id !== id));
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to approve owner.");
  } finally {
    setRequestId("");
  }
};
  const handleReject = async (id) => {
  setRequestId(id);

  try {
    const response = await axiosInstance.put(
      `/api/admin/owners/${id}/reject`
    );

    toast.success(response.data.message);

    setRequests((prev) => prev.filter((r) => r.id !== id));
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to reject owner.");
  } finally {
    setRequestId("");
  }
};

  const handleReconsider = async (id) => {
    setRequestId(id);
    try {
      const response = await axiosInstance.put(
        `/api/admin/owner-requests/reconsider/${id}`
      );
      const result = await response.data;
      toast.success(result.message);
      setRejectedRequests(
        rejectedRequests.filter((request) => request.id !== id)
      );
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setRequestId("");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return {
    requests,
    loading,
    handleAccept,
    handleReject,
    requestId,
    rejectedRequests,
    handleReconsider,
    searchTerm,
    handleSearch,
  };
};

export default useOwnerRequests;
