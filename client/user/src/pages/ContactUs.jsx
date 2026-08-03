import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Building2,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import axiosInstance from "../hooks/useAxiosInstance.js";

const schema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  subject: yup.string().required("Subject is required").min(5, "Subject must be at least 5 characters"),
  category: yup.string().required("Please select a category"),
  message: yup.string().required("Message is required").min(10, "Message must be at least 10 characters"),
  priority: yup.string().required("Please select priority level"),
});

const categories = [
  { value: "general", label: "General Inquiry" },
  { value: "booking", label: "Booking Issue" },
  { value: "payment", label: "Payment Problem" },
  { value: "technical", label: "Technical Support" },
  { value: "feedback", label: "Feedback & Suggestions" },
  { value: "complaint", label: "Complaint" },
  { value: "partnership", label: "Partnership" },
];

const priorities = [
  { value: "low", label: "Low", className: "badge badge-success badge-outline" },
  { value: "medium", label: "Medium", className: "badge badge-warning badge-outline" },
  { value: "high", label: "High", className: "badge badge-error badge-outline" },
  { value: "urgent", label: "Urgent", className: "badge badge-error" },
];

const contactInfo = [
  { icon: Mail, label: "Email", value: "supportPlayRizon@gmail.com", href: "mailto:supportPlayRizon@gmail.com" },
  { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: MapPin, label: "HQ", value: "Kothrud" },
  { icon: Clock, label: "Support Hours", value: "Mon-Sat 9AM-8PM, Sun 10AM-6PM" },
];

const faqItems = [
  {
    question: "How do I book a Arena?",
    answer: "Open Arenas, choose your venue, pick a date and time slot, then complete payment to confirm the booking.",
  },
  {
    question: "What if my payment succeeded but my booking did not?",
    answer: "Use this form or open the Messages page with your booking and payment details so the support team can verify it quickly.",
  },
  {
    question: "How do I become a Arena owner?",
    answer: "Use the Become an Owner flow from your account and submit the requested details. Our team reviews applications manually.",
  },
];

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await axiosInstance.post("/api/user/contact", data);
      toast.success("Your message has been sent successfully.");
      reset();
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-base-300 bg-base-100 shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.18),transparent_35%)]"></div>
          <div className="relative grid gap-8 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
            <div className="space-y-5">
              <div className="badge badge-primary badge-outline gap-2 p-4">
                <Sparkles size={14} />
                Human support when you need it
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">
                Contact PlayRizon support without leaving your account flow.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-base-content/70">
                Payment issue, booking mismatch, Arena complaint, or just a question about how something works:
                send it here and we will respond by email with a reference trail you can follow.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-base-300 bg-base-200 p-4">
                  <div className="text-sm font-semibold">General replies</div>
                  <div className="mt-1 text-2xl font-bold text-primary">24-48h</div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-200 p-4">
                  <div className="text-sm font-semibold">Urgent issues</div>
                  <div className="mt-1 text-2xl font-bold text-secondary">2-4h</div>
                </div>
                <div className="rounded-2xl border border-base-300 bg-base-200 p-4">
                  <div className="text-sm font-semibold">Best follow-up</div>
                  <div className="mt-1 text-lg font-bold">Messages + Email</div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-base-300 bg-base-200/70 p-6 backdrop-blur">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Building2 size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Quick Contact</h2>
                  <p className="text-sm text-base-content/65">Support details and response expectations.</p>
                </div>
              </div>
              <div className="space-y-4">
                {contactInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-primary hover:underline">
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
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-lg lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <MessageSquare size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Send Us a Message</h2>
                <p className="text-sm text-base-content/65">The more detail you add, the faster we can help.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Your Name</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2">
                    <User size={16} className="text-base-content/50" />
                    <input {...register("name")} className="grow" placeholder="John Doe" />
                  </label>
                  {errors.name ? <p className="mt-2 text-sm text-error">{errors.name.message}</p> : null}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Email Address</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2">
                    <Mail size={16} className="text-base-content/50" />
                    <input {...register("email")} className="grow" placeholder="john@example.com" />
                  </label>
                  {errors.email ? <p className="mt-2 text-sm text-error">{errors.email.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select {...register("category")} className="select select-bordered w-full">
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
                        <span className={`${priority.className} peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2`}>
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
                  className="input input-bordered w-full"
                  placeholder="How can we help you?"
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
                  className="textarea textarea-bordered w-full"
                  placeholder="Share the full context, booking IDs, payment details, or anything else that helps support investigate."
                />
                {errors.message ? <p className="mt-2 text-sm text-error">{errors.message.message}</p> : null}
              </div>

              <button type="submit" className="btn btn-primary btn-block gap-2" disabled={isSubmitting}>
                {isSubmitting ? <span className="loading loading-spinner loading-sm"></span> : <Send size={18} />}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-base-300 bg-base-100 p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Before You Send</h2>
                  <p className="text-sm text-base-content/65">A few answers that save time right away.</p>
                </div>
              </div>
              <div className="space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-base-300 bg-base-200 p-4">
                    <h3 className="font-semibold">{item.question}</h3>
                    <p className="mt-2 text-sm leading-6 text-base-content/70">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 p-6 shadow-lg">
              <h3 className="text-xl font-semibold">Want a faster trail for follow-up?</h3>
              <p className="mt-2 text-sm leading-6 text-base-content/70">
                Logged-in users can also use the in-app Messages module to keep a conversation thread with support and Arena owners.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
