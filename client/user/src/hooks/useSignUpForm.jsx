import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "./useAxiosInstance";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const passwordRule =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

const registerSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .required("Enter your email")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gm,
      "Enter a valid email"
    ),
  password: yup
    .string()
    .required("Enter your password")
    .matches(
      passwordRule,
      "Password must be 8+ chars with uppercase, lowercase, number, and special character"
    ),
  confirmPassword: yup
    .string()
    .required("Enter your password")
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const useSignUpForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {

    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/api/auth/register",
        data
      );
      const result = await response.data;
      toast.success(result.message);
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`, {
        replace: true,
      });
    } catch (error) {
      if (error.response) {
        toast.error(error.response?.data?.message);
      }
    }finally{
      setLoading(false);
    }
  };

  return { register, handleSubmit, errors, onSubmit, loading };
};

export default useSignUpForm;
