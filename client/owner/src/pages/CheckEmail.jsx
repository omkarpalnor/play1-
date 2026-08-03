import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "@hooks/useAxiosInstance";
import { MailCheck, RefreshCw, ShieldCheck } from "lucide-react";

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
        "/api/owner/auth/resend-verification",
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
    <div className="modern-auth-shell">
      <div className="modern-auth-content">
        <aside className="modern-auth-aside">
          <div className="modern-auth-badge">
            <MailCheck size={14} />
            Verification step
          </div>
          <h1 className="modern-auth-title">Check your inbox to finish setup.</h1>
          <p className="modern-auth-copy">
            Email verification keeps owner signup trustworthy and prevents the wrong account from being activated.
          </p>
          <div className="mt-8 modern-info-card flex items-start gap-3">
            <div className="rounded-2xl bg-success/10 p-3 text-success">
              <ShieldCheck size={18} />
            </div>
            <p className="text-sm leading-6 text-base-content/70">
              If you request another message, use the newest verification email you receive.
            </p>
          </div>
        </aside>
        <section className="modern-auth-card max-w-xl justify-self-center text-center">
          <h2 className="text-2xl font-semibold">Verify your email</h2>
          <p className="mt-4 text-base leading-7">
            We sent a verification link to{" "}
            <span className="font-semibold">{email || "your email"}</span>.
          </p>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            Please open your inbox and click the verify link. Then you can login.
          </p>

          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              onClick={resend}
              disabled={loading}
            >
              {!loading ? <RefreshCw size={16} /> : null}
              Resend verification email
            </button>
            <Link to="/login" className="btn btn-ghost">
              Go to Login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CheckEmail;
