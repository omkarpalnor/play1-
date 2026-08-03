import { Link } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CalendarClock,
  CreditCard,
  MessageSquareMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Footer } from "@components/common";

const contentByAudience = {
  guest: {
    badge: "About PlayRizon",
    title: "One brand connecting players, venue owners, and operations teams.",
    description:
      "PlayRizon is designed to modernize how sports venues are discovered, booked, managed, and optimized across the full platform.",
    primaryCta: { to: "/signup", label: "Start With PlayRizon" },
    secondaryCta: { to: "/login", label: "Open Login" },
    highlights: [
      { label: "Platform Focus", value: "Venue Experience" },
      { label: "Booking Proof", value: "QR + Email" },
      { label: "Admin Goal", value: "Reliable Oversight" },
    ],
  },
  owner: {
    badge: "About PlayRizon For Owners",
    title: "A sharper operating system for modern turf businesses.",
    description:
      "PlayRizon helps owners manage venues with better visibility across bookings, reviews, promotions, and day-to-day decisions.",
    primaryCta: { to: "/owner/turfs", label: "Manage My Turfs" },
    secondaryCta: { to: "/owner/bookings", label: "View Bookings" },
    highlights: [
      { label: "Owner Priority", value: "More Clarity" },
      { label: "Business Goal", value: "Higher Occupancy" },
      { label: "Daily Flow", value: "Bookings + Reviews" },
    ],
  },
  admin: {
    badge: "About PlayRizon For Admins",
    title: "A cleaner control layer for platform governance and growth.",
    description:
      "PlayRizon gives administrators a stronger overview of users, owners, turfs, requests, and transactions in one coordinated system.",
    primaryCta: { to: "/admin", label: "Open Dashboard" },
    secondaryCta: { to: "/admin/owners", label: "Review Owners" },
    highlights: [
      { label: "Admin Focus", value: "Platform Control" },
      { label: "Core Need", value: "Operational Trust" },
      { label: "System Outcome", value: "Healthy Growth" },
    ],
  },
};

const pillars = [
  {
    icon: CalendarClock,
    title: "Booking Coordination",
    description:
      "From discovery to confirmation, PlayRizon keeps slot flow readable and easier to manage for everyone involved.",
  },
  {
    icon: Building2,
    title: "Venue Management",
    description:
      "Owners get a more organized place to handle listings, pricing, promotions, and booking momentum.",
  },
  {
    icon: ShieldCheck,
    title: "Operational Confidence",
    description:
      "Admins can review platform activity with a clearer structure for approvals, oversight, and decision-making.",
  },
];

const modules = [
  {
    icon: Users,
    title: "User Module",
    description:
      "Focused on discovery, booking convenience, booking history, and a smooth customer journey.",
  },
  {
    icon: Sparkles,
    title: "Owner Module",
    description:
      "Focused on venue growth with booking insights, reviews, coupons, and operational control.",
  },
  {
    icon: BarChart3,
    title: "Admin Module",
    description:
      "Focused on trust, request handling, transaction visibility, and ecosystem health across the platform.",
  },
];

const whyUs = [
  {
    icon: CreditCard,
    title: "Real Bookings, Not Just Interest",
    fact: "PlayRizon already supports a payment-backed booking flow through Razorpay.",
    proof:
      "That gives the platform real operational weight because venue businesses need completed transactions, not only booking enquiries.",
  },
  {
    icon: QrCode,
    title: "Ground-Level Booking Proof",
    fact: "Confirmed bookings are paired with email confirmation and QR-based booking details.",
    proof:
      "This matters in live venue operations where staff and players often need fast confirmation at entry time.",
  },
  {
    icon: ShieldCheck,
    title: "Controlled Growth With Trust Checks",
    fact: "Owner access is gated by request approval, and user accounts support verification flows.",
    proof:
      "That creates a more reliable marketplace than open systems where every listing can appear without oversight.",
  },
  {
    icon: MessageSquareMore,
    title: "Operational Communication Is Built In",
    fact: "Users, owners, and admins can communicate within the platform.",
    proof:
      "In the real world, booking products succeed when post-booking coordination is handled well, not only pre-booking discovery.",
  },
];

const proofStrip = [
  "User, owner, and admin modules already connected",
  "Owner request approval before access is granted",
  "Payment-backed booking flow in the product",
  "QR and email confirmation for booking proof",
  "Review, coupon, and dashboard tools for owners",
  "Transaction and request oversight for admins",
];

const About = ({ audience = "guest" }) => {
  const content = contentByAudience[audience] || contentByAudience.guest;

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.15),_transparent_30%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-info/30 bg-info/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-info">
              {content.badge}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                {content.title}
              </h1>
              <p className="max-w-2xl text-base leading-8 text-base-content/70 md:text-lg">
                {content.description} PlayRizon is positioned around practical venue operations:
                reliable bookings, visible approvals, usable reporting, and less friction between
                players, owners, and the platform team.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={content.primaryCta.to} className="btn btn-primary">
                {content.primaryCta.label}
              </Link>
              <Link to={content.secondaryCta.to} className="btn btn-outline">
                {content.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="grid gap-4 self-center">
            {content.highlights.map((item) => (
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
            What PlayRizon Improves
          </p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            Better flow, clearer visibility, and a stronger product experience across every module.
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
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg">
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
              Platform Modules
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Each module has a different job, but they all move under one PlayRizon identity.
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {modules.map((item) => {
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
            Why PlayRizon Works
          </p>
          <h2 className="mt-3 text-3xl font-black md:text-4xl">
            The platform story is stronger because its proof points come from features that already exist in the product.
          </h2>
          <p className="mt-4 leading-8 text-base-content/70">
            Instead of generic marketing claims, PlayRizon can show practical evidence of trust, payments, confirmations, approvals, and operations.
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
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg">
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
        <div className="rounded-[36px] border border-base-300 bg-gradient-to-r from-slate-950 via-sky-800 to-emerald-700 px-6 py-10 text-white shadow-2xl md:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
            PlayRizon Standard
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black md:text-5xl">
            Clean booking experiences up front. Stronger operational clarity in the back.
          </h2>
          <p className="mt-4 max-w-2xl leading-8 text-white/80">
            That balance is what drives the PlayRizon identity across the user journey,
            owner workflow, and admin control layer. It is a stronger story because
            the product already includes the payment, proof, oversight, and communication
            pieces that real venue operations actually need.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
