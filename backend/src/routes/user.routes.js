import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateUserProfile,
  changePassword,
  updateUserAvatar,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes (require authentication)
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/update-profile", verifyJWT, updateUserProfile);
router.patch("/change-password", verifyJWT, changePassword);
router.patch("/avatar", verifyJWT, uploadSingle("avatar"), updateUserAvatar);

// Admin routes
router.get("/admin/all", verifyJWT, verifyAdmin, getAllUsers);
router.get("/admin/:id", verifyJWT, verifyAdmin, getUserById);
router.put("/admin/:id", verifyJWT, verifyAdmin, updateUser);
router.delete("/admin/:id", verifyJWT, verifyAdmin, deleteUser);

export default router;
