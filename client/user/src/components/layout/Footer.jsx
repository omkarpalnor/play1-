import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-base-300 bg-base-200/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 md:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/logo1.png"
              alt="PlayRizon"
              className="h-11 w-11 rounded-2xl object-cover shadow-md"
            />
            <div>
              <p className="text-xl font-black">PlayRizon</p>
              <p className="text-sm text-base-content/60">
                Smarter Arena discovery and booking.
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-base-content/65">
            PlayRizon helps players discover venues, reserve the right slot, and
            manage bookings with a cleaner, more modern product experience.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/" className="btn btn-ghost btn-sm">
            Home
          </Link>
          <Link to="/Arenas" className="btn btn-ghost btn-sm">
            Arenas
          </Link>
          <Link to="/about" className="btn btn-primary btn-sm">
            About Us
          </Link>
          <Link to="/why-us" className="btn btn-ghost btn-sm">
            Why Us
          </Link>
        </div>
      </div>
      <div className="border-t border-base-300 px-4 py-4 text-center text-sm text-base-content/60">
        &copy; {new Date().getFullYear()} PlayRizon. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
