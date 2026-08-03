import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../hooks/useAxiosInstance";

const CheckEmail = () => {
  const [searchParams] = useSearchParams();
  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    if (!email) {
      toast.error("Email missing. Please enter email on signup again.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance.post(
        "/api/user/auth/resend-verification",
        { email }
      );
      toast.success(data?.message || "Verification email sent");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to resend email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full border md:w-[560px] bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Verify your email</h2>
          <p className="text-center">
            We sent a verification link to{" "}
            <span className="font-semibold">{email || "your email"}</span>.
          </p>
          <p className="text-center text-sm opacity-70">
            Please open your inbox and click the verify link. Then you can login.
          </p>

          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              className={`btn btn-primary btn-sm ${loading ? "loading" : ""}`}
              onClick={resend}
              disabled={loading}
            >
              Resend verification email
            </button>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;

