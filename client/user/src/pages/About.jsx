import { Link } from "react-router-dom";
import {
  CalendarCheck2,
  CreditCard,
  MapPinned,
  MessageSquareMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Footer from "../components/layout/Footer";

const pillars = [
  {
    icon: MapPinned,
    title: "Discover Better Venues",
    description:
      "Players can find quality Arena faster with clearer location context, simpler availability flow, and less guesswork before booking.",
  },
  {
    icon: CalendarCheck2,
    title: "Book Without Friction",
    description:
      "From slot selection to confirmation, PlayRizon is designed to reduce the usual booking back-and-forth and keep the journey dependable.",
  },
  {
    icon: ShieldCheck,
    title: "Build Confidence",
    description:
      "Transparent booking flow, verification steps, and cleaner operational records help users, owners, and admins stay aligned.",
  },
];

const stats = [
  { label: "Live Product Scope", value: "3 Roles" },
  { label: "Booking Proof", value: "QR + Email" },
  { label: "Payments", value: "Razorpay Ready" },
];

const audience = [
  {
    icon: Users,
    title: "For Players",
    description:
      "Browse venues, compare options, reserve a slot, and manage bookings from one cleaner, more reliable interface.",
  },
  {
    icon: Trophy,
    title: "For Arena Owners",
    description:
      "Manage listings, watch bookings, track reviews, and improve occupancy with tools built for real venue operations.",
  },
  {
    icon: Sparkles,
    title: "For The Platform",
    description:
      "PlayRizon brings venue operations and player booking needs into one connected digital system instead of scattered touchpoints.",
  },
];

const whyUs = [
  {
    icon: CreditCard,
    title: "Built Around Real Payment Friction",
    fact: "PlayRizon already supports Razorpay payment flow, so booking does not stop at slot selection.",
    proof:
      "That matters in the real world because venue apps fail when they capture intent but cannot close the booking securely.",
  },
  {
    icon: QrCode,
    title: "Proof After Purchase, Not Just Before",
    fact: "Confirmed bookings generate email confirmations and QR-based booking details.",
    proof:
      "This solves a practical issue at the ground itself: players and venue staff need fast, visible proof that a booking is real.",
  },
  {
    icon: ShieldCheck,
    title: "Trust Is Designed Into The Platform",
    fact: "User email verification and owner approval workflows are already part of PlayRizon.",
    proof:
      "That creates stronger marketplace trust than products that let every account or venue act instantly without checks.",
  },
  {
    icon: MessageSquareMore,
    title: "Communication Is Already In The Product",
    fact: "Users, owners, and admins can communicate through the platform instead of relying only on external follow-up.",
    proof:
      "That is important because many real booking issues happen after payment: clarifications, delays, support, or coordination.",
  },
];

const proofStrip = [
  "Multi-role platform for users, owners, and admins",
  "Verified email flow for stronger account trust",
  "Owner onboarding with admin approval checks",
  "Booking confirmation email with QR generation",
  "Integrated payment flow for real booking completion",
  "Owner and admin dashboards for operational visibility",
];

const About = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.16),_transparent_30%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-success">
              About PlayRizon
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
                A better way to discover, book, and manage sports Arenas.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-base-content/70 md:text-lg">
                PlayRizon is built to make Arena booking feel modern, fast, and dependable.
                It is shaped around real operational problems: finding trusted venues, confirming
                payments, proving bookings, and keeping owners and admins aligned behind the scenes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/Arenas" className="btn btn-primary">
                Explore Arenas
              </Link>
              <Link to="/signup" className="btn btn-outline">
                Join PlayRizon
              </Link>
            </div>
          </div>

          <div className="grid gap-4 self-center">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[28px] border border-base-300 bg-base-100/90 p-6 shadow-xl backdrop-blur"
              >
                <p className="text-sm uppercase tracking-[0.22em] text-base-content/45">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-black text-primary">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Why We Exist
          </p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            We&apos;re turning Arena booking into a smoother digital experience.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[30px] border border-base-300 bg-base-100 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg">
                  <Icon size={24} />
                </div>
                <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
                <p className="mt-3 leading-7 text-base-content/70">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-2 md:px-6">
        <div className="rounded-[32px] border border-base-300 bg-base-200/60 p-5 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-base-content/55">
            Real Product Proof
          </p>
          <div className="flex flex-wrap gap-3">
            {proofStrip.map((item) => (
              <span
                key={item}
                className="rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm text-base-content/75 shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-base-200/70">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
              Built For Every Side
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              One platform, shaped for every person involved in the booking journey.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {audience.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[30px] border border-base-300 bg-base-100 p-6 shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                  </div>
                  <p className="mt-4 leading-7 text-base-content/70">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Why PlayRizon
          </p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            This product is not built on vague claims. Its strongest story comes from working features already inside the platform.
          </h2>
          <p className="mt-4 leading-8 text-base-content/70">
            Every point below maps to real product behavior, which makes the message stronger in demos, portfolios, and actual daily use.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {whyUs.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[30px] border border-base-300 bg-base-100 p-6 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-lg">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="mt-3 leading-7 text-base-content/80">{item.fact}</p>
                    <p className="mt-3 rounded-2xl bg-base-200/70 px-4 py-3 text-sm leading-7 text-base-content/65">
                      {item.proof}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="rounded-[36px] border border-base-300 bg-gradient-to-r from-slate-950 via-emerald-800 to-cyan-700 px-6 py-10 text-white shadow-2xl md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
            The PlayRizon Vision
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black md:text-5xl">
            Make sports venue booking feel as energetic and premium as the game itself.
          </h2>
          <p className="mt-4 max-w-2xl leading-8 text-white/80">
            We want every interaction, from finding a venue to confirming a slot, to feel
            clear, confident, and worth coming back to. That is why PlayRizon combines discovery,
            payment, verification, communication, and operational control in one connected flow.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
