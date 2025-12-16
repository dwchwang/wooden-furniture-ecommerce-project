import express from "express";
import {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImageByPublicId,
} from "../controllers/upload.controller.js";
import { uploadSingle, uploadMultiple } from "../middlewares/upload.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All upload routes require authentication
router.post("/image", verifyJWT, uploadSingle("image"), uploadSingleImage);
router.post("/images", verifyJWT, uploadMultiple("images", 10), uploadMultipleImages);
router.delete("/image/:publicId", verifyJWT, deleteImageByPublicId);

export default router;
