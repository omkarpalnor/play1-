import useLoginForm from "../../hooks/useLoginForm";
import useGoogleAuth from "../../hooks/useGoogleAuth";
import FormField from "../../components/common/FormField";
import { Link } from "react-router-dom";
import Button from "../../components/common/Button";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const { register, handleSubmit, errors, onSubmit, loading } = useLoginForm();
  const { handleGoogleSuccess, handleGoogleError } = useGoogleAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
     <div className="flex items-center justify-center  min-h-screen max-md:p-4 bg-base-200 p-4 ">
      <div className="card w-full border md:w-96  bg-base-100 shadow-xl  ">
        <div className="card-body">
          <h2 className="card-title justify-center">Login</h2>
          <form onSubmit={handleSubmit(onSubmit)}>
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
            <div className="text-right mt-2">
              <Link to="/forgot-password" className="link link-hover text-sm">
                Forgot password?
              </Link>
            </div>
            <div className="form-control mt-6">
              <Button type="submit" className="btn-primary" loading={loading}>
                Login
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
                  text="signin_with"
                  shape="pill"
                  width="300"
                />
              </div>
            </>
          ) : null}
          <div className="text-center mt-4">
            <Link to="/signup" className="link link-hover">
              Don&#39;t have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
