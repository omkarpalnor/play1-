import { Link } from "react-router-dom";
import FormField from "../../components/common/FormField";
import useSignUpForm from "../../hooks/useSignUpForm";
import useGoogleAuth from "../../hooks/useGoogleAuth";
import Button from "../../components/common/Button";
import { GoogleLogin } from "@react-oauth/google";

const SignUp = () => {
  const { register, handleSubmit, errors, onSubmit, loading } = useSignUpForm();
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="card w-full md:w-96 bg-base-100 shadow-xl border"> 
        <div className="card-body">
          <h2 className="card-title justify-center">Sign Up</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormField
              label="Name"
              name="name"
              type="text"
              register={register}
              error={errors.name}
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              register={register}
              error={errors.email}
            />
            <FormField
              label="Password"
              name="password"
              type="password"
              register={register}
              error={errors.password}
            />
            <p className="text-xs opacity-70 mt-1 mb-3">
              Password must be at least 8 characters and include uppercase,
              lowercase, number, and special character.
            </p>
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              register={register}
              error={errors.confirmPassword}
            />
            <div className="form-control mt-6">
              <Button type="submit" className="btn-primary" loading={loading}>
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
                  width="300"
                />
              </div>
            </>
          ) : null}
          <div className="text-center mt-4">
            <Link to="/login" className="link link-hover">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
