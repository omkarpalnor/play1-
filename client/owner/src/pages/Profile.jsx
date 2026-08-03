import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BadgeCheck, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "@hooks/useAxiosInstance";
import { Button } from "@components/common";

const Profile = () => {
  const location = useLocation();
  const isAdminProfile = location.pathname.startsWith("/admin");
  const profileEndpoint = isAdminProfile ? "/api/admin/profile" : "/api/owner/profile";
  const profileTitle = isAdminProfile ? "Admin Profile" : "Owner Profile";
  const profileSubtitle = isAdminProfile
    ? "Update the core identity details used across admin operations."
    : "Keep your owner identity details current across the PlayRizon workspace.";

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    createdAt: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await axiosInstance.get(profileEndpoint);
        const profile = response?.data?.profile;
        setFormData({
          name: profile?.name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
          role: profile?.role || "",
          createdAt: profile?.createdAt || "",
        });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load profile");
      } finally {
        setFetching(false);
      }
    };

    loadProfile();
  }, [profileEndpoint]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.put(profileEndpoint, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      toast.success(response?.data?.message || "Profile updated");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="modern-shell">
        <div className="modern-container">
          <div className="modern-panel mx-auto max-w-4xl">
            <div className="flex items-center justify-center py-16">
              <span className="loading loading-spinner loading-lg text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-shell">
      <div className="modern-container">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="modern-hero">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="modern-auth-badge">
                  <ShieldCheck size={14} />
                  Account identity
                </div>
                <h1 className="modern-hero-title mt-4">{profileTitle}</h1>
                <p className="modern-hero-copy">{profileSubtitle}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="modern-info-card min-w-[180px]">
                  <p className="modern-stat-label">Role</p>
                  <p className="mt-2 text-lg font-semibold capitalize">
                    {formData.role || (isAdminProfile ? "admin" : "owner")}
                  </p>
                </div>
                <div className="modern-info-card min-w-[180px]">
                  <p className="modern-stat-label">Joined</p>
                  <p className="mt-2 text-lg font-semibold">
                    {formData.createdAt
                      ? new Date(formData.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="modern-panel">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="modern-form-grid">
                <div className="modern-form-field">
                  <label className="modern-form-label" htmlFor="name">
                    Name
                  </label>
                  <label className="modern-input flex items-center gap-3">
                    <UserRound size={16} className="text-base-content/50" />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      className="grow"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </label>
                </div>

                <div className="modern-form-field">
                  <label className="modern-form-label" htmlFor="phone">
                    Phone
                  </label>
                  <label className="modern-input flex items-center gap-3">
                    <Phone size={16} className="text-base-content/50" />
                    <input
                      id="phone"
                      type="text"
                      name="phone"
                      className="grow"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </div>

              <div className="modern-form-field">
                <label className="modern-form-label" htmlFor="email">
                  Email
                </label>
                <label className="modern-input flex items-center gap-3">
                  <Mail size={16} className="text-base-content/50" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="grow"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="modern-info-strip">
                  <div className="flex items-center gap-2 font-semibold">
                    <BadgeCheck size={16} className="text-primary" />
                    Workspace Role
                  </div>
                  <p className="mt-2 text-sm capitalize text-base-content/70">
                    {formData.role || (isAdminProfile ? "admin" : "owner")}
                  </p>
                </div>
                <div className="modern-info-strip">
                  <div className="flex items-center gap-2 font-semibold">
                    <ShieldCheck size={16} className="text-success" />
                    Account Created
                  </div>
                  <p className="mt-2 text-sm text-base-content/70">
                    {formData.createdAt
                      ? new Date(formData.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="btn-primary" loading={loading}>
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
