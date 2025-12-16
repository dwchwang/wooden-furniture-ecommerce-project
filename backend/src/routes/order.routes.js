import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getOrderStats,
} from "../controllers/order.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Authenticated user routes
router.post("/", verifyJWT, createOrder);
router.get("/my-orders", verifyJWT, getMyOrders);
router.get("/:id", verifyJWT, getOrderById);
router.patch("/:id/cancel", verifyJWT, cancelOrder);

// Admin only routes
router.get("/", verifyJWT, verifyAdmin, getAllOrders);
router.get("/stats/overview", verifyJWT, verifyAdmin, getOrderStats);
router.patch("/:id/status", verifyJWT, verifyAdmin, updateOrderStatus);

export default router;
