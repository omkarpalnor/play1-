import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Archive,
  ChevronRight,
  Clock,
  Mail,
  MessageCircle,
  Plus,
  Reply,
  Search,
  Send,
  User,
  X,
} from "lucide-react";
import axiosInstance from "../../hooks/useAxiosInstance.js";
import { connectSocket, useConversationSocket } from "../../hooks/useSocket.js";
import {
  getReactionGroups,
  MESSAGE_REACTION_OPTIONS,
  truncateMessagePreview,
} from "./messageThreadUtils.js";

const conversationSchema = yup.object({
  subject: yup
    .string()
    .required("Subject is required")
    .min(5, "Subject must be at least 5 characters"),
  category: yup.string().required("Please select a category"),
  priority: yup.string().required("Please select a priority level"),
  message: yup
    .string()
    .required("Message is required")
    .min(10, "Message must be at least 10 characters"),
  recipientType: yup.string().required("Please select recipient type"),
  recipientEmail: yup.string().when("recipientType", {
    is: "owner",
    then: (schema) =>
      schema
        .required("Owner email is required")
        .email("Please provide a valid email"),
    otherwise: (schema) => schema.optional(),
  }),
});

const replySchema = yup.object({
  content: yup
    .string()
    .required("Message is required")
    .min(1, "Message is required"),
});

const categories = [
  {
    value: "general",
    label: "General Inquiry",
    color: "badge badge-info badge-outline",
  },
  {
    value: "booking",
    label: "Booking Issue",
    color: "badge badge-success badge-outline",
  },
  {
    value: "payment",
    label: "Payment Problem",
    color: "badge badge-warning badge-outline",
  },
  {
    value: "technical",
    label: "Technical Support",
    color: "badge badge-secondary badge-outline",
  },
  {
    value: "feedback",
    label: "Feedback",
    color: "badge badge-accent badge-outline",
  },
  {
    value: "complaint",
    label: "Complaint",
    color: "badge badge-error badge-outline",
  },
];

const priorities = [
  { value: "low", label: "Low", color: "badge badge-success" },
  { value: "medium", label: "Medium", color: "badge badge-warning" },
  { value: "high", label: "High", color: "badge badge-error badge-outline" },
  { value: "urgent", label: "Urgent", color: "badge badge-error" },
];

const formatRoleLabel = (value) => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "owner") return "Owner";
  if (normalized === "user") return "User";
  return value || "Participant";
};

const getConversationCounterpart = (conversation, currentUserType = "User") => {
  if (conversation?.counterpart) {
    return {
      name: conversation.counterpart.name || "Unknown recipient",
      role: formatRoleLabel(conversation.counterpart.userType),
      email: conversation.counterpart.email || "",
    };
  }
  const participants = Array.isArray(conversation?.participants)
    ? conversation.participants
    : [];
  const counterpart =
    participants.find(
      (participant) => participant?.userType !== currentUserType,
    ) || participants[0];
  const fallbackSender =
    conversation?.lastMessage?.sender?.userType &&
    conversation.lastMessage.sender.userType !== currentUserType
      ? conversation.lastMessage.sender.user
      : null;
  const fallbackCreator =
    conversation?.createdBy?.userType &&
    conversation.createdBy.userType !== currentUserType
      ? conversation.createdBy.user
      : null;
  return {
    name:
      counterpart?.user?.name ||
      fallbackSender?.name ||
      fallbackCreator?.name ||
      "Unknown recipient",
    role: formatRoleLabel(counterpart?.userType),
    email:
      counterpart?.user?.email ||
      fallbackSender?.email ||
      fallbackCreator?.email ||
      "",
  };
};

const getSenderMeta = (message) => ({
  name:
    message?.sender?.user?.name ||
    message?.sender?.userType ||
    "Unknown sender",
  role: formatRoleLabel(message?.sender?.userType),
});

const UserMessages = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mailbox, setMailbox] = useState("inbox");
  const [filterStatus, setFilterStatus] = useState("all");
  const [owners, setOwners] = useState([]);
  const [showOwnerSearch, setShowOwnerSearch] = useState(false);
  const [ownerSearchLoading, setOwnerSearchLoading] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const socket = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    register: registerConversation,
    handleSubmit: handleConversationSubmit,
    watch,
    reset: resetConversationForm,
    formState: { errors: conversationErrors },
  } = useForm({
    resolver: yupResolver(conversationSchema),
    defaultValues: {
      recipientType: "admin",
      priority: "medium",
      category: "general",
      recipientEmail: "",
    },
  });

  const {
    register: registerReply,
    handleSubmit: handleReplySubmit,
    reset: resetReplyForm,
    formState: { errors: replyErrors },
  } = useForm({
    resolver: yupResolver(replySchema),
    defaultValues: { content: "" },
  });

  const recipientType = watch("recipientType");

  const syncUpdatedMessage = useCallback((updatedMessage) => {
    if (!updatedMessage?.id) {
      return;
    }

    setMessages((prev) =>
      prev.map((message) =>
        message.id === updatedMessage.id ? updatedMessage : message,
      ),
    );
    setSelectedConversation((prev) => {
      if (!prev?.lastMessage?.id || prev.lastMessage.id !== updatedMessage.id) {
        return prev;
      }

      return {
        ...prev,
        lastMessage: updatedMessage,
      };
    });
  }, []);

  const fetchConversations = useCallback(
    async (page = 1, currentMailbox = mailbox) => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `/api/user/messages?page=${page}&limit=${pagination.limit}&box=${currentMailbox}`,
        );
        if (response.data.success) {
          setConversations(response.data.conversations);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        console.error("Fetch conversations error:", error);
        toast.error("Failed to fetch conversations");
      } finally {
        setLoading(false);
      }
    },
    [mailbox, pagination.limit],
  );

  const fetchMessages = async (id, page = 1) => {
    try {
      setMessagesLoading(true);
      const response = await axiosInstance.get(
        `/api/user/messages/${id}?page=${page}&limit=50`,
      );
      if (response.data.success) {
        setMessages(response.data.messages);
        setSelectedConversation(response.data.conversation);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
      toast.error("Failed to fetch messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const searchOwners = async (search = "") => {
    try {
      setOwnerSearchLoading(true);
      const response = await axiosInstance.get(
        `/api/user/messages/owners?search=${encodeURIComponent(search)}&limit=10`,
      );
      if (response.data.success) {
        setOwners(response.data.owners);
      }
    } catch (error) {
      console.error("Search owners error:", error);
      toast.error("Failed to load owners");
    } finally {
      setOwnerSearchLoading(false);
    }
  };

  const startConversation = async (formData) => {
    try {
      const response = await axiosInstance.post(
        "/api/user/messages/start",
        formData,
      );
      if (response.data.success) {
        resetConversationForm({
          recipientType: "admin",
          priority: "medium",
          category: "general",
          recipientEmail: "",
          subject: "",
          message: "",
        });
        setShowNewConversation(false);
        setShowOwnerSearch(false);
        await fetchConversations(1, mailbox);
        navigate(`/auth/messages/${response.data.conversation.id}`);
        toast.success(
          response.data.reused
            ? "Opened existing conversation"
            : "Conversation started successfully",
        );
      }
    } catch (error) {
      console.error("Start conversation error:", error);
      toast.error(
        error.response?.data?.message || "Failed to start conversation",
      );
    }
  };

  const sendReply = async (formData) => {
    if (!selectedConversation?.id) {
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/api/user/messages/${selectedConversation.id}/send`,
        {
          ...formData,
          replyTo: replyTarget?.id || null,
        },
      );
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                lastMessage: response.data.message,
                lastMessageAt: response.data.message.createdAt,
              }
            : prev,
        );
        resetReplyForm({ content: "" });
        setReplyTarget(null);
        await fetchConversations(pagination.page, mailbox);
        toast.success("Message sent successfully");
      }
    } catch (error) {
      console.error("Send reply error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const toggleReaction = async (messageId, reaction) => {
    try {
      const response = await axiosInstance.patch(
        `/api/user/messages/message/${messageId}/reaction`,
        { reaction },
      );

      if (response.data.success) {
        syncUpdatedMessage(response.data.updatedMessage);
      }
    } catch (error) {
      console.error("Toggle user reaction error:", error);
      toast.error(error.response?.data?.message || "Failed to update reaction");
    }
  };

  const handleTyping = useCallback(() => {
    if (!socket.current?.connected || !selectedConversation?.id) return;
    socket.current.emit("typing_start", {
      conversationId: selectedConversation.id,
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.current?.emit("typing_stop", {
        conversationId: selectedConversation.id,
      });
    }, 1500);
  }, [selectedConversation]);

  const archiveConversation = async (id) => {
    try {
      const response = await axiosInstance.patch(
        `/api/user/messages/${id}/archive`,
      );
      if (response.data.success) {
        setConversations((prev) =>
          prev.filter((conversation) => conversation.id !== id),
        );
        if (selectedConversation?.id === id) {
          navigate("/auth/messages");
          setSelectedConversation(null);
          setMessages([]);
        }
        toast.success("Conversation archived successfully");
      }
    } catch (error) {
      console.error("Archive conversation error:", error);
      toast.error("Failed to archive conversation");
    }
  };

  const unarchiveConversation = async (id) => {
    try {
      const response = await axiosInstance.patch(
        `/api/user/messages/${id}/unarchive`,
      );
      if (response.data.success) {
        if (mailbox === "archived") {
          setConversations((prev) =>
            prev.filter((conversation) => conversation.id !== id),
          );
          navigate("/auth/messages");
          setSelectedConversation(null);
          setMessages([]);
        } else {
          await fetchConversations(pagination.page, mailbox);
        }
        toast.success("Conversation unarchived successfully");
      }
    } catch (error) {
      console.error("Unarchive conversation error:", error);
      toast.error("Failed to unarchive conversation");
    }
  };

  useEffect(() => {
    fetchConversations(1, mailbox);
  }, [fetchConversations, mailbox]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      setSelectedConversation(null);
      setMessages([]);
    }
    setReplyTarget(null);
  }, [conversationId]);

  useEffect(() => {
    if (recipientType === "owner") {
      setShowOwnerSearch(true);
      searchOwners();
    } else {
      setShowOwnerSearch(false);
    }
  }, [recipientType]);

  // Connect socket on mount
  useEffect(() => {
    const s = connectSocket();
    socket.current = s;
    if (s) {
      setIsConnected(s.connected);
      s.on("connect", () => setIsConnected(true));
      s.on("disconnect", () => setIsConnected(false));
      s.on("new_conversation", ({ conversation }) => {
        fetchConversations(1, mailbox);
      });
      s.on("unread_update", ({ conversationId: cid, unreadCount }) => {
        setConversations((prev) =>
          prev.map((c) => (c.id === cid ? { ...c, unreadCount } : c)),
        );
      });
    }
    return () => {
      if (s) {
        s.off("connect");
        s.off("disconnect");
        s.off("new_conversation");
        s.off("unread_update");
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Real-time: join conversation room and handle live events
  useConversationSocket(conversationId, {
    onNewMessage: useCallback(
      (message) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessageAt: message.createdAt, lastMessage: message }
              : c,
          ),
        );
        if (socket.current?.connected) {
          socket.current.emit("mark_read", { conversationId });
        }
      },
      [conversationId],
    ),

    onMessageUpdated: useCallback((message) => {
      syncUpdatedMessage(message);
    }, [syncUpdatedMessage]),

    onTypingStart: useCallback((data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: data.userName || "Someone",
      }));
    }, []),

    onTypingStop: useCallback((data) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
    }, []),
  });

  const formatTime = (value) =>
    new Date(value).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const filteredConversations = conversations.filter((conversation) => {
    const counterpart = getConversationCounterpart(conversation, "User");
    const normalizedSearch = searchTerm.toLowerCase();
    const subjectMatches =
      conversation.subject.toLowerCase().includes(normalizedSearch) ||
      counterpart.name.toLowerCase().includes(normalizedSearch) ||
      counterpart.role.toLowerCase().includes(normalizedSearch);
    const statusMatches =
      filterStatus === "all" || conversation.status === filterStatus;
    return subjectMatches && statusMatches;
  });

  const selectedRecipient = getConversationCounterpart(
    selectedConversation,
    "User",
  );

  const getConversationPreview = (conversation) =>
    conversation?.lastMessage?.content?.trim() ||
    conversation?.subject ||
    "No preview available yet.";

  return (
    <div className="bg-base-200 text-base-content">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              Support Messages
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${isConnected ? "bg-success" : "bg-warning animate-pulse"}`}
                title={isConnected ? "Live" : "Connecting..."}
              />
            </h1>
            <p className="text-base-content/70">
              Talk to PlayRizon support or reach a turf owner directly when you
              need help.
            </p>
          </div>
          <button
            className="btn btn-primary gap-2"
            onClick={() => setShowNewConversation(true)}
          >
            <Plus size={18} />
            New Conversation
          </button>
        </div>

        {conversationId ? (
          <div className="grid gap-6 lg:min-h-[calc(100vh-11.5rem)] lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
              <Link to="/auth/messages" className="btn btn-ghost gap-2 pl-0">
                <ChevronRight className="rotate-180" size={16} />
                Back to Conversations
              </Link>

              {selectedConversation ? (
                <div className="card border border-base-300 bg-base-100 shadow-sm lg:flex-1">
                  <div className="card-body gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <MessageCircle size={20} />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold">
                          {selectedConversation.subject}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={
                              categories.find(
                                (item) =>
                                  item.value === selectedConversation.category,
                              )?.color
                            }
                          >
                            {selectedConversation.category}
                          </span>
                          <span
                            className={
                              priorities.find(
                                (item) =>
                                  item.value === selectedConversation.priority,
                              )?.color
                            }
                          >
                            {selectedConversation.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-base-content/70">
                      <div className="rounded-2xl border border-base-300 bg-base-200/70 p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
                          Recipient Role
                        </p>
                        <p className="mt-1 text-sm font-semibold text-base-content">
                          {selectedRecipient.role}
                        </p>
                        <p className="text-sm text-base-content/70">
                          {selectedRecipient.name}
                        </p>
                        {selectedRecipient.email ? (
                          <p className="text-xs text-base-content/55">
                            {selectedRecipient.email}
                          </p>
                        ) : null}
                      </div>
                      <p>
                        <span className="font-semibold text-base-content">
                          Status:
                        </span>{" "}
                        <span className="badge badge-success badge-outline">
                          {selectedConversation.status}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-base-content">
                          Created:
                        </span>{" "}
                        {new Date(
                          selectedConversation.createdAt,
                        ).toLocaleDateString()}
                      </p>
                      <p>
                        <span className="font-semibold text-base-content">
                          Updated:
                        </span>{" "}
                        {formatTime(selectedConversation.lastMessageAt)}
                      </p>
                    </div>

                    <button
                      className="btn btn-outline gap-2"
                      onClick={() =>
                        selectedConversation.isArchivedForCurrentUser
                          ? unarchiveConversation(selectedConversation.id)
                          : archiveConversation(selectedConversation.id)
                      }
                    >
                      <Archive size={18} />
                      {selectedConversation.isArchivedForCurrentUser
                        ? "Unarchive Conversation"
                        : "Archive Conversation"}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="card border border-base-300 bg-base-100 shadow-sm lg:min-h-0">
              <div className="card-body flex min-h-[32rem] flex-col lg:h-full lg:min-h-0">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedConversation?.subject || "Conversation"}
                    </h2>
                    <p className="text-sm text-base-content/60">
                      Messages are shown oldest to newest.
                    </p>
                  </div>
                </div>

                <div className="min-h-[24rem] flex-1 overflow-y-auto rounded-2xl border border-base-300 bg-base-200 p-4 lg:min-h-0">
                  {messagesLoading ? (
                    <div className="flex h-full items-center justify-center">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-base-content/60">
                      No messages yet.
                    </div>
                  ) : (
                    <div className="space-y-4 lg:space-y-5">
                      {messages.map((message) => {
                        const isCurrentUser =
                          message.sender.userType === "User";
                        const senderMeta = getSenderMeta(message);
                        const replyMeta = message.replyTo
                          ? getSenderMeta(message.replyTo)
                          : null;
                        const reactionGroups = getReactionGroups(message.reactions);
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[min(100%,48rem)] rounded-2xl px-4 py-3 shadow-sm lg:max-w-[min(100%,56rem)] ${
                                isCurrentUser
                                  ? "bg-primary text-primary-content"
                                  : "bg-base-100 text-base-content border border-base-300"
                              }`}
                            >
                              <div className="mb-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                                  {senderMeta.role}
                                </p>
                                <p className="text-xs opacity-85">
                                  {senderMeta.name}
                                </p>
                                <p className="text-[11px] opacity-70">
                                  {formatTime(message.createdAt)}
                                </p>
                              </div>
                              {message.replyTo ? (
                                <div
                                  className={`mb-3 rounded-2xl border px-3 py-2 text-left ${
                                    isCurrentUser
                                      ? "border-primary-content/15 bg-primary-content/10 text-primary-content"
                                      : "border-base-300 bg-base-200/80 text-base-content"
                                  }`}
                                >
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
                                    Replying to {replyMeta?.name || "Message"}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 opacity-80">
                                    {truncateMessagePreview(message.replyTo.content)}
                                  </p>
                                </div>
                              ) : null}
                              <p className="break-words whitespace-pre-wrap text-sm leading-7">
                                {message.content}
                              </p>
                              {reactionGroups.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {reactionGroups.map((reactionGroup) => (
                                    <button
                                      key={`${message.id}-${reactionGroup.emoji}`}
                                      type="button"
                                      onClick={() =>
                                        toggleReaction(message.id, reactionGroup.emoji)
                                      }
                                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                                        isCurrentUser
                                          ? "border-primary-content/20 bg-primary-content/10 text-primary-content hover:bg-primary-content/20"
                                          : "border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                                      }`}
                                    >
                                      <span>{reactionGroup.emoji}</span>
                                      <span>{reactionGroup.count}</span>
                                    </button>
                                  ))}
                                </div>
                              ) : null}
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyTarget(message)}
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition ${
                                    isCurrentUser
                                      ? "border-primary-content/20 bg-primary-content/10 text-primary-content hover:bg-primary-content/20"
                                      : "border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                                  }`}
                                >
                                  <Reply size={12} />
                                  Reply
                                </button>
                                {MESSAGE_REACTION_OPTIONS.map((emoji) => (
                                  <button
                                    key={`${message.id}-${emoji}-picker`}
                                    type="button"
                                    onClick={() => toggleReaction(message.id, emoji)}
                                    className={`rounded-full border px-2 py-1 text-xs transition ${
                                      isCurrentUser
                                        ? "border-primary-content/20 bg-primary-content/10 text-primary-content hover:bg-primary-content/20"
                                        : "border-base-300 bg-base-100 text-base-content hover:bg-base-200"
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {/* Typing indicator */}
                      {Object.values(typingUsers).length > 0 && (
                        <div className="flex justify-start">
                          <div className="rounded-2xl bg-base-100 border border-base-300 px-4 py-3 text-sm text-base-content/60 flex items-center gap-2">
                            <span className="flex gap-1">
                              <span
                                className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                                style={{ animationDelay: "0ms" }}
                              />
                              <span
                                className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                                style={{ animationDelay: "150ms" }}
                              />
                              <span
                                className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
                                style={{ animationDelay: "300ms" }}
                              />
                            </span>
                            <span>
                              {Object.values(typingUsers)[0]} is typing...
                            </span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleReplySubmit(sendReply)}
                  className="mt-4 space-y-2"
                >
                  {replyTarget ? (
                    <div className="rounded-2xl border border-base-300 bg-base-200/80 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/55">
                            Replying to {getSenderMeta(replyTarget).name}
                          </p>
                          <p className="mt-1 break-words text-sm text-base-content/75">
                            {truncateMessagePreview(replyTarget.content, 160)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs btn-circle"
                          onClick={() => setReplyTarget(null)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <textarea
                      {...registerReply("content")}
                      placeholder={
                        replyTarget ? "Write your reply to this message..." : "Type your reply..."
                      }
                      rows={3}
                      onInput={handleTyping}
                      className="textarea textarea-bordered w-full resize-none rounded-2xl leading-6"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary gap-2 sm:min-w-28"
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </div>
                  {replyErrors.content ? (
                    <p className="text-sm text-error">
                      {replyErrors.content.message}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 rounded-3xl border border-base-300 bg-base-100 p-4 shadow-sm lg:grid-cols-[1fr_160px_180px]">
              <label className="input input-bordered flex items-center gap-3">
                <Search size={16} className="text-base-content/50" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search conversations..."
                  className="grow"
                />
              </label>
              <select
                className="select select-bordered w-full"
                value={mailbox}
                onChange={(event) => setMailbox(event.target.value)}
              >
                <option value="inbox">Inbox</option>
                <option value="archived">Archived</option>
              </select>
              <select
                className="select select-bordered w-full"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body items-center py-16">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="card border border-dashed border-base-300 bg-base-100 shadow-sm">
                  <div className="card-body items-center py-16 text-center">
                    <Mail size={48} className="text-base-content/35" />
                    <h2 className="mt-4 text-xl font-semibold">
                      No conversations yet
                    </h2>
                    <p className="max-w-md text-base-content/65">
                      Start your first support conversation to contact PlayRizon
                      admin or a turf owner.
                    </p>
                    <button
                      className="btn btn-primary mt-4"
                      onClick={() => setShowNewConversation(true)}
                    >
                      Start Conversation
                    </button>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conversation) =>
                  (() => {
                    const counterpart = getConversationCounterpart(
                      conversation,
                      "User",
                    );
                    const previewText = getConversationPreview(conversation);
                    return (
                      <Link
                        key={conversation.id}
                        to={`/auth/messages/${conversation.id}`}
                        className="card border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="card-body">
                          <div className="flex items-start gap-4">
                            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                              <MessageCircle size={22} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
                                <div>
                                  <h2 className="truncate text-xl font-semibold text-base-content">
                                    {counterpart.name}
                                  </h2>
                                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">
                                    {counterpart.role}
                                  </p>
                                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-base-content/75">
                                    {previewText}
                                  </p>
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <span
                                      className={
                                        categories.find(
                                          (item) =>
                                            item.value ===
                                            conversation.category,
                                        )?.color
                                      }
                                    >
                                      {conversation.category}
                                    </span>
                                    <span
                                      className={
                                        priorities.find(
                                          (item) =>
                                            item.value ===
                                            conversation.priority,
                                        )?.color
                                      }
                                    >
                                      {conversation.priority}
                                    </span>
                                    {conversation.unreadCount > 0 ? (
                                      <span className="badge badge-error">
                                        {conversation.unreadCount} new
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-base-content/60">
                                  <Clock size={14} />
                                  {formatTime(conversation.lastMessageAt)}
                                </div>
                              </div>
                              <p className="text-xs uppercase tracking-[0.16em] text-base-content/35">
                                {conversation.subject}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })(),
                )
              )}
            </div>
          </>
        )}

        {showNewConversation ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
              <div className="flex items-center justify-between border-b border-base-300 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-semibold">
                    Start a New Conversation
                  </h2>
                  <p className="text-sm text-base-content/60">
                    Reach PlayRizon admin or contact a turf owner directly.
                  </p>
                </div>
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={() => setShowNewConversation(false)}
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleConversationSubmit(startConversation)}
                className="space-y-5 px-6 py-6"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">
                        Recipient Type
                      </span>
                    </label>
                    <select
                      {...registerConversation("recipientType")}
                      className="select select-bordered w-full"
                    >
                      <option value="admin">PlayRizon Admin</option>
                      <option value="owner">Turf Owner</option>
                    </select>
                    {conversationErrors.recipientType ? (
                      <p className="mt-2 text-sm text-error">
                        {conversationErrors.recipientType.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Subject</span>
                    </label>
                    <input
                      {...registerConversation("subject")}
                      className="input input-bordered w-full"
                    />
                    {conversationErrors.subject ? (
                      <p className="mt-2 text-sm text-error">
                        {conversationErrors.subject.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Category</span>
                    </label>
                    <select
                      {...registerConversation("category")}
                      className="select select-bordered w-full"
                    >
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {conversationErrors.category ? (
                      <p className="mt-2 text-sm text-error">
                        {conversationErrors.category.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Priority</span>
                    </label>
                    <select
                      {...registerConversation("priority")}
                      className="select select-bordered w-full"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                    {conversationErrors.priority ? (
                      <p className="mt-2 text-sm text-error">
                        {conversationErrors.priority.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                {recipientType === "owner" ? (
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">
                        Choose a Turf Owner
                      </span>
                    </label>
                    <div className="mb-3 flex gap-3">
                      <label className="input input-bordered flex items-center gap-2">
                        <Search size={16} className="text-base-content/50" />
                        <input
                          type="text"
                          className="grow"
                          placeholder="Search owners by name or email"
                          onChange={(event) => searchOwners(event.target.value)}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-outline gap-2"
                        onClick={() => setShowOwnerSearch((value) => !value)}
                      >
                        <User size={16} />
                        {showOwnerSearch ? "Hide" : "Show"} Owners
                      </button>
                    </div>
                    {showOwnerSearch ? (
                      <div className="max-h-48 overflow-y-auto rounded-2xl border border-base-300 bg-base-200 p-2">
                        {ownerSearchLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <span className="loading loading-spinner loading-md text-primary"></span>
                          </div>
                        ) : owners.length === 0 ? (
                          <div className="py-8 text-center text-sm text-base-content/60">
                            No owners found.
                          </div>
                        ) : (
                          owners.map((owner) => (
                            <label
                              key={owner.id}
                              className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 hover:bg-base-100"
                            >
                              <input
                                {...registerConversation("recipientEmail")}
                                type="radio"
                                value={owner.email}
                                className="radio radio-primary radio-sm"
                              />
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/50">
                                  Owner
                                </div>
                                <div className="font-medium">{owner.name}</div>
                                <div className="text-sm text-base-content/60">
                                  {owner.email}
                                </div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    ) : null}
                    {conversationErrors.recipientEmail ? (
                      <p className="mt-2 text-sm text-error">
                        {conversationErrors.recipientEmail.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Message</span>
                  </label>
                  <textarea
                    {...registerConversation("message")}
                    rows={5}
                    className="textarea textarea-bordered w-full"
                    placeholder="Write your question or issue here..."
                  />
                  {conversationErrors.message ? (
                    <p className="mt-2 text-sm text-error">
                      {conversationErrors.message.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowNewConversation(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary gap-2">
                    <Send size={16} />
                    Start Conversation
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default UserMessages;
