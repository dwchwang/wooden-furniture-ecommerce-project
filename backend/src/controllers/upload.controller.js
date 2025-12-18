import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { uploadOnCloudinary, deleteImage } from "../utils/cloudinary.util.js";

// Upload single image
const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  // Upload to Cloudinary
  const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
  
  if (!cloudinaryResponse) {
    throw new ApiError(500, "Failed to upload image to Cloudinary");
  }

  const imageData = {
    url: cloudinaryResponse.secure_url,
    publicId: cloudinaryResponse.public_id,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, { image: imageData }, "Image uploaded successfully"));
});

// Upload multiple images
const uploadMultipleImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }

  // Upload all files to Cloudinary
  const uploadPromises = req.files.map(file => uploadOnCloudinary(file.path));
  const cloudinaryResponses = await Promise.all(uploadPromises);
  
  const images = cloudinaryResponses
    .filter(response => response !== null)
    .map((response) => ({
      url: response.secure_url,
      publicId: response.public_id,
    }));

  if (images.length === 0) {
    throw new ApiError(500, "Failed to upload images to Cloudinary");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { images }, `${images.length} images uploaded successfully`)
    );
});

// Delete image
const deleteImageByPublicId = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    throw new ApiError(400, "Public ID is required");
  }

  await deleteImage(publicId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Image deleted successfully"));
});

export { uploadSingleImage, uploadMultipleImages, deleteImageByPublicId };
