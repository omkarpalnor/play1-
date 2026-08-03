import { Link } from "react-router-dom";
import useSignUpForm from "@hooks/useSignUpForm";
import useGoogleOwnerAuth from "@hooks/useGoogleOwnerAuth";
import { GoogleLogin } from "@react-oauth/google";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button, FormField } from "@components/common";

const SignUp = () => {
  const { register, handleSubmit, errors, onSubmit, loading } = useSignUpForm();
  const { handleGoogleSuccess, handleGoogleError } = useGoogleOwnerAuth("register");
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <div className="modern-auth-shell">
      <div className="modern-auth-content">
        <aside className="modern-auth-aside">
          <div className="modern-auth-badge">
            <Sparkles size={14} />
            Approved owner setup
          </div>
          <h1 className="modern-auth-title">Complete your PlayRizon owner account.</h1>
          <p className="modern-auth-copy">
            This signup is for owners who have already been approved. Finish the account and step into bookings, dashboards, reports, and platform messaging.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Use the same approved email from your owner request.",
              "Strong password rules keep your business access protected.",
              "Google signup works with the same approved identity.",
            ].map((item) => (
              <div key={item} className="modern-info-card flex items-start gap-3">
                <div className="rounded-2xl bg-success/10 p-2 text-success">
                  <CheckCircle2 size={16} />
                </div>
                <p className="text-sm leading-6 text-base-content/70">{item}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="modern-auth-card max-w-2xl justify-self-center">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Sign Up</h2>
            <p className="mt-2 text-sm leading-6 text-base-content/70">
              Create the approved owner account that will be used to access PlayRizon operations.
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="modern-form-grid">
              <FormField
                label="Name"
                name="name"
                type="text"
                register={register}
                error={errors.name}
                placeholder="Owner name"
              />
              <FormField
                label="Phone Number"
                name="phone"
                type="text"
                register={register}
                error={errors.phone}
                placeholder="+91 98765 43210"
              />
            </div>
            <FormField
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
              placeholder="owner@example.com"
            />
            <div className="modern-form-grid">
              <FormField
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
                placeholder="Create a strong password"
              />
              <FormField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                register={register}
                error={errors.confirmPassword}
                placeholder="Repeat your password"
              />
            </div>
            <div className="modern-info-strip flex items-start gap-3 text-sm">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
              <p className="leading-6 text-base-content/70">
                Password must be at least 8 characters and include uppercase,
                lowercase, number, and special character.
              </p>
            </div>
            
            

            <div className="pt-3">
              <Button
                type="submit"
                className="btn-primary w-full"
                loading={loading}
              >
                Sign Up
              </Button>
            </div>
          </form>
          {googleClientId ? (
            <>
              <div className="divider my-5">or</div>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signup_with"
                  shape="pill"
                  width="320"
                />
              </div>
              <p className="mt-3 text-center text-xs text-base-content/65">
                Google sign up uses the same approved email and phone number from your
                owner access request.
              </p>
            </>
          ) : null}
          <div className="text-center mt-6">
            <Link to="/login" className="link link-hover">
              Already have an account? Login
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SignUp;
