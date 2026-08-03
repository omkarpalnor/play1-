import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  CalendarCheck2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CreditCard,
  Gift,
  LifeBuoy,
  MapPinned,
  MessageCircleMore,
  MessageSquareText,
  SendHorizontal,
  ShieldCheck,
  Star,
  Store,
  TicketPercent,
  Trash2,
  UserRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const STORAGE_KEY = "PlayRizon-chatbot-state-v2";
const TYPING_ID = "bot-typing";

const answerLibrary = [
  {
    id: "book_turf",
    title: "Book a turf",
    prompts: [
      "how do i book a turf",
      "book turf",
      "booking help",
      "reserve turf",
      "how to reserve",
    ],
    icon: CalendarCheck2,
    accent: "from-emerald-500 via-teal-500 to-cyan-500",
    response:
      "To book a turf, open the Turfs page, choose your venue, select the date, pick an available start time, choose duration, apply any coupon if you have one, and then complete the payment to confirm the booking.",
    cta: { label: "Open Turfs", to: "/auth/turfs" },
    category: "Booking",
  },
  {
    id: "cancel_booking",
    title: "Cancel booking",
    prompts: [
      "cancel booking",
      "how do i cancel",
      "cancel my reservation",
      "remove booking",
    ],
    icon: Trash2,
    accent: "from-rose-500 via-orange-500 to-amber-400",
    response:
      "You can cancel only upcoming confirmed bookings. Open My Bookings and use the Cancel Booking button on the booking card. If the button is missing, the slot is usually already past or already cancelled.",
    cta: { label: "My Bookings", to: "/auth/booking-history" },
    category: "Booking",
  },
  {
    id: "booking_history",
    title: "Booking history",
    prompts: [
      "booking history",
      "my bookings",
      "where are my bookings",
      "past bookings",
    ],
    icon: WalletCards,
    accent: "from-sky-500 via-blue-500 to-indigo-500",
    response:
      "Your full booking history is available in the My Bookings section. There you can review slot details, QR codes, booking status, loyalty points earned, and cancellation status.",
    cta: { label: "Open Booking History", to: "/auth/booking-history" },
    category: "Booking",
  },
  {
    id: "slot_unavailable",
    title: "Unavailable slots",
    prompts: [
      "slot unavailable",
      "time slot booked",
      "why cant i book this slot",
      "not available",
    ],
    icon: Zap,
    accent: "from-amber-500 via-yellow-400 to-lime-400",
    response:
      "A slot becomes unavailable when it is already booked or falls outside the turf operating hours. Selecting a different date, time, or shorter duration can help you find an open slot.",
    cta: { label: "Try Another Turf", to: "/auth/turfs" },
    category: "Booking",
  },
  {
    id: "loyalty_points",
    title: "Loyalty points",
    prompts: [
      "loyalty points",
      "reward points",
      "points",
      "how points work",
    ],
    icon: Gift,
    accent: "from-violet-500 via-fuchsia-500 to-pink-500",
    response:
      "PlayRizon awards loyalty points on confirmed bookings. Your current active points and lifetime points are shown in your profile. If a booking is cancelled, active points from that booking may be reduced.",
    cta: { label: "Open Profile", to: "/auth/profile" },
    category: "Rewards",
  },
  {
    id: "coupon_help",
    title: "Coupons & discounts",
    prompts: [
      "coupon",
      "discount",
      "offer code",
      "promo code",
      "apply coupon",
    ],
    icon: TicketPercent,
    accent: "from-pink-500 via-rose-500 to-red-500",
    response:
      "Coupons are validated during reservation based on turf, slot, and your eligibility. Enter the coupon while booking to check the discount before you pay.",
    cta: { label: "Book With Coupon", to: "/auth/turfs" },
    category: "Rewards",
  },
  {
    id: "reviews_help",
    title: "Write a review",
    prompts: [
      "write review",
      "review turf",
      "how to review",
      "give feedback",
    ],
    icon: Star,
    accent: "from-yellow-400 via-amber-400 to-orange-400",
    response:
      "You can write a review from your booking history. Open a booking card and use the Write a Review option for the turf you booked.",
    cta: { label: "Write Review", to: "/auth/booking-history" },
    category: "Feedback",
  },
  {
    id: "delete_profile",
    title: "Delete profile",
    prompts: [
      "delete profile",
      "delete account",
      "remove my account",
      "remove profile",
    ],
    icon: ShieldCheck,
    accent: "from-red-500 via-orange-500 to-amber-500",
    response:
      "To delete your profile, open Profile and go to the Delete Request page. Add your reason and suggestion, submit the request, verify the email link, and then wait for admin approval.",
    cta: { label: "Delete Request", to: "/auth/profile/delete-request" },
    category: "Account",
  },
  {
    id: "profile_help",
    title: "Manage profile",
    prompts: [
      "profile",
      "change email",
      "change name",
      "update profile",
    ],
    icon: UserRound,
    accent: "from-cyan-500 via-sky-500 to-blue-500",
    response:
      "Your profile page lets you update your name and email, check loyalty progress, and track your profile deletion request status if you submitted one.",
    cta: { label: "Open Profile", to: "/auth/profile" },
    category: "Account",
  },
  {
    id: "become_owner",
    title: "Become an owner",
    prompts: [
      "become owner",
      "list my turf",
      "owner request",
      "register as owner",
    ],
    icon: Store,
    accent: "from-indigo-500 via-violet-500 to-purple-500",
    response:
      "If you want to list your turf on PlayRizon, use the Become an Owner page. Submit the owner request there, and after approval you can continue with the owner-side setup.",
    cta: { label: "Become Owner", to: "/auth/become-owner" },
    category: "Account",
  },
  {
    id: "location_help",
    title: "Find turfs",
    prompts: [
      "find turf",
      "where can i play",
      "nearby turf",
      "locations",
      "venues",
    ],
    icon: MapPinned,
    accent: "from-teal-500 via-emerald-500 to-lime-500",
    response:
      "You can browse available turfs from the Turfs page. Each turf card shows the venue details so you can compare locations, timings, and booking availability.",
    cta: { label: "Browse Turfs", to: "/auth/turfs" },
    category: "Explore",
  },
  {
    id: "payment_help",
    title: "Payment issues",
    prompts: [
      "payment issue",
      "payment failed",
      "razorpay",
      "money deducted",
      "checkout problem",
    ],
    icon: CreditCard,
    accent: "from-slate-600 via-slate-700 to-slate-900",
    response:
      "If your payment fails or looks mismatched, first check whether the booking appears in My Bookings. If not, please contact support with the payment reference and booking details so the team can help quickly.",
    cta: { label: "Check My Bookings", to: "/auth/booking-history" },
    category: "Support",
  },
  {
    id: "support_help",
    title: "General support",
    prompts: [
      "support",
      "help",
      "issue",
      "problem",
      "contact support",
    ],
    icon: LifeBuoy,
    accent: "from-emerald-700 via-teal-700 to-cyan-700",
    response:
      "I can guide you through common PlayRizon actions here. For account, payment, booking mismatch, or email verification issues, please also contact PlayRizon support using the details provided in your emails.",
    cta: { label: "Open Profile", to: "/auth/profile" },
    category: "Support",
  },
];

const featuredGroups = [
  {
    title: "Booking",
    items: ["book_turf", "cancel_booking", "booking_history", "slot_unavailable"],
  },
  {
    title: "Rewards",
    items: ["loyalty_points", "coupon_help"],
  },
  {
    title: "Account",
    items: ["profile_help", "delete_profile", "become_owner"],
  },
  {
    title: "Help",
    items: ["reviews_help", "payment_help", "support_help", "location_help"],
  },
];

const initialMessage = {
  id: "welcome",
  role: "bot",
  title: "Welcome to PlayRizon Assistant",
  text:
    "Ask me anything about bookings, cancellations, rewards, profile management, owner requests, reviews, coupons, or support. You can also use the guided options below for quick help.",
};

const quickPromptIds = [
  "book_turf",
  "cancel_booking",
  "loyalty_points",
  "coupon_help",
  "payment_help",
  "profile_help",
];

const buildBotMessage = (entry) => ({
  id: `${entry.id}-${Date.now()}`,
  role: "bot",
  title: entry.title,
  text: entry.response,
  cta: entry.cta || null,
  category: entry.category,
  accent: entry.accent,
});

const buildFallbackMessage = (query) => ({
  id: `fallback-${Date.now()}`,
  role: "bot",
  title: "I can help with these topics",
  text:
    query.trim().length === 0
      ? "You can tap any option below to explore PlayRizon quickly."
      : "I didn’t find an exact match, but I can still guide you with bookings, rewards, profile actions, payments, and support.",
  cta: { label: "Open Turfs", to: "/auth/turfs" },
  category: "Support",
  accent: "from-slate-500 via-slate-600 to-slate-700",
});

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const tokenSet = (value) => new Set(normalizeText(value).split(" ").filter(Boolean));

const scoreMatch = (query, entry) => {
  const q = normalizeText(query);
  if (!q) return 0;

  // Strong signals
  if (entry.prompts.some((p) => q === normalizeText(p))) return 1000;
  if (entry.prompts.some((p) => q.includes(normalizeText(p)))) return 700;
  if (q.includes(normalizeText(entry.title))) return 520;

  // Token overlap (simple fuzzy)
  const qTokens = tokenSet(q);
  const entryTokens = tokenSet([entry.title, entry.category, ...entry.prompts].join(" "));
  let overlap = 0;
  for (const t of qTokens) {
    if (entryTokens.has(t)) overlap += 1;
  }
  return overlap * 80;
};

const findAnswer = (input) => {
  const query = normalizeText(input);
  if (!query) return null;

  const ranked = answerLibrary
    .map((entry) => ({ entry, score: scoreMatch(query, entry) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  return top && top.score >= 160 ? top.entry : null;
};

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const typingMessage = {
  id: TYPING_ID,
  role: "bot",
  title: "Thinking…",
  text: "",
  category: "",
  accent: "from-slate-500 via-slate-600 to-slate-700",
  isTyping: true,
};

const Chatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([initialMessage]);
  const [selectedGroup, setSelectedGroup] = useState("Booking");
  const [topicSearch, setTopicSearch] = useState("");
  // Default to a cleaner UI; user can expand panels when needed.
  const [showGuidedPanel, setShowGuidedPanel] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  const isMessagesRoute =
    location.pathname === "/messages" ||
    location.pathname.startsWith("/messages/") ||
    location.pathname === "/auth/messages" ||
    location.pathname.startsWith("/auth/messages/");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setIsOpen(Boolean(parsed?.isOpen));
      if (Array.isArray(parsed?.messages) && parsed.messages.length > 0) {
        setMessages(parsed.messages);
      }
      if (parsed?.selectedGroup) {
        setSelectedGroup(parsed.selectedGroup);
      }
      if (typeof parsed?.showGuidedPanel === "boolean") {
        setShowGuidedPanel(parsed.showGuidedPanel);
      }
      if (typeof parsed?.showQuickPrompts === "boolean") {
        setShowQuickPrompts(parsed.showQuickPrompts);
      }
    } catch (error) {
      console.error("Failed to load chatbot state", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ isOpen, messages, selectedGroup, showGuidedPanel, showQuickPrompts })
      );
    } catch (error) {
      console.error("Failed to save chatbot state", error);
    }
  }, [isOpen, messages, selectedGroup, showGuidedPanel, showQuickPrompts]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // Autofocus input on desktop for smooth usage.
    window.setTimeout(() => inputRef.current?.focus?.(), 50);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const shouldCollapseForViewport = window.innerHeight < 860 || window.innerWidth < 768;
    if (shouldCollapseForViewport) {
      setShowGuidedPanel(false);
      setShowQuickPrompts(false);
    }
  }, [isOpen]);

  const groupedActions = useMemo(() => {
    const currentGroup =
      featuredGroups.find((group) => group.title === selectedGroup) ||
      featuredGroups[0];

    return currentGroup.items
      .map((id) => answerLibrary.find((item) => item.id === id))
      .filter(Boolean);
  }, [selectedGroup]);

  const quickPrompts = useMemo(
    () =>
      quickPromptIds
        .map((id) => answerLibrary.find((item) => item.id === id))
        .filter(Boolean),
    []
  );

  const selectedGroupMeta = useMemo(
    () => featuredGroups.find((group) => group.title === selectedGroup) || featuredGroups[0],
    [selectedGroup]
  );

  const filteredTopics = useMemo(() => {
    const query = normalizeText(topicSearch);
    if (!query) return [];
    const ranked = answerLibrary
      .map((entry) => ({ entry, score: scoreMatch(query, entry) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((item) => item.entry);
    return ranked;
  }, [topicSearch]);

  const clearTyping = () => {
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setMessages((prev) => prev.filter((m) => m.id !== TYPING_ID));
  };

  const submitPrompt = (promptText) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    clearTyping();

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage, typingMessage]);
    setInput("");
    setIsOpen(true);
    setShowQuickPrompts(false);
    setShowGuidedPanel(false);

    if (inputRef.current) {
      inputRef.current.style.height = "24px";
    }

    typingTimerRef.current = window.setTimeout(() => {
      const answer = findAnswer(trimmed);
      const botMessage = answer ? buildBotMessage(answer) : buildFallbackMessage(trimmed);
      botMessage.createdAt = Date.now();
      setMessages((prev) => [...prev.filter((m) => m.id !== TYPING_ID), botMessage]);
      typingTimerRef.current = null;
    }, 420);
  };

  const resetChat = () => {
    clearTyping();
    setMessages([initialMessage]);
    setShowGuidedPanel(false);
    setShowQuickPrompts(true);
    setTopicSearch("");
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    if (event.target.value.trim()) {
      setShowQuickPrompts(false);
    }
    const element = event.target;
    element.style.height = "0px";
    element.style.height = `${Math.min(element.scrollHeight, 140)}px`;
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitPrompt(input);
    }
  };

  if (isMessagesRoute) {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[90] flex max-h-[calc(100vh-1.5rem)] flex-col items-end sm:bottom-6 sm:right-6 sm:max-h-[calc(100vh-2.5rem)] lg:bottom-8 lg:right-8 lg:max-h-[calc(100vh-4rem)]"
      style={{ maxWidth: "calc(100vw - 1.5rem)" }}
    >
      {isOpen ? (
        <div
          id="PlayRizon-chatbot-panel"
          className="chatbot-shell chatbot-shell-desktop mb-4 flex h-[min(78vh,46rem)] min-h-0 w-[min(calc(100vw-1rem),36rem)] flex-col overflow-hidden rounded-[30px] sm:w-[min(calc(100vw-2rem),44rem)] xl:w-[min(calc(100vw-2rem),52rem)]"
          style={{ maxHeight: "calc(100vh - 6.5rem)" }}
          role="dialog"
          aria-modal="false"
          aria-label="PlayRizon assistant"
        >
          <div className="chatbot-header shrink-0 px-5 pb-4 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="chatbot-badge h-14 w-14 rounded-[20px]">
                  <Bot size={24} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.34em] text-white/65">
                    PlayRizon AI
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-white">
                    Concierge Assistant
                  </h3>
                  <p className="mt-1 max-w-[16rem] text-xs leading-5 text-white/74">
                    Ask about bookings, rewards, profile actions, and support.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetChat}
                  className="chatbot-close-btn"
                  aria-label="Reset chatbot conversation"
                  title="Reset"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="chatbot-close-btn"
                  aria-label="Close chatbot"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-2 gap-2 sm:max-w-[22rem]" role="tablist" aria-label="Assistant topic groups">
              {featuredGroups.map((group) => (
                <button
                  key={group.title}
                  type="button"
                  onClick={() => setSelectedGroup(group.title)}
                  role="tab"
                  aria-selected={selectedGroup === group.title}
                  className={`chatbot-group-tab ${
                    selectedGroup === group.title ? "chatbot-group-tab-active" : ""
                  }`}
                >
                  {group.title}
                </button>
              ))}
              </div>

              <label className="chatbot-search">
                <span className="sr-only">Search help topics</span>
                <input
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="Search topics (e.g. cancel, coupon, payment)…"
                  className="chatbot-search-input"
                />
              </label>
            </div>
          </div>

          <div className="chatbot-body min-h-0 flex-1">
            <aside className="chatbot-sidebar">
              <div className="chatbot-sidebar-section">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="chatbot-kicker">{selectedGroupMeta.title} shortcuts</p>
                    <p className="chatbot-subtext">Click to ask instantly.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuidedPanel((prev) => !prev)}
                    className="chatbot-collapse-btn"
                    aria-expanded={showGuidedPanel}
                  >
                    {showGuidedPanel ? "Hide" : "Show"}
                    {showGuidedPanel ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                </div>

                {showGuidedPanel ? (
                  <div className="chatbot-sidebar-grid" aria-label={`${selectedGroup} guided actions`}>
                    {groupedActions.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => submitPrompt(item.prompts[0])}
                          className="chatbot-action-card rounded-[18px] p-3 text-left transition duration-200 hover:-translate-y-0.5"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-white shadow-lg shadow-black/10`}
                            >
                              <Icon size={17} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-[var(--chatbot-text-strong)]">
                                {item.title}
                              </p>
                              <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--chatbot-text-muted)]">
                                {item.category}
                              </p>
                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--chatbot-text-soft)]">
                                {item.response}
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="chatbot-sidebar-grid" aria-label="Collapsed shortcuts">
                    {groupedActions.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => submitPrompt(item.prompts[0])}
                        className="chatbot-quick-topic"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {topicSearch.trim() ? (
                <div className="chatbot-sidebar-section">
                  <p className="chatbot-kicker">Search results</p>
                  <div className="chatbot-sidebar-list">
                    {filteredTopics.length === 0 ? (
                      <div className="chatbot-empty">No matching topics. Try “booking”, “coupon”, “payment”.</div>
                    ) : (
                      filteredTopics.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => submitPrompt(item.prompts[0])}
                          className="chatbot-topic-row"
                        >
                          <span className="font-medium">{item.title}</span>
                          <span className="chatbot-pill">{item.category}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}

              {showQuickPrompts ? (
                <div className="chatbot-sidebar-section">
                  <div className="flex items-center justify-between gap-3">
                    <p className="chatbot-kicker">Popular prompts</p>
                    <button
                      type="button"
                      onClick={() => setShowQuickPrompts(false)}
                      className="chatbot-collapse-btn"
                    >
                      Hide <ChevronUp size={15} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => submitPrompt(item.prompts[0])}
                        className="chatbot-quick-chip"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chatbot-sidebar-section">
                  <button
                    type="button"
                    onClick={() => setShowQuickPrompts(true)}
                    className="chatbot-collapse-btn w-full justify-center"
                  >
                    Show popular prompts <ChevronDown size={15} />
                  </button>
                </div>
              )}
            </aside>

            <main className="chatbot-main">
              <div
                ref={listRef}
                className="chatbot-messages h-full min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
                aria-live="polite"
                aria-label="Assistant conversation"
              >
                <div className="chatbot-tip rounded-[22px] px-4 py-3 text-sm leading-6">
                  {'Try: "book a turf", "cancel booking", "loyalty points", or "payment failed".'}
                </div>

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-[24px] px-4 py-3 shadow-sm ${
                        message.role === "user"
                          ? "chatbot-user-bubble rounded-br-md"
                          : "chatbot-bot-bubble rounded-bl-md"
                      }`}
                    >
                      {message.role === "bot" ? (
                        <div className="mb-2 flex items-center gap-2">
                          <div
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br ${
                              message.accent || "from-emerald-500 to-cyan-500"
                            } text-white shadow-md shadow-black/10`}
                          >
                            <Bot size={15} />
                          </div>
                          <div className="min-w-0">
                            {message.title ? (
                              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--chatbot-answer-kicker)]">
                                {message.title}
                              </p>
                            ) : null}
                            {message.category ? (
                              <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--chatbot-text-muted)]">
                                {message.category}
                              </p>
                            ) : null}
                          </div>
                          {message.createdAt ? (
                            <p className="ml-auto text-[11px] text-[var(--chatbot-text-muted)]">
                              {formatTime(message.createdAt)}
                            </p>
                          ) : null}
                        </div>
                      ) : (
                        <div className="mb-1 flex items-center justify-between gap-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                            You
                          </p>
                          {message.createdAt ? (
                            <p className="text-[11px] text-white/55">{formatTime(message.createdAt)}</p>
                          ) : null}
                        </div>
                      )}

                      {message.isTyping ? (
                        <div className="chatbot-typing" aria-label="Assistant is typing">
                          <span className="chatbot-dot" />
                          <span className="chatbot-dot" />
                          <span className="chatbot-dot" />
                        </div>
                      ) : (
                        <p className="text-sm leading-6">{message.text}</p>
                      )}

                      {message.role === "bot" && message.cta ? (
                        <div className="mt-3">
                          <Link to={message.cta.to} className="chatbot-cta">
                            {message.cta.label}
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="chatbot-footer shrink-0 px-4 py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--chatbot-text-soft)]">
                  Message Assistant
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--chatbot-text-muted)]">
                  Type your question below. Press Enter to send and Shift+Enter for a new line.
                </p>
              </div>
              <button type="button" onClick={() => setTopicSearch("")} className="chatbot-collapse-btn">
                Clear search
              </button>
            </div>

            <form
              className="flex items-end gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                submitPrompt(input);
              }}
            >
              <label className="chatbot-input-shell chatbot-composer flex-1 rounded-[24px] px-4 py-3">
                <span className="mb-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--chatbot-text-soft)]">
                  <MessageSquareText size={14} />
                  Type Your Message Here
                </span>
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Ask anything about PlayRizon..."
                  className="chatbot-input w-full resize-none border-0 bg-transparent text-sm leading-6 outline-none"
                  aria-label="Ask the PlayRizon assistant a question"
                />
              </label>
              <button
                type="submit"
                disabled={!input.trim()}
                className="chatbot-send-btn"
                aria-label="Send message"
              >
                <SendHorizontal size={18} />
              </button>
            </form>

            <div className="mt-3 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={resetChat}
                className="text-xs font-medium text-[var(--chatbot-text-soft)] transition hover:text-[var(--chatbot-text-strong)]"
              >
                Reset conversation
              </button>
              <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--chatbot-text-muted)]">
                {messages.length - 1 > 0 ? `${messages.length - 1} messages in view` : "ready to help"}
              </p>
            </div>
              </div>
            </main>
          </div>
        </div>
      ) : null}

      <div className="relative shrink-0">
        {!isOpen ? (
          <div className="chatbot-hint pointer-events-none absolute -top-16 right-0 hidden rounded-[22px] px-4 py-3 text-xs leading-5 sm:block">
            Ask about bookings, rewards, coupons, reviews, support, and profile actions.
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="chatbot-launcher group relative flex items-center gap-3 rounded-full px-4 py-3 text-white transition duration-200 hover:scale-[1.02] shadow-2xl"
          aria-expanded={isOpen}
          aria-controls="PlayRizon-chatbot-panel"
          aria-label={isOpen ? "Close PlayRizon assistant" : "Open PlayRizon assistant"}
        >
          <div className="chatbot-launcher-icon relative flex h-11 w-11 items-center justify-center rounded-full">
            {isOpen ? <X size={18} /> : <MessageCircleMore size={18} />}
          </div>
          <div className="relative hidden text-left sm:block">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/65">
              PlayRizon
            </p>
            <p className="text-sm font-semibold">
              {isOpen ? "Close Assistant" : "Open Assistant"}
            </p>
          </div>
          {!isOpen ? (
            <div className="chatbot-launcher-pill absolute -left-2 -top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]">
              Live
            </div>
          ) : null}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
