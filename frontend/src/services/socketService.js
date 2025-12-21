import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || "http://localhost:8000";

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Connected:", this.socket.id);
      this.connected = true;
      
      // Join chat with user ID
      if (userId) {
        this.socket.emit("chat:join", userId);
      }
    });

    this.socket.on("disconnect", () => {
      console.log("[Socket] Disconnected");
      this.connected = false;
    });

    this.socket.on("chat:connected", (data) => {
      console.log("[Socket] Chat connected:", data);
    });

    this.socket.on("chat:error", (error) => {
      console.error("[Socket] Chat error:", error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Join conversation room
  joinConversation(conversationId) {
    if (this.socket) {
      this.socket.emit("chat:joinConversation", conversationId);
    }
  }

  // Leave conversation room
  leaveConversation(conversationId) {
    if (this.socket) {
      this.socket.emit("chat:leaveConversation", conversationId);
    }
  }

  // Send message
  sendMessage(conversationId, content) {
    if (this.socket) {
      this.socket.emit("chat:sendMessage", { conversationId, content });
    }
  }

  // Mark messages as read
  markAsRead(conversationId) {
    if (this.socket) {
      this.socket.emit("chat:markAsRead", conversationId);
    }
  }

  // Typing indicator
  typing(conversationId) {
    if (this.socket) {
      this.socket.emit("chat:typing", conversationId);
    }
  }

  // Stop typing
  stopTyping(conversationId) {
    if (this.socket) {
      this.socket.emit("chat:stopTyping", conversationId);
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("chat:newMessage", callback);
    }
  }

  // Listen for messages read
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on("chat:messagesRead", callback);
    }
  }

  // Listen for typing
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("chat:userTyping", callback);
    }
  }

  // Listen for stop typing
  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on("chat:userStoppedTyping", callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
