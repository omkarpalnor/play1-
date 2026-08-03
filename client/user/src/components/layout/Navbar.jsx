import { Link, useNavigate } from "react-router-dom";
import ThemeSwitcher from "../common/ThemeSwitcher";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="navbar bg-base-100 fixed top-0 z-50 shadow-md animate-slide-in-top">
      {/* Navbar Start */}
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </label>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/Arenas">Arenas</Link>
            </li>
            <li>
              <Link to="/matchmaking">Find Teams</Link>
            </li>
            <li>
              <Link to="/tournaments">Tournaments</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/why-us">Why Us</Link>
            </li>
            <li>
              <Link to="/contact">Contact Us</Link>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <Link to="/auth/profile">Profile</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>

        <Link to="/" className="btn btn-ghost normal-case text-xl">
          <img
            src="/logo1.png"
            alt="PlayRizon"
            className="h-10 w-10 mask mask-squircle"
          />
          PlayRizon
        </Link>
      </div>

      {/* Navbar Center */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/Arenas">Arenas</Link>
          </li>
          <li>
            <Link to="/matchmaking">Find Teams</Link>
          </li>
          <li>
            <Link to="/tournaments">Tournaments</Link>
          </li>
          <li>
            <Link to="/about">About Us</Link>
          </li>
          <li>
            <Link to="/why-us">Why Us</Link>
          </li>
          <li>
            <Link to="/contact">Contact Us</Link>
          </li>
        </ul>
      </div>

      {/* Navbar End */}
      <div className="navbar-end gap-2">
        <ThemeSwitcher />

        {isAuthenticated ? (
          <>
            <Link to="/auth/profile" className="btn btn-ghost">
              Profile
            </Link>

            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-ghost">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;