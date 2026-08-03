import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import toast from "react-hot-toast";

import axiosInstance from "./useAxiosInstance";

const ownerRequestSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .required("Enter your email")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gm,
      "Enter a valid email"
    ),
  phone: yup
    .string()
    .required("Enter your phone number")
    .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number")
    .min(10, "Phone number must be at least 10 digits long")
    .max(10, "Phone number must be at most 10 digits long"),
});

const useOwnerRequestForm = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(ownerRequestSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = googleCredential
        ? await axiosInstance.post("/api/owner/auth/google/owner-request", {
            credential: googleCredential,
            phone: data.phone,
          })
        : await axiosInstance.post("/api/owner/auth/ownerRequest", data);
      const result = await response.data;
      toast.success(result.message);
      reset();
      setGoogleCredential(null);
      onSuccess?.();
    } catch (error) {
      if (error.response) {
        toast.error(error.response?.data?.message);
      } else if (error.request) {
        toast.error("No response from server. Please try again later.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    try {
      const credential = credentialResponse?.credential;

      if (!credential) {
        toast.error("Google credential is missing. Please try again.");
        return;
      }

      const response = await axiosInstance.post(
        "/api/owner/auth/google/request-profile",
        { credential }
      );
      const result = await response.data;

      setGoogleCredential(credential);
      setValue("name", result.profile.name, { shouldValidate: true });
      setValue("email", result.profile.email, { shouldValidate: true });
      toast.success("Google profile loaded. Add your phone number and send the request.");
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

  const onGoogleError = () => {
    toast.error("Google verification failed. Please try again.");
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    loading,
    googleCredential,
    onGoogleSuccess,
    onGoogleError,
  };
};

export default useOwnerRequestForm;
