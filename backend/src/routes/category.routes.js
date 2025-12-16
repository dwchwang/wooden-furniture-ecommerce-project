import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllCategories);
router.get("/tree", getCategoryTree);
router.get("/:id", getCategoryById);
router.get("/slug/:slug", getCategoryBySlug);

// Admin only routes
router.post("/", verifyJWT, verifyAdmin, createCategory);
router.patch("/:id", verifyJWT, verifyAdmin, updateCategory);
router.delete("/:id", verifyJWT, verifyAdmin, deleteCategory);

export default router;
