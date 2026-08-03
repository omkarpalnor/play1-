import { Link } from "react-router-dom";
import {
  BadgeCheck,
  BarChart3,
  CreditCard,
  MessageSquareMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Footer } from "@components/common";

const topProofs = [
  {
    title: "Operational proof",
    value: "Owner + Admin workflows",
    description:
      "PlayRizon is not only a public-facing booking interface. It includes the control layer needed behind the scenes too.",
  },
  {
    title: "Transaction proof",
    value: "Payment-backed flow",
    description:
      "The booking journey extends into actual transaction completion instead of stopping at a simple enquiry state.",
  },
  {
    title: "Trust proof",
    value: "Approval + verification",
    description:
      "The platform includes account trust rails that support healthier marketplace behavior.",
  },
];

const pillars = [
  {
    icon: CreditCard,
    title: "Because bookings should convert into real business",
    description:
      "PlayRizon is stronger than a surface-level venue browser because it is tied to a real booking flow with payment support.",
  },
  {
    icon: QrCode,
    title: "Because every confirmed slot should have visible proof",
    description:
      "QR and email confirmation make the booking defensible at the venue, not just attractive on screen.",
  },
  {
    icon: ShieldCheck,
    title: "Because marketplace quality needs control",
    description:
      "Owner request approval and verification steps help prevent the platform from becoming a low-trust directory.",
  },
  {
    icon: MessageSquareMore,
    title: "Because support and coordination are part of the job",
    description:
      "A booking platform becomes more useful when it supports post-booking communication, not only discovery.",
  },
];

const roleImpact = [
  {
    icon: Users,
    title: "Users",
    description:
      "Get a clearer, more confident path from browsing a venue to securing and proving the booking.",
  },
  {
    icon: Sparkles,
    title: "Owners",
    description:
      "Get booking visibility, review awareness, promotions support, and a more structured operating rhythm.",
  },
  {
    icon: BarChart3,
    title: "Admins",
    description:
      "Get ecosystem oversight through owner requests, transactions, user-owner visibility, and platform governance.",
  },
];

const analysis = [
  {
    title: "Why PlayRizon is more than a booking frontend",
    copy:
      "A lot of venue products look modern but stop at discovery. PlayRizon is more complete because it also addresses transaction handling, confirmation proof, owner onboarding, and operational visibility.",
  },
  {
    title: "Why the owner flow matters",
    copy:
      "Owner-side tools create the business backbone of the platform. Listings alone do not build trust or retention; control over bookings, reviews, coupons, and dashboards does.",
  },
  {
    title: "Why the admin layer matters",
    copy:
      "Platforms scale better when governance is designed into the product. Request review, oversight, and transaction visibility are not extras; they are how marketplace quality is maintained.",
  },
];

const proofChecklist = [
  "Multi-role system with separate user, owner, and admin experiences",
  "Owner request process before access is granted",
  "Payment-backed booking completion",
  "QR and email confirmation for real booking proof",
  "Messaging support across platform roles",
  "Review, coupon, dashboard, and transaction visibility flows",
];

const WhyUs = () => {
  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.16),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0),_rgba(2,132,199,0.03))]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-info/30 bg-info/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-info">
                Why PlayRizon
              </div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                PlayRizon is compelling because it solves booking and operations together.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-base-content/72 md:text-lg">
                The product story is stronger when it is backed by actual operating logic. PlayRizon
                already includes the pieces that matter in the real world: payment-backed bookings,
                booking proof, quality controls, messaging, dashboards, and platform oversight.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/login" className="btn btn-primary">
                  Open Login
                </Link>
                <Link to="/about" className="btn btn-outline">
                  Read About Us
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-start">
              {topProofs.map((item) => (
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
            Best Reasons To Choose PlayRizon
          </p>
          <h2 className="mt-3 text-3xl font-black md:text-5xl">
            Each argument for PlayRizon maps to a product capability that already exists.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-[32px] border border-base-300 bg-base-100 p-7 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-lg">
                  <Icon size={24} />
                </div>
                <h3 className="mt-6 text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 leading-8 text-base-content/72">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-base-200/70">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
              Ecosystem Impact
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-5xl">
              PlayRizon gets better because every role in the system receives a clear advantage.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {roleImpact.map((item) => {
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
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-base-300 bg-gradient-to-br from-slate-950 via-sky-900 to-emerald-800 p-8 text-white shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/72">
              Proof Checklist
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              Why the story holds up
            </h2>
            <div className="mt-6 space-y-4">
              {proofChecklist.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/14">
                    <BadgeCheck size={18} />
                  </div>
                  <p className="leading-7 text-white/86">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="mb-2 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
                Detailed Analysis
              </p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">
                A stronger platform case, viewed from the product layer.
              </h2>
            </div>
            {analysis.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-base-300 bg-base-100 p-6 shadow-lg"
              >
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 leading-8 text-base-content/72">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6">
        <div className="rounded-[32px] border border-base-300 bg-base-100 p-8 shadow-xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Final View
            </p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">
              PlayRizon is persuasive because it is designed like a platform, not a one-screen demo.
            </h2>
            <p className="mt-4 leading-8 text-base-content/72">
              It addresses what players need up front, what owners need daily, and what admins need to govern the marketplace. That mix of customer-facing value and operational depth is what makes PlayRizon a stronger product story.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/about" className="btn btn-outline">
                Back To About
              </Link>
              <Link to="/login" className="btn btn-primary">
                Continue To Platform
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
