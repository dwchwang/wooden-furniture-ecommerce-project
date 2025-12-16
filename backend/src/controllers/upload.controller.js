import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { deleteImage } from "../utils/cloudinary.util.js";

// Upload single image
const uploadSingleImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  const imageData = {
    url: req.file.path,
    publicId: req.file.filename,
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

  const images = req.files.map((file) => ({
    url: file.path,
    publicId: file.filename,
  }));

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
