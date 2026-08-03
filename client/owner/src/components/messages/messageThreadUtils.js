export const MESSAGE_REACTION_OPTIONS = ["👍", "❤️", "😊", "😂", "😮", "😢", "😡"];

export const truncateMessagePreview = (value, maxLength = 120) => {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return "Original message unavailable";
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
};

export const getReactionGroups = (reactions = []) =>
  MESSAGE_REACTION_OPTIONS.map((emoji) => ({
    emoji,
    count: reactions.filter((entry) => entry?.reaction === emoji).length,
  })).filter((entry) => entry.count > 0);

export const getMessagePreviewText = (message, maxLength = 120) => {
  const normalizedContent = String(message?.content || "").trim();
  if (normalizedContent) {
    return truncateMessagePreview(normalizedContent, maxLength);
  }

  const attachments = Array.isArray(message?.attachments)
    ? message.attachments
    : [];

  if (!attachments.length) {
    return "Original message unavailable";
  }

  if (attachments.length === 1) {
    return attachments[0]?.originalName || "1 attachment";
  }

  return `${attachments.length} attachments`;
};

const buildAttachmentOnlySummary = (attachments = []) => {
  if (!attachments.length) {
    return "";
  }

  const imageCount = attachments.filter(isImageAttachment).length;

  if (attachments.length === 1) {
    return imageCount === 1
      ? `Shared image: ${attachments[0]?.originalName || "attachment"}`
      : `Shared file: ${attachments[0]?.originalName || "attachment"}`;
  }

  return imageCount === attachments.length
    ? `Shared ${attachments.length} images`
    : `Shared ${attachments.length} attachments`;
};

export const shouldRenderMessageText = (message) => {
  const normalizedContent = String(message?.content || "").trim();
  const attachments = Array.isArray(message?.attachments)
    ? message.attachments
    : [];

  if (!normalizedContent) {
    return false;
  }

  if (!attachments.length) {
    return true;
  }

  return normalizedContent !== buildAttachmentOnlySummary(attachments);
};

export const formatAttachmentSize = (value) => {
  const size = Number(value || 0);
  if (!size) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(size) / Math.log(1024)),
    units.length - 1,
  );
  const normalized = size / 1024 ** exponent;

  return `${normalized >= 10 || exponent === 0 ? normalized.toFixed(0) : normalized.toFixed(1)} ${units[exponent]}`;
};

export const isImageAttachment = (attachment) =>
  String(attachment?.mimeType || "").startsWith("image/");
