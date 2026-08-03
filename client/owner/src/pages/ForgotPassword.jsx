import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";
import axiosInstance from "@hooks/useAxiosInstance";
import { KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { Button, FormField } from "@components/common";

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
        "/api/owner/auth/forgot-password",
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
    <div className="modern-auth-shell">
      <div className="modern-auth-content">
        <aside className="modern-auth-aside">
          <div className="modern-auth-badge">
            <KeyRound size={14} />
            Password recovery
          </div>
          <h1 className="modern-auth-title">Recover your PlayRizon owner access.</h1>
          <p className="modern-auth-copy">
            Enter the approved owner email and we&apos;ll send a secure reset link so you can get back into your dashboard quickly.
          </p>
          <div className="mt-8 space-y-4">
            <div className="modern-info-card flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <MailCheck size={18} />
              </div>
              <p className="text-sm leading-6 text-base-content/70">Reset links are delivered to your registered owner inbox.</p>
            </div>
            <div className="modern-info-card flex items-start gap-3">
              <div className="rounded-2xl bg-success/10 p-3 text-success">
                <ShieldCheck size={18} />
              </div>
              <p className="text-sm leading-6 text-base-content/70">Use the latest link you receive if you request more than one reset email.</p>
            </div>
          </div>
        </aside>
        <section className="modern-auth-card max-w-md justify-self-center">
          <h2 className="text-2xl font-semibold">Forgot Password</h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Enter your email to receive a password reset link.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <FormField
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              placeholder="owner@example.com"
            />
            <div className="pt-2">
              <Button type="submit" className="btn-primary w-full" loading={loading}>
                Send Reset Link
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

export default ForgotPassword;
