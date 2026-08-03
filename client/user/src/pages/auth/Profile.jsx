import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import axiosInstance from "../../hooks/useAxiosInstance";

const deletionStatusMeta = {
  none: {
    tone: "alert-info",
    title: "No delete request submitted",
    description: "If you want to delete your profile, submit the form below and verify the email link first.",
  },
  pending_email_verification: {
    tone: "alert-warning",
    title: "Waiting for email verification",
    description: "Open the link sent to your email to move this request to admin review.",
  },
  pending_admin_approval: {
    tone: "alert-info",
    title: "Waiting for admin approval",
    description: "Your request has been verified from email and is now waiting for admin approval.",
  },
  approved: {
    tone: "alert-success",
    title: "Approved",
    description: "Your request has been approved. If your session still exists, please log out.",
  },
  rejected: {
    tone: "alert-error",
    title: "Rejected",
    description: "An admin rejected this request. You can submit a new one if needed.",
  },
};

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    createdAt: "",
    loyaltyPoints: 0,
    lifetimeLoyaltyPoints: 0,
    loyaltyTier: "Bronze",
  });
  const [loyaltyRule, setLoyaltyRule] = useState("");
  const [deletionRequest, setDeletionRequest] = useState({
    status: "none",
    reason: "",
    suggestion: "",
    requestedAt: "",
    emailVerifiedAt: "",
    adminActionAt: "",
    adminNotes: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/user/profile");
        const profile = response?.data?.profile;
        setFormData({
          name: profile?.name || "",
          email: profile?.email || "",
          createdAt: profile?.createdAt || "",
          loyaltyPoints: profile?.loyaltyPoints || 0,
          lifetimeLoyaltyPoints: profile?.lifetimeLoyaltyPoints || 0,
          loyaltyTier: profile?.loyaltyTier || "Bronze",
        });
        setLoyaltyRule(response?.data?.loyaltyRule || "");
        setDeletionRequest(
          profile?.deletionRequest || {
            status: "none",
            reason: "",
            suggestion: "",
            requestedAt: "",
            emailVerifiedAt: "",
            adminActionAt: "",
            adminNotes: "",
          }
        );
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load profile");
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
    setLoading(true);
    try {
      const response = await axiosInstance.put("/api/user/profile", {
        name: formData.name,
        email: formData.email,
      });
      const profile = response?.data?.profile;
      setFormData((prev) => ({
        ...prev,
        name: profile?.name || prev.name,
        email: profile?.email || prev.email,
        loyaltyPoints: profile?.loyaltyPoints ?? prev.loyaltyPoints,
        lifetimeLoyaltyPoints:
          profile?.lifetimeLoyaltyPoints ?? prev.lifetimeLoyaltyPoints,
        loyaltyTier: profile?.loyaltyTier || prev.loyaltyTier,
      }));
      toast.success(response?.data?.message || "Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const currentDeleteStatus =
    deletionStatusMeta[deletionRequest?.status] || deletionStatusMeta.none;

  if (fetching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto card bg-base-100 shadow-md border">
          <div className="card-body">
            <span className="loading loading-spinner loading-md mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card bg-base-100 shadow-md border">
          <div className="card-body">
            <h1 className="text-2xl font-semibold text-center">My Profile</h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-success/10 border border-success/20 p-4">
                <p className="text-sm opacity-70">Current Points</p>
                <p className="text-2xl font-bold text-success">
                  {formData.loyaltyPoints}
                </p>
              </div>
              <div className="rounded-xl bg-warning/10 border border-warning/20 p-4">
                <p className="text-sm opacity-70">Lifetime Points</p>
                <p className="text-2xl font-bold text-warning">
                  {formData.lifetimeLoyaltyPoints}
                </p>
              </div>
              <div className="rounded-xl bg-info/10 border border-info/20 p-4">
                <p className="text-sm opacity-70">Tier</p>
                <p className="text-2xl font-bold text-info">{formData.loyaltyTier}</p>
              </div>
            </div>
            {loyaltyRule ? (
              <p className="text-sm opacity-70 mb-4">{loyaltyRule}</p>
            ) : null}
            <form onSubmit={handleSubmit} className="space-y-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="input input-bordered"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Joined On</span>
                </label>
                <input
                  className="input input-bordered w-full"
                  value={
                    formData.createdAt
                      ? new Date(formData.createdAt).toLocaleDateString()
                      : "-"
                  }
                  readOnly
                />
              </div>
              <div className="form-control pt-4">
                <Button type="submit" className="btn-primary" loading={loading}>
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="card-body">
          <div className="card bg-base-100 shadow-md border">
            <div className="card-body space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-semibold">Delete Profile Request</h2>
                <Link
                  to="/auth/profile/delete-request"
                  className="btn btn-error btn-sm"
                >
                  Open Request Page
                </Link>
              </div>
              <div className={`alert ${currentDeleteStatus.tone}`}>
                <div className="space-y-1">
                  <p className="font-semibold">{currentDeleteStatus.title}</p>
                  <p className="text-sm">{currentDeleteStatus.description}</p>
                </div>
              </div>
              {deletionRequest?.requestedAt ? (
                <div className="text-sm space-y-1 opacity-80">
                  <p>
                    Requested on:{" "}
                    {new Date(deletionRequest.requestedAt).toLocaleString()}
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

              <p className="text-sm opacity-70">
                Open the separate request page to submit or review your delete request details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
