import { ApiError } from "../utils/api-error.js";

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }
  return true;
};

// Validate password strength
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }
  return true;
};

// Validate phone number
export const validatePhone = (phone) => {
  if (!phone) return true; // Phone is optional
  
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!phoneRegex.test(phone)) {
    throw new ApiError(400, "Phone number must be 10-11 digits");
  }
  return true;
};

// Validate required fields
export const validateRequiredFields = (fields, data) => {
  const missingFields = [];
  
  fields.forEach((field) => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length > 0) {
    throw new ApiError(
      400,
      `Missing required fields: ${missingFields.join(', ')}`
    );
  }
  
  return true;
};

// Validate MongoDB ObjectId
export const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(id)) {
    throw new ApiError(400, "Invalid ID format");
  }
  return true;
};
