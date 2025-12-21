import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.models.js";

// Store online users and their socket IDs
const onlineUsers = new Map();

export const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`[Chat] User connected: ${socket.id}`);

    // User joins chat
    socket.on("chat:join", async (userId) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          socket.emit("chat:error", { message: "User not found" });
          return;
        }

        // Store user socket
        onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        socket.userRole = user.role;

        // Join user's personal room
        socket.join(`user:${userId}`);

        // If staff/admin, join staff room
        if (user.role === "admin" || user.role === "staff") {
          socket.join("staff");
        }

        socket.emit("chat:connected", {
          userId,
          role: user.role,
        });

        console.log(`[Chat] User ${userId} (${user.role}) joined`);
      } catch (error) {
        console.error("[Chat] Join error:", error);
        socket.emit("chat:error", { message: "Failed to join chat" });
      }
    });

    // Join conversation room
    socket.on("chat:joinConversation", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`[Chat] Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on("chat:leaveConversation", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`[Chat] Socket ${socket.id} left conversation ${conversationId}`);
    });

    // Send message
    socket.on("chat:sendMessage", async (data) => {
      try {
        const { conversationId, content } = data;
        const senderId = socket.userId;

        if (!senderId) {
          socket.emit("chat:error", { message: "Not authenticated" });
          return;
        }

        if (!content || !content.trim()) {
          socket.emit("chat:error", { message: "Message content is required" });
          return;
        }

        // Get conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit("chat:error", { message: "Conversation not found" });
          return;
        }

        // Check permission
        const isCustomer = senderId === conversation.customer.toString();
        const isAdmin = socket.userRole === "admin";
        const isStaff = socket.userRole === "staff";

        if (!isCustomer && !isAdmin && !isStaff) {
          socket.emit("chat:error", { message: "Access denied" });
          return;
        }

        // If staff (not admin), check if conversation is assigned
        if (isStaff && !isAdmin) {
          if (conversation.assignedTo && conversation.assignedTo.toString() !== senderId) {
            socket.emit("chat:error", { message: "This conversation is assigned to another staff member" });
            return;
          }

          // Auto-assign if not assigned yet
          if (!conversation.assignedTo) {
            conversation.assignedTo = senderId;
            conversation.status = "assigned";
            
            // Populate assignedTo
            await conversation.populate("assignedTo", "fullName email avatar");

            // Notify staff room about assignment
            io.to("staff").emit("chat:conversationAssigned", {
              conversationId,
              staffId: senderId,
              conversation,
            });
          }
        }

        // Create message
        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          content: content.trim(),
          type: "text",
        });

        // Update conversation
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();

        // Update unread count
        if (isCustomer) {
          conversation.unreadCount.staff += 1;
        } else {
          conversation.unreadCount.customer += 1;
        }

        await conversation.save();

        // Populate message
        await message.populate("sender", "fullName avatar role");

        // Emit to conversation room
        io.to(`conversation:${conversationId}`).emit("chat:newMessage", {
          conversationId,
          message,
        });

        // Notify staff room if customer sent message
        if (isCustomer) {
          io.to("staff").emit("chat:newCustomerMessage", {
            conversationId,
            message,
          });
        }

        console.log(`[Chat] Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error("[Chat] Send message error:", error);
        socket.emit("chat:error", { message: "Failed to send message" });
      }
    });

    // Mark messages as read
    socket.on("chat:markAsRead", async (conversationId) => {
      try {
        const userId = socket.userId;
        if (!userId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Mark messages as read
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: userId },
            isRead: false,
          },
          { isRead: true }
        );

        // Update unread count
        const isCustomer = userId === conversation.customer.toString();
        if (isCustomer) {
          conversation.unreadCount.customer = 0;
        } else {
          conversation.unreadCount.staff = 0;
        }

        await conversation.save();

        // Notify conversation room
        io.to(`conversation:${conversationId}`).emit("chat:messagesRead", {
          conversationId,
          readBy: userId,
        });

        console.log(`[Chat] Messages marked as read in conversation ${conversationId}`);
      } catch (error) {
        console.error("[Chat] Mark as read error:", error);
      }
    });

    // Typing indicator
    socket.on("chat:typing", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("chat:userTyping", {
        conversationId,
        userId: socket.userId,
      });
    });

    // Stop typing
    socket.on("chat:stopTyping", (conversationId) => {
      socket.to(`conversation:${conversationId}`).emit("chat:userStoppedTyping", {
        conversationId,
        userId: socket.userId,
      });
    });

    // Conversation assigned
    socket.on("chat:assignConversation", async (data) => {
      try {
        const { conversationId, staffId } = data;

        // Notify customer
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          io.to(`user:${conversation.customer}`).emit("chat:conversationAssigned", {
            conversationId,
            staffId,
          });
        }

        // Notify staff room
        io.to("staff").emit("chat:conversationAssigned", {
          conversationId,
          staffId,
        });

        console.log(`[Chat] Conversation ${conversationId} assigned to ${staffId}`);
      } catch (error) {
        console.error("[Chat] Assign conversation error:", error);
      }
    });

    // Disconnect
    socket.on("disconnect", () => {
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(userId);
        console.log(`[Chat] User ${userId} disconnected`);
      }
      console.log(`[Chat] Socket disconnected: ${socket.id}`);
    });
  });
};

// Helper to emit to conversation
export const emitToConversation = (io, conversationId, event, data) => {
  io.to(`conversation:${conversationId}`).emit(event, data);
};

// Helper to emit to staff
export const emitToStaff = (io, event, data) => {
  io.to("staff").emit(event, data);
};
