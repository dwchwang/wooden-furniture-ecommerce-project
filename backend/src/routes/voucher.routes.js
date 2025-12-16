import express from "express";
import {
  createVoucher,
  getAllVouchers,
  getActiveVouchers,
  validateVoucher,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
} from "../controllers/voucher.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/active", getActiveVouchers);
router.post("/validate", validateVoucher);

// Admin only routes
router.post("/", verifyJWT, verifyAdmin, createVoucher);
router.get("/", verifyJWT, verifyAdmin, getAllVouchers);
router.get("/:id", verifyJWT, verifyAdmin, getVoucherById);
router.patch("/:id", verifyJWT, verifyAdmin, updateVoucher);
router.delete("/:id", verifyJWT, verifyAdmin, deleteVoucher);

export default router;
