import express from "express";
import {
  sendMessage,
  getConversation,
  getAllConversations,
  markAsRead,
  getUnreadCount,
} from "../controllers/message.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.post("/", verifyJWT, sendMessage);
router.get("/conversations", verifyJWT, getAllConversations);
router.get("/conversation/:userId", verifyJWT, getConversation);
router.get("/unread-count", verifyJWT, getUnreadCount);
router.patch("/:id/read", verifyJWT, markAsRead);

export default router;
