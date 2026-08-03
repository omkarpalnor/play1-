import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import axiosInstance from "../../hooks/useAxiosInstance";
import FormField from "../../components/common/FormField";
import Button from "../../components/common/Button";

const forgotSchema = yup.object().shape({
  email: yup
    .string()
    .required("Enter your email")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/gm,
      "Enter a valid email"
    ),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(forgotSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        "/api/user/auth/forgot-password",
        data
      );
      toast.success(response?.data?.message || "Reset link sent to your email");
      reset();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen max-md:p-4 bg-base-200 p-4">
      <div className="card w-full border md:w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Forgot Password</h2>
          <p className="text-sm text-center opacity-80">
            Enter your email and we will send you a password reset link.
          </p>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
            />
            <div className="form-control mt-6">
              <Button type="submit" className="btn-primary" loading={loading}>
                Send Reset Link
              </Button>
            </div>
          </form>
          <div className="text-center mt-4">
            <Link to="/login" className="link link-hover">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
