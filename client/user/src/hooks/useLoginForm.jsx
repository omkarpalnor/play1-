import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import axiosInstance from "./useAxiosInstance";
import { login } from "../redux/slices/authSlice";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .required("Enter your email")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Enter a valid email"
    ),
  password: yup
    .string()
    .required("Enter your password")
    .min(6, "Password must be at least 6 characters long"),
});

const useLoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
  setLoading(true);

  try {
    const response = await axiosInstance.post("/api/auth/login", data);
    const result = response.data;

    console.log("Login Response:", result);

    dispatch(
      login({
        token: result.token,
        role: result.role,
      })
    );

    axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${result.token}`;

    toast.success(result.message);

    const role = result.role?.toLowerCase();

    if (role === "admin") {
      window.location.href = "http://localhost:5174/admin";
    } else if (role === "owner") {
      window.location.href = "http://localhost:5174";
    } else {
      navigate("/", { replace: true });
    }
  } catch (error) {
    console.error(error);

    if (error.response) {
      toast.error(error.response.data?.message || "Login failed");
    } else {
      toast.error("Server not responding.");
    }
  } finally {
    setLoading(false);
  }
};

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    loading,
  };
};

export default useLoginForm;