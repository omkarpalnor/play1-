import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import axiosInstance from "./useAxiosInstance";
import { login } from "../redux/slices/authSlice";

const resolveOwnerDestination = (role) => {
  if (role === "admin") {
    return "/admin";
  }

  return "/owner";
};

const useGoogleOwnerAuth = (mode = "login") => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const endpoint =
    mode === "register"
      ? "/api/owner/auth/google/register"
      : "/api/owner/auth/google/login";

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse?.credential;

      if (!credential) {
        toast.error("Google credential is missing. Please try again.");
        return;
      }

    const response = await axiosInstance.post("/api/auth/google-login", {
    credential,
});
      const result = await response.data;

      dispatch(login({ token: result.token, role: result.role }));
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${result.token}`;
      toast.success(result.message);
      navigate(resolveOwnerDestination(result.role), { replace: true });
    } catch (error) {
      if (error.response) {
        toast.error(error.response?.data?.message);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error(error.message);
      }
    }
  };

  const handleGoogleError = () => {
    toast.error("Google authentication failed. Please try again.");
  };

  return {
    handleGoogleSuccess,
    handleGoogleError,
  };
};

export default useGoogleOwnerAuth;
