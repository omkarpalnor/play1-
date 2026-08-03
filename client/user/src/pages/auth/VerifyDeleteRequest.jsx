import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../hooks/useAxiosInstance";

const VerifyDeleteRequest = () => {
  const { token } = useParams();
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
        const response = await axiosInstance.get(
          `/api/user/profile/delete-request/verify/${token}`
        );
        if (!active) return;
        setStatus({
          loading: false,
          ok: true,
          msg:
            response?.data?.message ||
            "Email verified successfully. Your delete request is now waiting for admin approval.",
        });
      } catch (error) {
        if (!active) return;
        setStatus({
          loading: false,
          ok: false,
          msg:
            error?.response?.data?.message ||
            "Verification failed. The link may be expired.",
        });
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full border md:w-[560px] bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Verify Delete Request</h2>
          {status.loading ? (
            <p className="text-center">Verifying your delete request...</p>
          ) : (
            <div className="space-y-4 text-center">
              <p className={status.ok ? "text-success" : "text-error"}>
                {status.msg}
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/login" className="btn btn-primary btn-sm">
                  Go to Login
                </Link>
                <Link to="/auth/profile" className="btn btn-ghost btn-sm">
                  Back to Profile
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyDeleteRequest;
