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
import { verifyJWT, verifyAdmin, verifyAdminOrStaff } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Admin/Staff routes (must be before /:id to avoid route conflict)
router.get("/stats/overview", verifyJWT, verifyAdminOrStaff, getOrderStats);
router.get("/", verifyJWT, verifyAdminOrStaff, getAllOrders);
router.patch("/:id/status", verifyJWT, verifyAdminOrStaff, updateOrderStatus);

// Authenticated user routes
router.post("/", verifyJWT, createOrder);
router.get("/my-orders", verifyJWT, getMyOrders);
router.get("/:id", verifyJWT, getOrderById);
router.patch("/:id/cancel", verifyJWT, cancelOrder);

export default router;
