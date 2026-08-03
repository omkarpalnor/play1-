import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../useAxiosInstance";
import toast from "react-hot-toast";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
     const response = await axiosInstance.get("/api/Admin/users");
const result = response.data;

setUsers(result);
setFilteredUsers(result);
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term);
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(term.toLowerCase()) ||
          user.email.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredUsers(filtered);
    },
    [users]
  );

  const approveDeleteRequest = async (userId) => {
    setActionUserId(userId);
    try {
      const response = await axiosInstance.post(
        `/api/admin/users/${userId}/delete-request/approve`
      );
      toast.success(response?.data?.message || "Delete request approved");
      await fetchUsers();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to approve delete request"
      );
    } finally {
      setActionUserId(null);
    }
  };

  return {
    users: filteredUsers,
    loading,
    searchTerm,
    handleSearch,
    approveDeleteRequest,
    actionUserId,
  };
};

export default useUsers;
