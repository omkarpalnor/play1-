import { Link } from "react-router-dom";

import { Carousel, Footer } from "@components/common";

import banner1 from "/banner-1.jpeg";
import banner2 from "/banner-2.jpeg";
import banner3 from "/banner-3.jpeg";

const Home = () => {
  const slides = [banner1, banner2, banner3];

  return (
    <div className="modern-public-shell">
      <section className="overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.16),_transparent_28%)]">
        <div className="modern-public-container grid min-h-[calc(100vh-4rem)] items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:py-16">
          <div className="order-2 w-full lg:order-1">
            <div className="modern-auth-badge mb-4">Welcome To PlayRizon</div>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              A stronger platform for turf operations and venue growth.
            </h1>
            <p className="max-w-2xl py-6 text-base leading-8 text-base-content/70">
              PlayRizon helps sports venues move from scattered processes to a
              more unified booking, promotion, and management experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/about" className="btn btn-outline">
                About Us
              </Link>
              <Link to="/why-us" className="btn btn-ghost">
                Why Us
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="modern-info-card">
                <p className="modern-stat-label">Booking Proof</p>
                <p className="mt-2 text-xl font-semibold">QR + Email</p>
              </div>
              <div className="modern-info-card">
                <p className="modern-stat-label">Owner Ops</p>
                <p className="mt-2 text-xl font-semibold">Dashboards + Reports</p>
              </div>
              <div className="modern-info-card">
                <p className="modern-stat-label">Admin Control</p>
                <p className="mt-2 text-xl font-semibold">Requests + Governance</p>
              </div>
            </div>
          </div>
          <div className="order-1 w-full lg:order-2">
            <div className="rounded-[32px] border border-base-300 bg-base-100 p-4 shadow-xl">
            <Carousel slides={slides} />
            </div>
          </div>
        </div>
      </section>

      <section className="modern-public-container pt-0">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-base-300 bg-base-100 p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              About PlayRizon
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              Built to connect user booking energy with owner and admin clarity.
            </h2>
            <p className="mt-4 max-w-2xl leading-8 text-base-content/70">
              PlayRizon gives the full platform a stronger identity, helping users book
              faster, owners manage smarter, and admins oversee growth with more confidence.
            </p>
            <Link to="/about" className="btn btn-primary mt-6">
              Explore PlayRizon
            </Link>
            <Link to="/why-us" className="btn btn-outline mt-6 ml-3">
              Why PlayRizon
            </Link>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-sky-800 to-emerald-700 p-6 text-white shadow-xl">
              <p className="text-sm uppercase tracking-[0.22em] text-white/70">
                Brand Direction
              </p>
              <p className="mt-3 text-3xl font-semibold">Unified Sports Platform</p>
            </div>
            <div className="rounded-[28px] border border-base-300 bg-base-100 p-6 shadow-lg">
              <p className="text-sm uppercase tracking-[0.22em] text-base-content/45">
                Platform Result
              </p>
              <p className="mt-3 text-2xl font-bold">Clearer control, better experience.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
