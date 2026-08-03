import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, MailCheck, ShieldAlert } from "lucide-react";
import axiosInstance from "@hooks/useAxiosInstance";

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
        await axiosInstance.post(`/api/owner/auth/verify-email/${token}`);
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
    <div className="modern-auth-shell">
      <div className="modern-auth-content">
        <aside className="modern-auth-aside">
          <div className="modern-auth-badge">
            <MailCheck size={14} />
            Email verification
          </div>
          <h1 className="modern-auth-title">We&apos;re validating your owner email now.</h1>
          <p className="modern-auth-copy">
            This step confirms the approved inbox belongs to the right owner account before access opens.
          </p>
        </aside>

        <section className="modern-auth-card max-w-lg justify-self-center">
          <h2 className="text-center text-2xl font-semibold">Verify Email</h2>

          {status.loading ? (
            <div className="mt-8 text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-4 text-sm text-base-content/70">Verifying your email...</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-base-200">
                {status.ok ? (
                  <CheckCircle2 size={26} className="text-success" />
                ) : (
                  <ShieldAlert size={26} className="text-error" />
                )}
              </div>
              <p className={status.ok ? "text-success" : "text-error"}>{status.msg}</p>
              <div className="flex justify-center gap-3">
                <Link to="/login" className="btn btn-primary">
                  Go to Login
                </Link>
                <Link to="/signup" className="btn btn-ghost">
                  Back to Sign Up
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VerifyEmail;
