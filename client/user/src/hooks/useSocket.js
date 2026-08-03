import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let globalSocket = null;

function getToken() {
  try {
    const persisted = localStorage.getItem("persist:user");
    if (!persisted) return null;
    const parsed = JSON.parse(persisted);
    if (!parsed.auth) return null;
    const auth = JSON.parse(parsed.auth);
    return auth.token || null;
  } catch {
    return null;
  }
}

export function getSocket() {
  return globalSocket;
}

export function connectSocket() {
  const token = getToken();
  if (!token) return null;

  if (globalSocket?.connected) return globalSocket;

  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }

  globalSocket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  return globalSocket;
}

export function disconnectSocket() {
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }
}

/**
 * useSocket — connects on mount, disconnects on unmount.
 * Returns the socket instance.
 */
export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;
    globalSocket = socket;

    return () => {
      // Don't disconnect globally on unmount — keep it alive
      // Individual components just stop listening
    };
  }, []);

  return socketRef.current || globalSocket;
}

/**
 * useConversationSocket — joins a room and registers listeners.
 * @param {string|null} conversationId
 * @param {{ onNewMessage, onTypingStart, onTypingStop, onMessagesRead }} handlers
 */
export function useConversationSocket(conversationId, handlers = {}) {
  const {
    onNewMessage,
    onMessageUpdated,
    onTypingStart,
    onTypingStop,
    onMessagesRead,
  } = handlers;
  const prevConvRef = useRef(null);

  useEffect(() => {
    const socket = globalSocket;
    if (!socket || !conversationId) return;

    // Leave previous room
    if (prevConvRef.current && prevConvRef.current !== conversationId) {
      socket.emit("leave_conversation", prevConvRef.current);
    }

    // Join new room
    socket.emit("join_conversation", conversationId);
    prevConvRef.current = conversationId;

    const handleNewMessage = (data) => {
      if (data.conversationId === conversationId && onNewMessage) {
        onNewMessage(data.message);
      }
    };
    const handleTypingStart = (data) => {
      if (data.conversationId === conversationId && onTypingStart) {
        onTypingStart(data);
      }
    };
    const handleMessageUpdated = (data) => {
      if (data.conversationId === conversationId && onMessageUpdated) {
        onMessageUpdated(data.message);
      }
    };
    const handleTypingStop = (data) => {
      if (data.conversationId === conversationId && onTypingStop) {
        onTypingStop(data);
      }
    };
    const handleMessagesRead = (data) => {
      if (data.conversationId === conversationId && onMessagesRead) {
        onMessagesRead(data);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_updated", handleMessageUpdated);
    socket.on("typing_start", handleTypingStart);
    socket.on("typing_stop", handleTypingStop);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_updated", handleMessageUpdated);
      socket.off("typing_start", handleTypingStart);
      socket.off("typing_stop", handleTypingStop);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [
    conversationId,
    onNewMessage,
    onMessageUpdated,
    onTypingStart,
    onTypingStop,
    onMessagesRead,
  ]);
}
