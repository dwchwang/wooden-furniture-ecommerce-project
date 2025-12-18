import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import User from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiError(403, "Your account has been deactivated");
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

// Middleware to check if user is admin
export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Access denied. Admin only.");
  }
  next();
});

// Optional JWT verification - attach user if token exists, but don't block if missing
export const optionalJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decodedToken._id).select(
        "-password -refreshToken"
      );

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently fail - user just won't be attached
  }
  next();
});

// Middleware to check if user is admin or staff
export const verifyAdminOrStaff = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "staff") {
    throw new ApiError(403, "Access denied. Admin or Staff only.");
  }
  next();
});
