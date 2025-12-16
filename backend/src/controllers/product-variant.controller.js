import ProductVariant from "../models/product-variant.model.js";
import Product from "../models/product.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { validateRequiredFields } from "../validations/common.validation.js";

// Create new variant for a product
const createVariant = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { sku, color, size, price, stock, images } = req.body;

  // Validate required fields
  validateRequiredFields(["price"], req.body);

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if SKU already exists (if provided)
  if (sku) {
    const existingVariant = await ProductVariant.findOne({ sku });
    if (existingVariant) {
      throw new ApiError(409, "SKU already exists");
    }
  }

  // Create variant
  const variant = await ProductVariant.create({
    product: productId,
    sku,
    color,
    size,
    price,
    stock: stock || 0,
    images: images || [],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { variant }, "Variant created successfully"));
});

// Get all variants for a product
const getVariantsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { isActive } = req.query;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const filter = { product: productId };
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  const variants = await ProductVariant.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { variants }, "Variants fetched successfully")
    );
});

// Get variant by ID
const getVariantById = asyncHandler(async (req, res) => {
  const { variantId } = req.params;

  const variant = await ProductVariant.findById(variantId).populate(
    "product",
    "name slug"
  );

  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { variant }, "Variant fetched successfully"));
});

// Update variant
const updateVariant = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { sku, color, size, price, stock, images, isActive } = req.body;

  const variant = await ProductVariant.findById(variantId);
  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  // Check if SKU already exists (if changed)
  if (sku && sku !== variant.sku) {
    const existingVariant = await ProductVariant.findOne({ sku });
    if (existingVariant) {
      throw new ApiError(409, "SKU already exists");
    }
    variant.sku = sku;
  }

  if (color !== undefined) variant.color = color;
  if (size !== undefined) variant.size = size;
  if (price !== undefined) variant.price = price;
  if (stock !== undefined) variant.stock = stock;
  if (images !== undefined) variant.images = images;
  if (isActive !== undefined) variant.isActive = isActive;

  await variant.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { variant }, "Variant updated successfully"));
});

// Delete variant
const deleteVariant = asyncHandler(async (req, res) => {
  const { variantId } = req.params;

  const variant = await ProductVariant.findById(variantId);
  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  await variant.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Variant deleted successfully"));
});

// Check stock availability
const checkStock = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { quantity = 1 } = req.query;

  const variant = await ProductVariant.findById(variantId);
  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  if (!variant.isActive) {
    throw new ApiError(400, "Variant is not active");
  }

  const available = variant.stock >= Number(quantity);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        available,
        stock: variant.stock,
        requested: Number(quantity),
      },
      available ? "Stock available" : "Insufficient stock"
    )
  );
});

// Update stock (for order processing)
const updateStock = asyncHandler(async (req, res) => {
  const { variantId } = req.params;
  const { quantity, operation = "decrease" } = req.body;

  validateRequiredFields(["quantity"], req.body);

  const variant = await ProductVariant.findById(variantId);
  if (!variant) {
    throw new ApiError(404, "Variant not found");
  }

  if (operation === "decrease") {
    if (variant.stock < quantity) {
      throw new ApiError(400, "Insufficient stock");
    }
    variant.stock -= quantity;
  } else if (operation === "increase") {
    variant.stock += quantity;
  } else {
    throw new ApiError(400, "Invalid operation. Use 'increase' or 'decrease'");
  }

  await variant.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { variant }, "Stock updated successfully"));
});

export {
  createVariant,
  getVariantsByProduct,
  getVariantById,
  updateVariant,
  deleteVariant,
  checkStock,
  updateStock,
};
