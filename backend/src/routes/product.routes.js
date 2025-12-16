import express from "express";
import {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/product.controller.js";
import {
  createVariant,
  getVariantsByProduct,
  getVariantById,
  updateVariant,
  deleteVariant,
  checkStock,
  updateStock,
} from "../controllers/product-variant.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes - Products
router.get("/", getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.get("/slug/:slug", getProductBySlug);

// Public routes - Variants
router.get("/:productId/variants", getVariantsByProduct);
router.get("/variants/:variantId", getVariantById);
router.get("/variants/:variantId/check-stock", checkStock);

// Admin only routes - Products
router.post("/", verifyJWT, verifyAdmin, createProduct);
router.patch("/:id", verifyJWT, verifyAdmin, updateProduct);
router.delete("/:id", verifyJWT, verifyAdmin, deleteProduct);

// Admin only routes - Variants
router.post("/:productId/variants", verifyJWT, verifyAdmin, createVariant);
router.patch("/variants/:variantId", verifyJWT, verifyAdmin, updateVariant);
router.delete("/variants/:variantId", verifyJWT, verifyAdmin, deleteVariant);
router.patch("/variants/:variantId/stock", verifyJWT, verifyAdmin, updateStock);

export default router;
