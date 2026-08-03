import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../hooks/useAxiosInstance";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: true, ok: false, msg: "" });

  useEffect(() => {
    let active = true;

    const run = async () => {
      if (!token) {
        if (!active) return;
        setStatus({ loading: false, ok: false, msg: "Missing token" });
        return;
      }

      try {
        await axiosInstance.post(`/api/user/auth/verify-email/${token}`);
        if (!active) return;
        setStatus({
          loading: false,
          ok: true,
          msg: "Email verified successfully. You can login now.",
        });
        setTimeout(() => navigate("/login"), 1200);
      } catch (e) {
        const message =
          e?.response?.data?.message ||
          "Verification failed. The link may be expired.";
        if (!active) return;
        setStatus({ loading: false, ok: false, msg: message });
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full border md:w-[520px] bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Verify Email</h2>

          {status.loading ? (
            <p className="text-center">Verifying your email…</p>
          ) : (
            <div className="text-center space-y-3">
              <p className={status.ok ? "text-success" : "text-error"}>
                {status.msg}
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/login" className="btn btn-primary btn-sm">
                  Go to Login
                </Link>
                <Link to="/signup" className="btn btn-ghost btn-sm">
                  Back to Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

