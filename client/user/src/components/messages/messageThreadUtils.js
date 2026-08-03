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
