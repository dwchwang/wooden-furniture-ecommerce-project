import express from "express";
import {
  getOrCreateConversation,
  getAllConversations,
  getConversationById,
  getMessages,
  sendMessage,
  markAsRead,
  assignConversation,
  updateStatus,
} from "../controllers/chat.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Customer routes
router.get("/conversation", verifyJWT, getOrCreateConversation);
router.get("/conversations/:id", verifyJWT, getConversationById);
router.get("/conversations/:id/messages", verifyJWT, getMessages);
router.post("/conversations/:id/messages", verifyJWT, sendMessage);
router.patch("/conversations/:id/read", verifyJWT, markAsRead);

// Admin/Staff routes
router.get("/conversations", verifyJWT, getAllConversations);
router.patch("/conversations/:id/assign", verifyJWT, assignConversation);
router.patch("/conversations/:id/status", verifyJWT, updateStatus);

export default router;
