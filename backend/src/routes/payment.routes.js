import express from "express";
import {
  createVNPayPayment,
  vnpayReturn,
  vnpayIPN,
  checkPaymentStatus,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create payment URL (authenticated)
router.post("/vnpay/create", verifyJWT, createVNPayPayment);

// VNPay return URL (public - VNPay redirects here)
router.get("/vnpay/return", vnpayReturn);

// VNPay IPN (public - VNPay calls this)
router.get("/vnpay/ipn", vnpayIPN);

// Check payment status (authenticated)
router.get("/status/:orderId", verifyJWT, checkPaymentStatus);

export default router;
