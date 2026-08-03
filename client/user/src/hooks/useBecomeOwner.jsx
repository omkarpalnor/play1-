import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "./useAxiosInstance";

const becomeOwnerSchema = yup.object().shape({
  businessName: yup.string().required("Business Name is required"),
  ownerName: yup.string().required("Owner Name is required"),

  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),

  phone: yup
    .string()
    .matches(/^[0-9]{10}$/, "Enter a valid 10 digit phone number")
    .required("Phone number is required"),

  address: yup.string().required("Address is required"),

  city: yup.string().required("City is required"),

  state: yup.string().required("State is required"),

  pincode: yup
    .string()
    .matches(/^[0-9]{6}$/, "Enter a valid 6 digit pincode")
    .required("Pincode is required"),

  aadhaarNumber: yup.string().nullable(),

  panNumber: yup.string().nullable(),

  gstNumber: yup.string().nullable(),
});

const useBecomeOwner = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(becomeOwnerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/api/owner/apply",
        data
      );

      toast.success(response.data.message);

      navigate("/auth");
    } catch (error) {
      console.log(error);

      if (error.response) {
        console.log(error.response.data);

        toast.error(
          error.response.data.message ||
            "Unable to submit owner application."
        );
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

export default useBecomeOwner;