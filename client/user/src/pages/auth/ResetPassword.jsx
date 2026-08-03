import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import axiosInstance from "../../hooks/useAxiosInstance";
import FormField from "../../components/common/FormField";
import Button from "../../components/common/Button";

const resetSchema = yup.object().shape({
  password: yup
    .string()
    .required("Enter your password")
    .min(8, "Password must be at least 8 characters long"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm your password"),
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/api/user/auth/reset-password/${token}`,
        data
      );
      toast.success(response?.data?.message || "Password reset successful");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen max-md:p-4 bg-base-200 p-4">
      <div className="card w-full border md:w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Reset Password</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="New Password"
              name="password"
              type="password"
              register={register}
              error={errors.password}
            />
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              register={register}
              error={errors.confirmPassword}
            />
            <div className="form-control mt-6">
              <Button type="submit" className="btn-primary" loading={loading}>
                Update Password
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

export default ResetPassword;
