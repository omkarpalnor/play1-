import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import {
  Bot,
  ChevronRight,
  Clock,
  FileUp,
  Mail,
  MessageCircle,
  Plus,
  RefreshCw,
  Reply,
  Search,
  Send,
  Shield,
  X,
} from "lucide-react";
import axiosInstance from "@hooks/useAxiosInstance";
import { connectSocket, useConversationSocket } from "../../../hooks/useSocket.js";
import {
  getReactionGroups,
  MESSAGE_REACTION_OPTIONS,
  getMessagePreviewText,
  shouldRenderMessageText,
} from "../../messages/messageThreadUtils.js";
import MessageAttachments from "../../messages/MessageAttachments.jsx";

const conversationSchema = yup.object({
  subject: yup.string().required("Subject is required").min(5, "Subject must be at least 5 characters"),
  category: yup.string().required("Please select a category"),
  priority: yup.string().required("Please select a priority level"),
  message: yup.string().max(2000, "Message must be 2000 characters or less"),
  recipientType: yup.string().required("Please select recipient type"),
  recipientEmail: yup.string().required("Recipient email is required").email("Please provide a valid email"),
});

const replySchema = yup.object({
  content: yup.string().max(2000, "Message must be 2000 characters or less"),
});

const autoReplySchema = yup.object({
  enabled: yup.boolean().default(false),
  message: yup
    .string()
    .trim()
    .max(1000, "Auto-reply message must be 1000 characters or less")
    .when("enabled", {
      is: true,
      then: (schema) =>
        schema
          .required("Auto-reply message is required when auto-reply is enabled")
          .min(10, "Auto-reply message must be at least 10 characters"),
      otherwise: (schema) => schema,
    }),
  delay: yup
    .number()
    .typeError("Delay must be a number")
    .required("Delay is required")
    .integer("Delay must be a whole number")
    .min(1, "Delay must be at least 1 minute")
    .max(1440, "Delay cannot be more than 1440 minutes"),
});

const categories = [
  { value: "general", label: "General Inquiry", color: "badge badge-info badge-outline" },
  { value: "booking", label: "Booking Issue", color: "badge badge-success badge-outline" },
  { value: "payment", label: "Payment Problem", color: "badge badge-warning badge-outline" },
  { value: "technical", label: "Technical Support", color: "badge badge-secondary badge-outline" },
  { value: "feedback", label: "Feedback", color: "badge badge-accent badge-outline" },
  { value: "complaint", label: "Complaint", color: "badge badge-error badge-outline" },
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

const getConversationCounterpart = (conversation, currentUserType = "Admin") => {
  if (conversation?.counterpart) {
    return {
      name: conversation.counterpart.name || "Unknown recipient",
      role: formatRoleLabel(conversation.counterpart.userType),
      email: conversation.counterpart.email || "",
    };
  }
  const participants = Array.isArray(conversation?.participants) ? conversation.participants : [];
  const counterpart = participants.find((participant) => participant?.userType !== currentUserType) || participants[0];
  const participantName =
    counterpart?.user?.name ||
    conversation?.recipientName ||
    conversation?.recipient?.name ||
    "Unknown recipient";

  return {
    name: participantName,
    role: formatRoleLabel(counterpart?.userType),
    email: counterpart?.user?.email || "",
  };
};

const getSenderMeta = (message) => ({
  name: message?.sender?.user?.name || message?.sender?.userType || "Unknown sender",
  role: formatRoleLabel(message?.sender?.userType),
});

const getAutoReplyDefaults = (conversation) => ({
  enabled: Boolean(conversation?.autoReply?.enabled),
  message: conversation?.autoReply?.message || "",
  delay: conversation?.autoReply?.delay || 5,
});

const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const AdminMessages = () => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [recipientOptions, setRecipientOptions] = useState([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mailbox, setMailbox] = useState("inbox");
  const [filterStatus, setFilterStatus] = useState("all");
  const [autoReplySaving, setAutoReplySaving] = useState(false);
  const [processingAutoReplies, setProcessingAutoReplies] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [composerAttachments, setComposerAttachments] = useState([]);
  const [newConversationAttachments, setNewConversationAttachments] = useState([]);
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const composerFileInputRef = useRef(null);
  const newConversationFileInputRef = useRef(null);

  const {
    register: registerConversation,
    handleSubmit: handleConversationSubmit,
    watch,
    reset: resetConversationForm,
    formState: { errors: conversationErrors },
  } = useForm({
    resolver: yupResolver(conversationSchema),
    defaultValues: {
      recipientType: "user",
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

  const {
    register: registerAutoReply,
    handleSubmit: handleAutoReplySubmit,
    reset: resetAutoReplyForm,
    watch: watchAutoReply,
    formState: { errors: autoReplyErrors },
  } = useForm({
    resolver: yupResolver(autoReplySchema),
    defaultValues: getAutoReplyDefaults(),
  });

  const recipientType = watch("recipientType");
  const autoReplyEnabled = watchAutoReply("enabled");

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
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.lastMessage?.id === updatedMessage.id
          ? {
              ...conversation,
              lastMessage: updatedMessage,
            }
          : conversation,
      ),
    );
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/admin/messages/stats");
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Fetch message stats error:", error);
    }
  }, []);

  const fetchConversations = useCallback(async (currentMailbox = mailbox) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/admin/messages?box=${currentMailbox}`);
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error("Fetch admin conversations error:", error);
      toast.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  }, [mailbox]);

  const fetchMessages = async (id) => {
    try {
      setMessagesLoading(true);
      const response = await axiosInstance.get(`/api/admin/messages/${id}`);
      if (response.data.success) {
        setMessages(response.data.messages);
        setSelectedConversation(response.data.conversation);
      }
    } catch (error) {
      console.error("Fetch admin messages error:", error);
      toast.error("Failed to fetch messages");
    } finally {
      setMessagesLoading(false);
    }
  };

  const fetchRecipients = async (type, search = "") => {
    try {
      setRecipientLoading(true);
      const endpoint = type === "owner" ? "owners" : "users";
      const response = await axiosInstance.get(
        `/api/admin/messages/${endpoint}?search=${encodeURIComponent(search)}&limit=10`
      );
      if (response.data.success) {
        setRecipientOptions(type === "owner" ? response.data.owners : response.data.users);
      }
    } catch (error) {
      console.error("Fetch admin recipients error:", error);
      toast.error("Failed to load recipients");
    } finally {
      setRecipientLoading(false);
    }
  };

  const startConversation = async (formData) => {
    try {
      const normalizedMessage = String(formData.message || "").trim();
      if (!normalizedMessage && newConversationAttachments.length === 0) {
        toast.error("Add a message or at least one attachment");
        return;
      }

      const payload = new FormData();
      payload.append("recipientType", formData.recipientType);
      payload.append("recipientEmail", formData.recipientEmail || "");
      payload.append("subject", formData.subject);
      payload.append("category", formData.category);
      payload.append("priority", formData.priority);
      payload.append("message", normalizedMessage);
      newConversationAttachments.forEach((file) => {
        payload.append("attachments", file);
      });

      const response = await axiosInstance.post("/api/admin/messages/start", payload);
      if (response.data.success) {
        resetConversationForm({
          recipientType: "user",
          priority: "medium",
          category: "general",
          recipientEmail: "",
          subject: "",
          message: "",
        });
        setShowNewConversation(false);
        setNewConversationAttachments([]);
        if (newConversationFileInputRef.current) {
          newConversationFileInputRef.current.value = "";
        }
        await fetchConversations(mailbox);
        await fetchStats();
        navigate(`/admin/messages/${response.data.conversation.id}`);
        toast.success(response.data.reused ? "Opened existing conversation" : "Conversation started successfully");
      }
    } catch (error) {
      console.error("Start admin conversation error:", error);
      toast.error(error.response?.data?.message || "Failed to start conversation");
    }
  };

  const sendReply = async (formData) => {
    if (!selectedConversation?.id) {
      return;
    }

    try {
      const normalizedContent = String(formData.content || "").trim();
      if (!normalizedContent && composerAttachments.length === 0) {
        toast.error("Add a message or at least one attachment");
        return;
      }

      const payload = new FormData();
      payload.append("content", normalizedContent);
      payload.append("replyTo", replyTarget?.id || "");
      composerAttachments.forEach((file) => {
        payload.append("attachments", file);
      });

      const response = await axiosInstance.post(
        `/api/admin/messages/${selectedConversation.id}/send`,
        payload,
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
            : prev
        );
        resetReplyForm({ content: "" });
        setReplyTarget(null);
        setComposerAttachments([]);
        if (composerFileInputRef.current) {
          composerFileInputRef.current.value = "";
        }
        await fetchConversations(mailbox);
        await fetchStats();
        toast.success("Message sent successfully");
      }
    } catch (error) {
      console.error("Send admin reply error:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const toggleReaction = async (messageId, reaction) => {
    try {
      const response = await axiosInstance.patch(
        `/api/admin/messages/message/${messageId}/reaction`,
        { reaction }
      );

      if (response.data.success) {
        syncUpdatedMessage(response.data.updatedMessage);
      }
    } catch (error) {
      console.error("Toggle admin reaction error:", error);
      toast.error(error.response?.data?.message || "Failed to update reaction");
    }
  };

  const updateStatus = async (status) => {
    if (!selectedConversation?.id) {
      return;
    }

    try {
      const response = await axiosInstance.patch(`/api/admin/messages/${selectedConversation.id}/status`, { status });
      if (response.data.success) {
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                status: response.data.conversation.status,
                updatedAt: response.data.conversation.updatedAt,
              }
            : prev
        );
        await fetchConversations(mailbox);
        await fetchStats();
        toast.success("Conversation status updated");
      }
    } catch (error) {
      console.error("Update admin message status error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const saveAutoReplySettings = async (formData) => {
    if (!selectedConversation?.id) {
      return;
    }

    try {
      setAutoReplySaving(true);
      const payload = {
        autoReplyEnabled: Boolean(formData.enabled),
        autoReplyMessage: formData.message?.trim() || "",
        autoReplyDelay: Number(formData.delay),
      };
      const response = await axiosInstance.patch(
        `/api/admin/messages/${selectedConversation.id}/auto-reply`,
        payload
      );

      if (response.data.success) {
        const updatedAutoReply = response.data.conversation?.autoReply || {
          enabled: payload.autoReplyEnabled,
          message: payload.autoReplyMessage,
          delay: payload.autoReplyDelay,
          lastSent: null,
        };

        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                autoReply: updatedAutoReply,
              }
            : prev
        );
        resetAutoReplyForm(getAutoReplyDefaults({ autoReply: updatedAutoReply }));
        await fetchConversations(mailbox);
        toast.success(response.data.message || "Auto-reply settings updated");
      }
    } catch (error) {
      console.error("Save auto-reply settings error:", error);
      toast.error(error.response?.data?.message || "Failed to save auto-reply settings");
    } finally {
      setAutoReplySaving(false);
    }
  };

  const processPendingAutoReplies = async () => {
    try {
      setProcessingAutoReplies(true);
      const response = await axiosInstance.post("/api/admin/messages/process-auto-replies");

      if (response.data.success) {
        await fetchConversations(mailbox);
        await fetchStats();
        if (selectedConversation?.id) {
          await fetchMessages(selectedConversation.id);
        }

        const processedCount = response.data.processedReplies?.length || 0;
        toast.success(
          processedCount > 0
            ? `Processed ${processedCount} auto-repl${processedCount === 1 ? "y" : "ies"}`
            : "No pending auto-replies were ready yet"
        );
      }
    } catch (error) {
      console.error("Process auto-replies error:", error);
      toast.error(error.response?.data?.message || "Failed to process auto-replies");
    } finally {
      setProcessingAutoReplies(false);
    }
  };

  useEffect(() => {
    fetchConversations(mailbox);
    fetchStats();
  }, [fetchConversations, fetchStats, mailbox]);

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
    fetchRecipients(recipientType);
  }, [recipientType]);

  useEffect(() => {
    resetAutoReplyForm(getAutoReplyDefaults(selectedConversation));
  }, [selectedConversation, resetAutoReplyForm]);

  useEffect(() => {
    const activeSocket = connectSocket();
    socket.current = activeSocket;

    if (!activeSocket) {
      return () => {};
    }

    const handleNewConversation = () => {
      fetchConversations(mailbox);
      fetchStats();
    };

    const handleUnreadUpdate = ({ conversationId: updatedConversationId, unreadCount }) => {
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === updatedConversationId
            ? { ...conversation, unreadCount }
            : conversation,
        ),
      );
      fetchConversations(mailbox);
      fetchStats();
    };

    activeSocket.on("new_conversation", handleNewConversation);
    activeSocket.on("unread_update", handleUnreadUpdate);

    return () => {
      activeSocket.off("new_conversation", handleNewConversation);
      activeSocket.off("unread_update", handleUnreadUpdate);
    };
  }, [fetchConversations, fetchStats, mailbox]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useConversationSocket(conversationId, {
    onNewMessage: useCallback(
      (message) => {
        setMessages((prev) => {
          if (prev.some((existingMessage) => existingMessage.id === message.id)) {
            return prev;
          }

          return [...prev, message];
        });
        setSelectedConversation((prev) =>
          prev
            ? {
                ...prev,
                lastMessage: message,
                lastMessageAt: message.createdAt,
              }
            : prev,
        );
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  lastMessage: message,
                  lastMessageAt: message.createdAt,
                }
              : conversation,
          ),
        );

        if (socket.current?.connected) {
          socket.current.emit("mark_read", { conversationId });
        }
      },
      [conversationId],
    ),
    onMessageUpdated: useCallback(
      (message) => {
        syncUpdatedMessage(message);
      },
      [syncUpdatedMessage],
    ),
  });

  const archiveConversation = async (id) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/messages/${id}/archive`);
      if (response.data.success) {
        if (mailbox === "inbox") {
          setConversations((prev) => prev.filter((conversation) => conversation.id !== id));
          navigate("/admin/messages");
          setSelectedConversation(null);
          setMessages([]);
        } else {
          await fetchConversations(mailbox);
        }
        toast.success("Conversation archived successfully");
      }
    } catch (error) {
      console.error("Archive admin conversation error:", error);
      toast.error("Failed to archive conversation");
    }
  };

  const unarchiveConversation = async (id) => {
    try {
      const response = await axiosInstance.patch(`/api/admin/messages/${id}/unarchive`);
      if (response.data.success) {
        if (mailbox === "archived") {
          setConversations((prev) => prev.filter((conversation) => conversation.id !== id));
          navigate("/admin/messages");
          setSelectedConversation(null);
          setMessages([]);
        } else {
          await fetchConversations(mailbox);
        }
        toast.success("Conversation unarchived successfully");
      }
    } catch (error) {
      console.error("Unarchive admin conversation error:", error);
      toast.error("Failed to unarchive conversation");
    }
  };

  const formatTime = (value) =>
    new Date(value).toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formatDateTime = (value) =>
    value
      ? new Date(value).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "Never";

  const filteredConversations = conversations.filter((conversation) => {
    const counterpart = getConversationCounterpart(conversation, "Admin");
    const normalizedSearch = searchTerm.toLowerCase();
    const subjectMatches =
      conversation.subject.toLowerCase().includes(normalizedSearch) ||
      counterpart.name.toLowerCase().includes(normalizedSearch) ||
      counterpart.role.toLowerCase().includes(normalizedSearch);
    const statusMatches = filterStatus === "all" || conversation.status === filterStatus;
    return subjectMatches && statusMatches;
  });

  const selectedRecipient = getConversationCounterpart(selectedConversation, "Admin");

  const getConversationPreview = (conversation) =>
    conversation?.lastMessage?.content?.trim() ||
    getMessagePreviewText(conversation?.lastMessage) ||
    conversation?.subject ||
    "No preview available yet.";

  const validateFiles = (files) => {
    if (files.length > MAX_ATTACHMENTS) {
      toast.error(`You can upload up to ${MAX_ATTACHMENTS} attachments`);
      return false;
    }

    const oversized = files.find((file) => file.size > MAX_ATTACHMENT_SIZE);
    if (oversized) {
      toast.error(`${oversized.name} is larger than 10 MB`);
      return false;
    }

    return true;
  };

  const handleAttachmentSelection = (setter) => (event) => {
    const files = Array.from(event.target.files || []).slice(0, MAX_ATTACHMENTS);
    if (!validateFiles(files)) {
      event.target.value = "";
      return;
    }
    setter(files);
  };

  const removeAttachment = (setter, inputRef, index) => {
    setter((prev) => {
      const next = prev.filter((_, currentIndex) => currentIndex !== index);
      if (next.length === 0 && inputRef.current) {
        inputRef.current.value = "";
      }
      return next;
    });
  };

  return (
    <div className="modern-shell">
      <div className="modern-container">
        <div className="modern-hero">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="modern-hero-title">Admin Messages</h1>
            <p className="modern-hero-copy">
              Coordinate support across users and owners with a single admin inbox.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="btn btn-outline gap-2"
              onClick={processPendingAutoReplies}
              disabled={processingAutoReplies}
            >
              {processingAutoReplies ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <RefreshCw size={18} />
              )}
              Run Auto-Replies
            </button>
            <button className="btn btn-primary gap-2" onClick={() => setShowNewConversation(true)}>
              <Plus size={18} />
              New Conversation
            </button>
          </div>
        </div>
        </div>

        {stats ? (
          <div className="modern-stat-grid">
            {[
              { label: "Total Conversations", value: stats.totalConversations },
              { label: "Active", value: stats.activeConversations },
              { label: "Resolved", value: stats.resolvedConversations },
              { label: "Unread", value: stats.unreadCount },
            ].map((item) => (
              <div key={item.label} className="modern-stat-card">
                <div className="modern-stat-label">{item.label}</div>
                <div className="modern-stat-value">{item.value}</div>
              </div>
            ))}
          </div>
        ) : null}

        {conversationId ? (
          <div className="grid gap-6 lg:min-h-[calc(100vh-11.5rem)] lg:grid-cols-[360px_minmax(0,1fr)]">
            <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
              <Link to="/admin/messages" className="btn btn-ghost gap-2 pl-0">
                <ChevronRight className="rotate-180" size={16} />
                Back to Conversations
              </Link>

              {selectedConversation ? (
                <div className="modern-panel space-y-4 lg:flex-1">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                        <Shield size={20} />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <h2 className="text-lg font-semibold">{selectedConversation.subject}</h2>
                        <div className="flex flex-wrap gap-2">
                          <span className={categories.find((item) => item.value === selectedConversation.category)?.color}>
                            {selectedConversation.category}
                          </span>
                          <span className={priorities.find((item) => item.value === selectedConversation.priority)?.color}>
                            {selectedConversation.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="label">
                        <span className="label-text font-medium">Status</span>
                      </label>
                      <select
                        className="modern-select w-full"
                        value={selectedConversation.status}
                        onChange={(event) => updateStatus(event.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    <div className="modern-subpanel">
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-secondary/10 p-3 text-secondary">
                          <Bot size={18} />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-base-content">Auto-reply</h3>
                          <p className="text-xs leading-5 text-base-content/65">
                            Send an automated admin follow-up after the recipient replies and
                            no manual response is sent during the delay window.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleAutoReplySubmit(saveAutoReplySettings)} className="mt-4 space-y-4">
                        <label className="flex items-center justify-between gap-4 rounded-2xl border border-base-300 bg-base-100 px-4 py-3">
                          <div>
                            <p className="font-medium text-base-content">Enable auto-reply</p>
                            <p className="text-xs text-base-content/60">
                              Active conversations only. Resolved or closed threads will not auto-reply.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            {...registerAutoReply("enabled")}
                          />
                        </label>

                        <div>
                          <label className="label">
                            <span className="label-text font-medium">Delay in minutes</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="1440"
                            className="modern-input w-full"
                            {...registerAutoReply("delay", { valueAsNumber: true })}
                          />
                          {autoReplyErrors.delay ? (
                            <p className="mt-2 text-sm text-error">{autoReplyErrors.delay.message}</p>
                          ) : (
                            <p className="mt-2 text-xs text-base-content/55">
                              Example: 5 means the auto-reply can send after 5 minutes of no admin response.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="label">
                            <span className="label-text font-medium">Auto-reply message</span>
                          </label>
                          <textarea
                            rows={5}
                            className="modern-textarea w-full"
                            placeholder="Thanks for reaching out. Our admin team has seen your message and will follow up soon."
                            {...registerAutoReply("message")}
                          />
                          {autoReplyErrors.message ? (
                            <p className="mt-2 text-sm text-error">{autoReplyErrors.message.message}</p>
                          ) : (
                            <p className="mt-2 text-xs text-base-content/55">
                              {autoReplyEnabled
                                ? "This saved message will be sent automatically when the delay expires."
                                : "You can save the draft message now and enable auto-reply whenever you are ready."}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 text-sm text-base-content/70">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`badge ${
                                selectedConversation?.autoReply?.enabled
                                  ? "badge-secondary badge-outline"
                                  : "badge-ghost"
                              }`}
                            >
                              {selectedConversation?.autoReply?.enabled ? "Auto-reply on" : "Auto-reply off"}
                            </span>
                            <span className="text-xs text-base-content/55">
                              Last auto-reply sent: {formatDateTime(selectedConversation?.autoReply?.lastSent)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <button type="submit" className="btn btn-primary gap-2" disabled={autoReplySaving}>
                            {autoReplySaving ? (
                              <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                              <Bot size={16} />
                            )}
                            Save Auto-Reply
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => resetAutoReplyForm(getAutoReplyDefaults(selectedConversation))}
                          >
                            Reset
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="grid gap-3 text-sm text-base-content/70">
                      <div className="modern-subpanel space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">
                          Recipient Role
                        </p>
                        <p className="mt-1 text-sm font-semibold text-base-content">{selectedRecipient.role}</p>
                        <p className="text-sm text-base-content/70">{selectedRecipient.name}</p>
                        {selectedRecipient.email ? (
                          <p className="text-xs text-base-content/55">{selectedRecipient.email}</p>
                        ) : null}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/50">
                            Created
                          </p>
                          <p className="mt-2 text-sm font-medium text-base-content">
                            {new Date(selectedConversation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/50">
                            Last activity
                          </p>
                          <p className="mt-2 text-sm font-medium text-base-content">
                            {formatDateTime(selectedConversation.lastMessageAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline mt-1 gap-2"
                        onClick={() =>
                          selectedConversation.isArchivedForCurrentUser
                            ? unarchiveConversation(selectedConversation.id)
                            : archiveConversation(selectedConversation.id)
                        }
                      >
                        <Shield size={16} />
                        {selectedConversation.isArchivedForCurrentUser ? "Unarchive Conversation" : "Archive Conversation"}
                      </button>
                    </div>
                </div>
              ) : null}
            </div>

            <div className="modern-panel flex min-h-[32rem] flex-col lg:h-full lg:min-h-0">
                <div className="mb-4 flex flex-col gap-3 border-b border-base-300/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedConversation?.subject || "Conversation"}</h2>
                    <p className="text-sm text-base-content/60">Messages are shown oldest to newest.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-base-content/55">
                    <span className="rounded-full border border-base-300 bg-base-200/70 px-3 py-1.5 font-medium">
                      {selectedRecipient.name}
                    </span>
                    <span className="rounded-full border border-base-300 bg-base-200/70 px-3 py-1.5 font-medium">
                      {selectedRecipient.role}
                    </span>
                  </div>
                </div>

                <div className="min-h-[24rem] flex-1 overflow-y-auto rounded-[24px] border border-base-300 bg-base-200/75 p-4 lg:min-h-0 lg:p-5">
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
                        const isAdmin = message.sender.userType === "Admin";
                        const senderMeta = getSenderMeta(message);
                        const replyMeta = message.replyTo
                          ? getSenderMeta(message.replyTo)
                          : null;
                        const reactionGroups = getReactionGroups(message.reactions);
                        return (
                          <div key={message.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[min(100%,48rem)] rounded-[24px] px-4 py-3 shadow-sm lg:max-w-[min(100%,56rem)] ${
                                isAdmin
                                  ? "border border-primary/15 bg-primary text-primary-content"
                                  : "border border-base-300 bg-base-100 text-base-content"
                              }`}
                            >
                              <div className="mb-2">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-70">
                                  {senderMeta.role}
                                </p>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xs opacity-85">{senderMeta.name}</p>
                                  {message.messageType === "system" ? (
                                    <span
                                      className={`badge badge-xs ${
                                        isAdmin
                                          ? "border-primary-content/30 bg-primary-content/15 text-primary-content"
                                          : "badge-outline"
                                      }`}
                                    >
                                      Auto reply
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[11px] opacity-70">{formatTime(message.createdAt)}</p>
                              </div>
                              {message.replyTo ? (
                                <div
                                  className={`mb-3 rounded-2xl border px-3 py-2 text-left ${
                                    isAdmin
                                      ? "border-primary-content/15 bg-primary-content/10 text-primary-content"
                                      : "border-base-300 bg-base-200/80 text-base-content"
                                  }`}
                                >
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
                                    Replying to {replyMeta?.name || "Message"}
                                  </p>
                                  <p className="mt-1 text-xs leading-5 opacity-80">
                                    {getMessagePreviewText(message.replyTo)}
                                  </p>
                                </div>
                              ) : null}
                              {shouldRenderMessageText(message) ? (
                                <p className="break-words whitespace-pre-wrap text-sm leading-7">
                                  {message.content}
                                </p>
                              ) : null}
                              <MessageAttachments
                                attachments={message.attachments}
                                ownMessage={isAdmin}
                              />
                              {reactionGroups.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {reactionGroups.map((reactionGroup) => (
                                    <button
                                      key={`${message.id}-${reactionGroup.emoji}`}
                                      type="button"
                                      onClick={() => toggleReaction(message.id, reactionGroup.emoji)}
                                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                                        isAdmin
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
                                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                                    isAdmin
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
                                      isAdmin
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
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form onSubmit={handleReplySubmit(sendReply)} className="mt-4 space-y-3 border-t border-base-300/70 pt-4">
                  {replyTarget ? (
                    <div className="rounded-[22px] border border-base-300 bg-base-200/80 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/55">
                            Replying to {getSenderMeta(replyTarget).name}
                          </p>
                          <p className="mt-1 break-words text-sm text-base-content/75">
                            {getMessagePreviewText(replyTarget, 160)}
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
                  {composerAttachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {composerAttachments.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-2 text-xs"
                        >
                          <span className="max-w-52 truncate">{file.name}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={() =>
                              removeAttachment(
                                setComposerAttachments,
                                composerFileInputRef,
                                index,
                              )
                            }
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <textarea
                      {...registerReply("content")}
                      placeholder={
                        replyTarget ? "Write your reply to this message..." : "Type your reply..."
                      }
                      rows={3}
                      className="modern-textarea w-full resize-none leading-6"
                    />
                    <div className="flex gap-2">
                      <input
                        ref={composerFileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleAttachmentSelection(setComposerAttachments)}
                      />
                      <button
                        type="button"
                        className="btn btn-outline gap-2"
                        onClick={() => composerFileInputRef.current?.click()}
                      >
                        <FileUp size={16} />
                        Attach
                      </button>
                      <button type="submit" className="btn btn-primary gap-2 sm:min-w-28">
                        <Send size={16} />
                        Send
                      </button>
                    </div>
                  </div>
                  {replyErrors.content ? <p className="text-sm text-error">{replyErrors.content.message}</p> : null}
                </form>
            </div>
          </div>
        ) : (
          <>
            <div className="modern-toolbar">
              <div className="grid gap-4 lg:grid-cols-[1fr_160px_180px]">
              <label className="modern-input flex items-center gap-3">
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
                className="modern-select w-full"
                value={mailbox}
                onChange={(event) => setMailbox(event.target.value)}
              >
                <option value="inbox">Inbox</option>
                <option value="archived">Archived</option>
              </select>
              <select
                className="modern-select w-full"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              </div>
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
                    <h2 className="mt-4 text-xl font-semibold">No conversations yet</h2>
                    <p className="max-w-md text-base-content/65">
                      Start a new admin conversation with a user or owner to begin support.
                    </p>
                  </div>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  (() => {
                    const counterpart = getConversationCounterpart(conversation, "Admin");
                    const previewText = getConversationPreview(conversation);
                    return (
                      <Link
                        key={conversation.id}
                        to={`/admin/messages/${conversation.id}`}
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
                                    <span className={categories.find((item) => item.value === conversation.category)?.color}>
                                      {conversation.category}
                                    </span>
                                    <span className={priorities.find((item) => item.value === conversation.priority)?.color}>
                                      {conversation.priority}
                                    </span>
                                    {conversation.autoReply?.enabled ? (
                                      <span className="badge badge-secondary badge-outline">Auto-reply on</span>
                                    ) : null}
                                    {conversation.unreadCount > 0 ? (
                                      <span className="badge badge-error">{conversation.unreadCount} new</span>
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
                  })()
                ))
              )}
            </div>
          </>
        )}

        {showNewConversation ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl border border-base-300 bg-base-100 shadow-2xl">
              <div className="flex items-center justify-between border-b border-base-300 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-semibold">Start an Admin Conversation</h2>
                  <p className="text-sm text-base-content/60">Choose the right recipient and open a clean support thread.</p>
                </div>
                <button className="btn btn-ghost btn-circle" onClick={() => setShowNewConversation(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleConversationSubmit(startConversation)} className="space-y-5 px-6 py-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Recipient Type</span>
                    </label>
                    <select {...registerConversation("recipientType")} className="modern-select w-full">
                      <option value="user">User</option>
                      <option value="owner">Owner</option>
                    </select>
                    {conversationErrors.recipientType ? (
                      <p className="mt-2 text-sm text-error">{conversationErrors.recipientType.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Recipient</span>
                    </label>
                    <select {...registerConversation("recipientEmail")} className="modern-select w-full">
                      <option value="">Select recipient</option>
                      {recipientOptions.map((recipient) => (
                        <option key={recipient.id} value={recipient.email}>
                          {recipient.name} - {formatRoleLabel(recipientType)} - {recipient.email}
                        </option>
                      ))}
                    </select>
                    {recipientLoading ? <p className="mt-2 text-sm text-base-content/60">Loading recipients...</p> : null}
                    {conversationErrors.recipientEmail ? (
                      <p className="mt-2 text-sm text-error">{conversationErrors.recipientEmail.message}</p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Subject</span>
                    </label>
                    <input {...registerConversation("subject")} className="modern-input w-full" />
                    {conversationErrors.subject ? (
                      <p className="mt-2 text-sm text-error">{conversationErrors.subject.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text font-medium">Category</span>
                    </label>
                    <select {...registerConversation("category")} className="modern-select w-full">
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {conversationErrors.category ? (
                      <p className="mt-2 text-sm text-error">{conversationErrors.category.message}</p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Priority</span>
                  </label>
                  <select {...registerConversation("priority")} className="modern-select w-full">
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                  {conversationErrors.priority ? (
                    <p className="mt-2 text-sm text-error">{conversationErrors.priority.message}</p>
                  ) : null}
                </div>

                <div>
                  <label className="label">
                    <span className="label-text font-medium">Message</span>
                  </label>
                  <textarea
                    {...registerConversation("message")}
                    rows={5}
                    className="modern-textarea w-full"
                    placeholder="Write the admin response or escalation context here..."
                  />
                  {conversationErrors.message ? (
                    <p className="mt-2 text-sm text-error">{conversationErrors.message.message}</p>
                  ) : null}
                  {newConversationAttachments.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {newConversationAttachments.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-200 px-3 py-2 text-xs"
                        >
                          <span className="max-w-52 truncate">{file.name}</span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={() =>
                              removeAttachment(
                                setNewConversationAttachments,
                                newConversationFileInputRef,
                                index,
                              )
                            }
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <input
                    ref={newConversationFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleAttachmentSelection(setNewConversationAttachments)}
                  />
                  <button
                    type="button"
                    className="btn btn-outline gap-2"
                    onClick={() => newConversationFileInputRef.current?.click()}
                  >
                    <FileUp size={16} />
                    Add Files
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowNewConversation(false)}>
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

export default AdminMessages;
