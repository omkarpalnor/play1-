import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import axiosInstance from "@hooks/useAxiosInstance";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Button, FormField } from "@components/common";

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
        `/api/owner/auth/reset-password/${token}`,
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
    <div className="modern-auth-shell">
      <div className="modern-auth-content">
        <aside className="modern-auth-aside">
          <div className="modern-auth-badge">
            <LockKeyhole size={14} />
            Secure reset
          </div>
          <h1 className="modern-auth-title">Create a new password for your owner account.</h1>
          <p className="modern-auth-copy">
            Choose a strong password you haven&apos;t used recently so your PlayRizon access stays secure.
          </p>
          <div className="mt-8 modern-info-card flex items-start gap-3">
            <div className="rounded-2xl bg-success/10 p-3 text-success">
              <ShieldCheck size={18} />
            </div>
            <p className="text-sm leading-6 text-base-content/70">
              After reset, you&apos;ll be redirected to login and can enter the dashboard with the new credentials.
            </p>
          </div>
        </aside>
        <section className="modern-auth-card max-w-md justify-self-center">
          <h2 className="text-2xl font-semibold">Reset Password</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Set the new password that will be used for PlayRizon owner login.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <FormField
              label="New Password"
              name="password"
              type="password"
              register={register}
              error={errors.password}
              placeholder="Create a strong password"
            />
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              register={register}
              error={errors.confirmPassword}
              placeholder="Repeat your password"
            />
            <div className="pt-2">
              <Button type="submit" className="btn-primary w-full" loading={loading}>
                Update Password
              </Button>
            </div>
          </form>
          <div className="text-center mt-4">
            <Link to="/login" className="link link-hover">
              Back to login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResetPassword;
