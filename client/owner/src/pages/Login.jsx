import useLoginForm from "@hooks/useLoginForm";
import useGoogleOwnerAuth from "@hooks/useGoogleOwnerAuth";
import useOwnerRequestForm from "@hooks/useOwnerRequestForm";
import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";

import { Button, FormField } from "@components/common";

const Login = () => {
  const [showOwnerRequestForm, setShowOwnerRequestForm] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { register, handleSubmit, errors, onSubmit, loading } = useLoginForm();
  const { handleGoogleSuccess, handleGoogleError } = useGoogleOwnerAuth("login");
  const {
    register: registerOwnerRequest,
    handleSubmit: handleOwnerRequestSubmit,
    errors: ownerRequestErrors,
    onSubmit: onOwnerRequestSubmit,
    loading: ownerRequestLoading,
    googleCredential,
    onGoogleSuccess,
    onGoogleError,
  } = useOwnerRequestForm(() => setShowOwnerRequestForm(false));

  return (
    <div className="modern-auth-shell">
      <div className="modern-auth-content">
        <aside className="modern-auth-aside">
          <div className="modern-auth-badge">
            <Sparkles size={14} />
            Owner access
          </div>
          <h1 className="modern-auth-title">
            {showOwnerRequestForm ? "Start your owner approval flow." : "Welcome back to PlayRizon."}
          </h1>
          <p className="modern-auth-copy">
            {showOwnerRequestForm
              ? "Send your owner access request with the right business details. Once approved, you can complete account setup and use the full owner workspace."
              : "Sign in with your approved owner email to manage turfs, bookings, messages, and reporting from one calmer dashboard."}
          </p>
          <div className="mt-8 space-y-4">
            {[
              {
                icon: Building2,
                title: "Venue operations",
                copy: "Manage listings, pricing, reviews, and booking flow in one place.",
              },
              {
                icon: ShieldCheck,
                title: "Approval-led access",
                copy: "Owner onboarding stays controlled so the marketplace quality stays high.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="modern-info-card">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-base-content/68">{item.copy}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="modern-auth-card max-w-xl justify-self-center">
          <h2 className="text-2xl font-semibold">
            {showOwnerRequestForm ? "Request Owner Access" : "Login"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-base-content/70">
            {showOwnerRequestForm
              ? "Send your owner registration request here. After admin approval, you can create your owner account."
              : "Login if your owner account has already been approved and created."}
          </p>

          {showOwnerRequestForm ? (
            <form
              onSubmit={handleOwnerRequestSubmit(onOwnerRequestSubmit)}
              className="mt-6 space-y-5"
            >
              <FormField
                label="Name"
                name="name"
                type="text"
                register={registerOwnerRequest}
                error={ownerRequestErrors.name}
                placeholder="Owner name"
              />
              <FormField
                label="Email"
                name="email"
                type="email"
                register={registerOwnerRequest}
                error={ownerRequestErrors.email}
                placeholder="owner@example.com"
              />
              <FormField
                label="Phone Number"
                name="phone"
                type="text"
                register={registerOwnerRequest}
                error={ownerRequestErrors.phone}
                placeholder="+91 98765 43210"
              />
              {googleClientId ? (
                <>
                  <div className="divider my-5">or</div>
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={onGoogleSuccess}
                      onError={onGoogleError}
                      text="continue_with"
                      shape="pill"
                      width="320"
                    />
                  </div>
                  <p className="mt-3 text-center text-xs text-base-content/65">
                    {googleCredential
                      ? "Google email verified. Finish with your phone number and send the request."
                      : "Use Google to auto-fill your name and email before submitting the request."}
                  </p>
                </>
              ) : null}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="btn-primary w-full"
                  loading={ownerRequestLoading}
                >
                  Send Request
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
              <FormField
                label="Email"
                name="email"
                type="email"
                register={register}
                error={errors.email}
                placeholder="owner@example.com"
              />
              <FormField
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
                placeholder="Enter your password"
              />
              <div className="text-right mt-2">
                <Link to="/forgot-password" className="link link-hover text-sm">
                  Forgot password?
                </Link>
              </div>
              <div className="pt-2">
                <Button type="submit" className="btn-primary w-full" loading={loading}>
                  Login
                </Button>
              </div>
            </form>
          )}

          {!showOwnerRequestForm && googleClientId ? (
            <>
              <div className="divider my-5">or</div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
                  shape="pill"
                  width="320"
                />
              </div>
              <p className="mt-3 text-center text-xs text-base-content/65">
                Use Google to sign in with the same approved owner email you used for
                your request.
              </p>
            </>
          ) : null}

          <div className="divider my-5">or</div>

          <div className="space-y-3 text-center">
            <button
              type="button"
              className="link link-hover text-sm font-medium"
              onClick={() => setShowOwnerRequestForm((prev) => !prev)}
            >
              {showOwnerRequestForm
                ? "Already approved? Go back to login"
                : "New owner? Send your registration request"}
            </button>
            <div>
              <Link to="/signup" className="link link-hover text-sm">
                Already approved by admin? Complete owner sign up
              </Link>
            </div>
          </div>
          <div className="mt-6 rounded-[22px] border border-base-300 bg-base-200/75 p-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              Back to PlayRizon
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
