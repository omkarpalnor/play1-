import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Building2,
  Clock,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import axiosInstance from "@hooks/useAxiosInstance";

const schema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  subject: yup.string().required("Subject is required").min(5, "Subject must be at least 5 characters"),
  category: yup.string().required("Please select a category"),
  message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters"),
  priority: yup.string().required("Please select priority level"),
});

const categories = [
  { value: "general", label: "General Support" },
  { value: "booking", label: "Booking / Customer Issue" },
  { value: "payment", label: "Payout / Payment Problem" },
  { value: "technical", label: "Technical Dashboard Issue" },
  { value: "feedback", label: "Feature Feedback" },
  { value: "complaint", label: "Complaint / Escalation" },
  { value: "partnership", label: "Business / Partnership" },
];

const priorities = [
  { value: "low", label: "Low", className: "badge badge-success badge-outline" },
  { value: "medium", label: "Medium", className: "badge badge-warning badge-outline" },
  { value: "high", label: "High", className: "badge badge-error badge-outline" },
  { value: "urgent", label: "Urgent", className: "badge badge-error" },
];

const contactInfo = [
  { icon: Mail, label: "Owner Support Email", value: "support@PlayRizon.com", href: "mailto:support@PlayRizon.com" },
  { icon: Phone, label: "Priority Line", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: Clock, label: "Review Window", value: "Mon-Sat 9AM-8PM, Sun 10AM-6PM" },
];

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefill, setPrefill] = useState({ name: "", email: "" });
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const loadOwnerProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/owner/profile");
        const profile = response?.data?.profile;

        if (profile?.name) {
          setValue("name", profile.name);
          setPrefill((prev) => ({ ...prev, name: profile.name }));
        }

        if (profile?.email) {
          setValue("email", profile.email);
          setPrefill((prev) => ({ ...prev, email: profile.email }));
        }
      } catch (error) {
        console.error("Owner profile prefill error:", error);
      }
    };

    loadOwnerProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/api/owner/contact", data);
      toast.success("Owner support request sent successfully.");
      reset({
        name: prefill.name || data.name || "",
        email: prefill.email || data.email || "",
        subject: "",
        category: "",
        message: "",
        priority: "",
      });
    } catch (error) {
      console.error("Owner contact form error:", error);
      toast.error(error.response?.data?.message || "Failed to send owner support request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.20),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.18),transparent_35%)]"></div>
          <div className="relative grid gap-8 px-6 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
            <div className="space-y-5">
              <div className="badge badge-secondary badge-outline gap-2 p-4">
                <Sparkles size={14} />
                Owner to admin support lane
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                Contact PlayRizon admin when owner operations need attention.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-base-content/70">
                Use this page for payout issues, customer escalations, dashboard bugs, listing trouble,
                partnership requests, or anything that needs direct help from PlayRizon admin.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-base-300 bg-base-200 p-4">
                  <div className="text-sm font-semibold">General owner support</div>
                  <div className="mt-1 text-2xl font-bold text-secondary">24h</div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-200 p-4">
                  <div className="text-sm font-semibold">Operational escalations</div>
                  <div className="mt-1 text-2xl font-bold text-primary">Same day</div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-200 p-4">
                  <div className="text-sm font-semibold">Fastest admin follow-up</div>
                  <div className="mt-1 text-lg font-bold">Owner Messages</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-base-300 bg-base-200/70 p-6 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Admin Contact Options</h2>
                  <p className="text-sm text-base-content/65">Choose a formal request or open a direct admin thread.</p>
                </div>
              </div>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                      <div className="rounded-xl bg-secondary/10 p-2 text-secondary">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-secondary hover:underline">
                            {item.value}
                          </a>
                        ) : (
                          <div className="text-sm text-base-content/70">{item.value}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-secondary/10 p-2 text-secondary">
                    <MessageCircle size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">Need a direct owner to admin conversation?</div>
                    <p className="mt-2 text-sm leading-6 text-base-content/70">
                      Open Owner Messages when you want back-and-forth chat with PlayRizon admin instead of a one-time request.
                    </p>
                    <Link to="/owner/messages" className="btn btn-secondary btn-sm mt-3 gap-2">
                      Message Admin
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-base-300 bg-base-100 p-4">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck size={18} className="text-success" />
                  What to include
                </div>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Add booking IDs, payout references, turf names, screenshots, or user email details when relevant.
                  That usually saves one full follow-up cycle.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-lg lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                <LifeBuoy size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Send an Admin Contact Request</h2>
                <p className="text-sm text-base-content/65">We’ll route it to the right person on the PlayRizon team.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Your Name</span>
                  </label>
                  <label className="modern-input flex items-center gap-2">
                    <User size={16} className="text-base-content/50" />
                    <input {...register("name")} className="grow" placeholder="Owner name" />
                  </label>
                  {errors.name ? <p className="mt-2 text-sm text-error">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Email Address</span>
                  </label>
                  <label className="modern-input flex items-center gap-2">
                    <Mail size={16} className="text-base-content/50" />
                    <input {...register("email")} className="grow" placeholder="owner@example.com" />
                  </label>
                  {errors.email ? <p className="mt-2 text-sm text-error">{errors.email.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select {...register("category")} className="modern-select w-full">
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  {errors.category ? <p className="mt-2 text-sm text-error">{errors.category.message}</p> : null}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Priority</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {priorities.map((priority) => (
                      <label key={priority.value} className="cursor-pointer">
                        <input
                          {...register("priority")}
                          type="radio"
                          value={priority.value}
                          className="peer sr-only"
                        />
                        <span className={`${priority.className} peer-checked:ring-2 peer-checked:ring-secondary peer-checked:ring-offset-2`}>
                          {priority.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.priority ? <p className="mt-2 text-sm text-error">{errors.priority.message}</p> : null}
                </div>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Subject</span>
                </label>
                <input
                  {...register("subject")}
                  className="modern-input w-full"
                  placeholder="Short summary of the issue"
                />
                {errors.subject ? <p className="mt-2 text-sm text-error">{errors.subject.message}</p> : null}
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-medium">Message</span>
                </label>
                <textarea
                  {...register("message")}
                  rows={6}
                  className="modern-textarea w-full"
                  placeholder="Explain what happened, which turf or booking is affected, and what outcome you need."
                />
                {errors.message ? <p className="mt-2 text-sm text-error">{errors.message.message}</p> : null}
              </div>

              <button type="submit" className="btn btn-secondary btn-block gap-2" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <Send size={18} />}
                {isSubmitting ? "Sending..." : "Send Admin Contact Request"}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-lg">
              <h3 className="text-xl font-semibold">Good reasons to contact admin here</h3>
              <div className="mt-4 space-y-4">
                {[
                  "Payout or transaction mismatches",
                  "Customer disputes that need platform review",
                  "Listing visibility or dashboard issues",
                  "Escalations that should also be tracked in email",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-base-300 bg-base-200 p-4 text-sm text-base-content/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-secondary/20 bg-gradient-to-br from-secondary/10 via-base-100 to-primary/10 p-6 shadow-lg">
              <h3 className="text-xl font-semibold">Need an ongoing admin thread instead?</h3>
              <p className="mt-2 text-sm leading-6 text-base-content/70">
                Use the owner Messages module for back-and-forth conversations with PlayRizon admin.
                Contact support is best when you also want an email trail.
              </p>
              <Link to="/owner/messages" className="btn btn-outline btn-secondary mt-4 gap-2">
                Open Owner Messages
                <ArrowRight size={14} />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
