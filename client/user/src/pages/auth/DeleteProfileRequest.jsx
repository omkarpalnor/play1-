import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import axiosInstance from "../../hooks/useAxiosInstance";

const deletionStatusMeta = {
  none: {
    tone: "alert-info",
    title: "No request submitted",
    description:
      "Fill in the reason and suggestion below, then submit the request.",
  },
  pending_email_verification: {
    tone: "alert-warning",
    title: "Waiting for email verification",
    description:
      "Your request was submitted. Open the verification link from your email to continue.",
  },
  pending_admin_approval: {
    tone: "alert-info",
    title: "Waiting for admin approval",
    description:
      "Your email is verified. The request is now with the admin team.",
  },
  approved: {
    tone: "alert-success",
    title: "Request approved",
    description: "Your profile removal request has already been approved.",
  },
  rejected: {
    tone: "alert-error",
    title: "Request rejected",
    description:
      "Your last request was rejected. You can submit a new one if needed.",
  },
};

const DeleteProfileRequest = () => {
  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState({
    status: "none",
    reason: "",
    suggestion: "",
    requestedAt: "",
    emailVerifiedAt: "",
    adminActionAt: "",
    adminNotes: "",
  });
  const [formData, setFormData] = useState({
    reason: "",
    suggestion: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/user/profile");
        const existingRequest = response?.data?.profile?.deletionRequest || {
          status: "none",
          reason: "",
          suggestion: "",
          requestedAt: "",
          emailVerifiedAt: "",
          adminActionAt: "",
          adminNotes: "",
        };

        setDeletionRequest(existingRequest);
        setFormData({
          reason:
            existingRequest?.status === "rejected" ? "" : existingRequest?.reason || "",
          suggestion:
            existingRequest?.status === "rejected"
              ? ""
              : existingRequest?.suggestion || "",
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load request page");
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await axiosInstance.post("/api/user/profile/delete-request", {
        reason: formData.reason,
        suggestion: formData.suggestion,
      });
      const nextRequest = response?.data?.deletionRequest || deletionRequest;
      setDeletionRequest(nextRequest);
      setFormData({
        reason: nextRequest?.reason || "",
        suggestion: nextRequest?.suggestion || "",
      });
      toast.success(
        response?.data?.message ||
          "Delete request submitted. Please verify the email link."
      );
    } catch (error) {
      const serverMessage = error?.response?.data?.message;
      if (Array.isArray(serverMessage)) {
        toast.error(serverMessage[0]?.msg || "Failed to submit request");
      } else {
        toast.error(serverMessage || "Failed to submit request");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isLocked = ["pending_email_verification", "pending_admin_approval"].includes(
    deletionRequest?.status
  );
  const currentStatus =
    deletionStatusMeta[deletionRequest?.status] || deletionStatusMeta.none;

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto card bg-base-100 shadow-md border">
          <div className="card-body">
            <span className="loading loading-spinner loading-md mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto card bg-base-100 shadow-md border">
        <div className="card-body space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">Delete Profile Request</h1>
              <p className="text-sm opacity-70 mt-1">
                Submit your reason and suggestion. After submission, verify the link
                sent to your email.
              </p>
            </div>
            <Link to="/auth/profile" className="btn btn-ghost btn-sm">
              Back
            </Link>
          </div>

          <div className={`alert ${currentStatus.tone}`}>
            <div className="space-y-1">
              <p className="font-semibold">{currentStatus.title}</p>
              <p className="text-sm">{currentStatus.description}</p>
            </div>
          </div>

          {deletionRequest?.requestedAt ? (
            <div className="rounded-xl border p-4 text-sm space-y-1 bg-base-200/40">
              <p>
                Requested on: {new Date(deletionRequest.requestedAt).toLocaleString()}
              </p>
              {deletionRequest?.emailVerifiedAt ? (
                <p>
                  Email verified on:{" "}
                  {new Date(deletionRequest.emailVerifiedAt).toLocaleString()}
                </p>
              ) : null}
              {deletionRequest?.adminActionAt ? (
                <p>
                  Admin action on:{" "}
                  {new Date(deletionRequest.adminActionAt).toLocaleString()}
                </p>
              ) : null}
              {deletionRequest?.adminNotes ? (
                <p>Admin notes: {deletionRequest.adminNotes}</p>
              ) : null}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Reason</span>
              </label>
              <textarea
                name="reason"
                className="textarea textarea-bordered min-h-32"
                placeholder="Tell us why you want to remove your profile"
                value={formData.reason}
                onChange={handleChange}
                disabled={isLocked}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Suggestion</span>
              </label>
              <textarea
                name="suggestion"
                className="textarea textarea-bordered min-h-24"
                placeholder="Share your suggestion or feedback"
                value={formData.suggestion}
                onChange={handleChange}
                disabled={isLocked}
              />
            </div>

            <p className="text-sm opacity-70">
              Your profile will only be removed after email verification and admin approval.
            </p>

            <Button
              type="submit"
              className="btn-error"
              loading={submitting}
              disabled={isLocked}
            >
              Submit Delete Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteProfileRequest;
