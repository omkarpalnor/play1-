import { Link } from "react-router-dom";
import Carousel from "../components/common/Carousel";
import Footer from "../components/layout/Footer";
import useTurfData from "../hooks/useTurfData";
import TurfCard from "../components/turf/TurfCard";
import TurfCardSkeleton from "../components/ui/TurfCardSkeleton";
import { useSelector } from "react-redux";
import banner1 from "/banner-2.jpeg"
import banner2 from "/banner-2.jpeg"
import banner3 from "/banner-3.jpeg"

const Home = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { turfs, loading } = useTurfData();
  const slides = [banner1, banner2, banner3];


  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <div className="hero min-h-[78vh] overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.18),_transparent_28%)]">
        <div className="hero-content flex-col gap-10 lg:flex-row-reverse animate-slide-in-right">
          <div className="w-full lg:w-1/2">
            <Carousel slides={slides} />
          </div>
          <div className="w-full lg:w-1/2 animate-zoom-in">
            <div className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              Welcome To PlayRizon
            </div>
            <h1 className="text-5xl font-black leading-tight md:text-6xl">
              Book your next match with a platform built for momentum.
            </h1>
            <p className="py-6 text-base leading-8 text-base-content/70">
              Discover and book the best Arena fields in your area. Whether
              you&#39;re planning a casual game, practice session, or tournament,
              PlayRizon gives you a faster and more confident way to lock in the right venue.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={isLoggedIn ? "/auth/turfs" : "/signup"}
                className="btn btn-primary"
              >
                Get Started
              </Link>
              <Link
                to={isLoggedIn ? "/auth/about" : "/about"}
                className="btn btn-outline"
              >
                About Us
              </Link>
              <Link
                to={isLoggedIn ? "/auth/why-us" : "/why-us"}
                className="btn btn-ghost"
              >
                Why Us
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto  p-4 animate-slide-in-left">
        <h2 className="text-3xl font-bold mb-6">Featured Arena's</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => (
              <TurfCardSkeleton key={`skeleton-${index}`} />
            ))
            : turfs
              .slice(0, 3)
              .map((turf) => <TurfCard key={turf.id} turf={turf} />)}
        </div>
        <div className="text-center mt-8">
          <Link
            to={isLoggedIn ? "/auth/turfs" : "/turfs"}
            className="btn btn-primary"
          >
            View More Arena's
          </Link>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-base-300 bg-base-100 p-8 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              About PlayRizon
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Designed to make Arena booking feel clear, modern, and fast.
            </h2>
            <p className="mt-4 max-w-2xl leading-8 text-base-content/70">
              PlayRizon brings players, venues, and booking operations together in
              one connected experience so finding the right Arena and confirming the
              right slot takes less effort and creates more confidence.
            </p>
            <Link
              to={isLoggedIn ? "/auth/about" : "/about"}
              className="btn btn-primary mt-6"
            >
              Explore Our Story
            </Link>
            <Link
              to={isLoggedIn ? "/auth/why-us" : "/why-us"}
              className="btn btn-outline mt-6 ml-3"
            >
              Why PlayRizon
            </Link>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] bg-gradient-to-br from-slate-950 via-emerald-800 to-cyan-700 p-6 text-white shadow-xl">
              <p className="text-sm uppercase tracking-[0.22em] text-white/70">
                Platform Promise
              </p>
              <p className="mt-3 text-3xl font-black">Better Booking Flow</p>
            </div>
            <div className="rounded-[28px] border border-base-300 bg-base-200 p-6 shadow-lg">
              <p className="text-sm uppercase tracking-[0.22em] text-base-content/45">
                Built For
              </p>
              <p className="mt-3 text-2xl font-bold">Players, owners, and growth.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Home;
