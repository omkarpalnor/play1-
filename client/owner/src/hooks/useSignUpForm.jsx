import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState } from "react";
import axiosInstance from "./useAxiosInstance";
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
  phone: yup
  .string()
  .required("Phone number is required")
  .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),

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
  const navigate = useNavigate();
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
      const response = await axiosInstance.post("/api/auth/register", {
  name: data.name,
  email: data.email,
  phone: data.phone,
  password: data.password,
});
        
    } catch (error){
       if (error.response) {
        // Server responded with a status other than 200 range
        toast.error(
          `${error.response.data.message || "Registration failed"}`
        );
      } else if (error.request) {
        // Request was made but no response was received
        toast.error("No response from server. Please try again later.");
      } else {
        // Something else caused the error
        toast.error(`Error: ${error.message}`);
      }
    }
     finally {
      setLoading(false);
    }
  };

  return { register, handleSubmit, errors, onSubmit, loading };
};

export default useSignUpForm;
