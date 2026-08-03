import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import ThemeSwitcher from "../common/ThemeSwitcher.jsx";

const GuestNavbar = () => {
  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-base-300/80 bg-base-100/92 backdrop-blur">
      <div className="navbar mx-auto max-w-7xl px-4 md:px-6">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost btn-circle lg:hidden">
            <Menu size={18} />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] w-56 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl"
          >
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About Us</Link>
            </li>
            <li>
              <Link to="/why-us">Why Us</Link>
            </li>
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost gap-3 normal-case text-xl">
          <img
            src="/logo1.png"
            alt="PlayRizon"
            className="h-10 w-10 rounded-2xl object-cover shadow-md"
          />
          PlayRizon
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1 rounded-full border border-base-300 bg-base-200/70 px-2 py-1">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About Us</Link>
          </li>
          <li>
            <Link to="/why-us">Why Us</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end gap-2">
        <ThemeSwitcher />
        <Link to="/login" className="btn btn-ghost hidden sm:inline-flex">
          Login
        </Link>
        <Link to="/signup" className="btn btn-primary">
          Sign up
        </Link>
      </div>
    </div>
    </div>
  );
};

export default GuestNavbar;
