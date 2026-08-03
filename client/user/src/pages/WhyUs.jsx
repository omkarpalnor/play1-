import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CreditCard,
  Gauge,
  Layers3,
  MessageSquareMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Users,
} from "lucide-react";
import Footer from "../components/layout/Footer";

const proofHighlights = [
  {
    title: "Real booking completion",
    value: "Payments + confirmation",
    description:
      "PlayRizon is built beyond discovery. The flow continues into payment, confirmation, and proof of booking.",
  },
  {
    title: "Operational trust",
    value: "Verification + approval",
    description:
      "The platform includes email verification and owner approval logic to keep account quality stronger.",
  },
  {
    title: "Full ecosystem thinking",
    value: "User + Owner + Admin",
    description:
      "The product is designed as a connected system, not a single isolated booking screen.",
  },
];

const productProofs = [
  {
    icon: CreditCard,
    title: "It solves the payment gap",
    proof:
      "PlayRizon already supports a payment-backed booking journey, which matters because venue products often fail when they only capture intent but cannot complete the transaction.",
  },
  {
    icon: QrCode,
    title: "It gives booking proof at the ground",
    proof:
      "Booking confirmation is supported with QR-based details and email confirmation, which answers a real-world operational need: proving the reservation quickly when the player arrives.",
  },
  {
    icon: ShieldCheck,
    title: "It is built with trust rails",
    proof:
      "User verification and owner approval are part of the platform, which creates a more credible marketplace than open systems with no quality checks.",
  },
  {
    icon: MessageSquareMore,
    title: "It supports the messy part after booking",
    proof:
      "Messaging flows matter because real booking issues happen after checkout too: clarifications, support, timing changes, and follow-up coordination.",
  },
];

const platformReasons = [
  {
    icon: Users,
    title: "Player value",
    description:
      "Players get a clearer path from venue discovery to reservation instead of juggling fragmented communication and uncertain booking status.",
  },
  {
    icon: Gauge,
    title: "Owner value",
    description:
      "Owners get actual operating leverage through bookings, reviews, coupons, dashboards, and cleaner day-to-day visibility.",
  },
  {
    icon: Layers3,
    title: "Platform value",
    description:
      "Admins get request oversight, user-owner governance, and transaction visibility that help the marketplace stay healthy as it grows.",
  },
];

const evidenceRows = [
  {
    area: "Booking confidence",
    challenge: "Users need to know a slot is actually secured.",
    PlayRizon: "Payment-backed booking flow plus booking confirmation.",
  },
  {
    area: "Venue entry proof",
    challenge: "Ground staff need fast confirmation during check-in.",
    PlayRizon: "QR-based booking proof and email confirmation details.",
  },
  {
    area: "Marketplace trust",
    challenge: "Open systems attract weak-quality or unverified accounts.",
    PlayRizon: "Email verification and owner request approval flow.",
  },
  {
    area: "Post-booking support",
    challenge: "A lot of real friction appears after payment.",
    PlayRizon: "Integrated communication between users, owners, and admins.",
  },
  {
    area: "Venue operations",
    challenge: "Owners need more than a listing page.",
    PlayRizon: "Dashboards, reviews, coupons, bookings, and Arena management tools.",
  },
];

const whyNow = [
  "People expect digital confirmation, not verbal booking promises.",
  "Venue operators need clearer oversight as bookings and customer expectations increase.",
  "A Arena platform becomes stronger when booking, support, proof, and operations live in one system.",
];

const WhyUs = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.14),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0),_rgba(2,132,199,0.03))]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-warning">
                Why PlayRizon
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Built for real Arena-booking problems, not just a prettier homepage.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-base-content/72 md:text-lg">
                PlayRizon stands out because its strongest claims are backed by actual product
                behavior: booking completion, QR confirmation, trust checks, messaging, and
                platform-wide operations support. This is a booking system designed for the
                reality of sports venues, not only the first click.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/signup" className="btn btn-primary">
                  Join PlayRizon
                </Link>
                <Link to="/Arenas" className="btn btn-outline">
                  Explore Arenas
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-start">
              {proofHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-base-300 bg-base-100/90 p-6 shadow-xl backdrop-blur"
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-base-content/45">
                    {item.title}
                  </p>
                  <p className="mt-3 text-3xl font-black text-primary">{item.value}</p>
                  <p className="mt-3 leading-7 text-base-content/68">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Product Proof
          </p>
          <h2 className="mt-3 text-3xl font-black md:text-5xl">
            The reason PlayRizon feels credible is simple: the proof is already inside the product.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {productProofs.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[32px] border border-base-300 bg-base-100 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg">
                  <Icon size={24} />
                </div>
                <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 leading-8 text-base-content/72">{item.proof}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-base-200/70">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
              Why It Matters
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              PlayRizon is stronger because it is built for every side of the booking journey.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {platformReasons.map((item) => {
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
            Detailed Analysis
          </p>
          <h2 className="mt-3 text-3xl font-black md:text-5xl">
            A direct look at the real-world problem and the PlayRizon answer.
          </h2>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-base-300 bg-base-100 shadow-xl">
          <div className="grid grid-cols-[1fr] border-b border-base-300 bg-base-200/70 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-base-content/55 md:grid-cols-[0.8fr_1fr_1fr]">
            <div>Area</div>
            <div className="hidden md:block">Real-world challenge</div>
            <div className="hidden md:block">PlayRizon answer</div>
          </div>
          {evidenceRows.map((row) => (
            <div
              key={row.area}
              className="grid gap-4 border-b border-base-300 px-6 py-6 last:border-b-0 md:grid-cols-[0.8fr_1fr_1fr]"
            >
              <div>
                <p className="text-lg font-bold">{row.area}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45 md:hidden">
                  Real-world challenge
                </p>
                <p className="mt-2 leading-7 text-base-content/70 md:mt-0">{row.challenge}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-base-content/45 md:hidden">
                  PlayRizon answer
                </p>
                <p className="mt-2 leading-7 text-base-content/78 md:mt-0">{row.PlayRizon}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="rounded-[36px] border border-base-300 bg-gradient-to-r from-slate-950 via-emerald-800 to-cyan-700 px-6 py-10 text-white shadow-2xl md:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                Why Now
              </p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black md:text-5xl">
                The sports-booking experience has to do more than show a venue card.
              </h2>
              <p className="mt-4 max-w-2xl leading-8 text-white/80">
                Players expect confirmation. Owners expect control. Platforms need trust and visibility.
                PlayRizon is built around that full expectation set, which is why the product story holds up.
              </p>
            </div>

            <div className="space-y-4">
              {whyNow.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/8 px-4 py-4 backdrop-blur"
                >
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/14">
                    <BadgeCheck size={18} />
                  </div>
                  <p className="leading-7 text-white/86">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6">
        <div className="rounded-[32px] border border-base-300 bg-base-100 p-8 shadow-xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Final Take
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              PlayRizon is compelling because the product already proves its case.
            </h2>
            <p className="mt-4 leading-8 text-base-content/72">
              It is not just about discovery, and it is not just about a clean UI. PlayRizon makes a stronger argument because it connects booking, payment, proof, support, owner operations, and admin oversight into one coherent sports-venue system.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/signup" className="btn btn-primary">
                Start With PlayRizon
              </Link>
              <Link to="/about" className="btn btn-outline">
                Read About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyUs;
