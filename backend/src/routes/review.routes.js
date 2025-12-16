import express from "express";
import {
  createReview,
  getProductReviews,
  checkCanReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Authenticated user routes
router.post("/", verifyJWT, createReview);
router.get("/can-review/:productId", verifyJWT, checkCanReview);
router.patch("/:id", verifyJWT, updateReview);
router.delete("/:id", verifyJWT, deleteReview);

export default router;
