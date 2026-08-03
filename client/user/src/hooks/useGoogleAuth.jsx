import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import axiosInstance from "./useAxiosInstance";
import { login } from "../redux/slices/authSlice";

const useGoogleAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

      dispatch(login(result.token));
      axiosInstance.defaults.headers.common.Authorization = `Bearer ${result.token}`;
      toast.success(result.message);
      navigate("/auth", { replace: true });
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

export default useGoogleAuth;
