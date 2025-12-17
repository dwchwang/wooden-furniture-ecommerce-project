import Product from "../models/product.model.js";
import ProductVariant from "../models/product-variant.model.js";
import Category from "../models/category.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { validateRequiredFields } from "../validations/common.validation.js";
import { generateUniqueSlug } from "../utils/slug.util.js";

// Create new product (with optional variants)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    type,
    material,
    dimensions,
    weight,
    images,
    basePrice,
    isFeatured,
    variants,
  } = req.body;

  // Validate required fields
  validateRequiredFields(["name", "category"], req.body);

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, "Category not found");
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(name, Product);

  // Create product
  const product = await Product.create({
    name,
    slug,
    description,
    category,
    type,
    material,
    dimensions,
    weight,
    images: images || [],
    basePrice,
    isFeatured: isFeatured || false,
  });

  // Create variants if provided
  let createdVariants = [];
  if (variants && Array.isArray(variants) && variants.length > 0) {
    const variantsToCreate = variants.map((v) => ({
      ...v,
      product: product._id,
    }));
    createdVariants = await ProductVariant.insertMany(variantsToCreate);
  }

  // Populate product with category and variants
  const populatedProduct = await Product.findById(product._id)
    .populate("category", "name slug")
    .populate("variants");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { product: populatedProduct },
        "Product created successfully"
      )
    );
});

// Get all products with filters, search, and pagination
const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    type,
    material,
    minPrice,
    maxPrice,
    search,
    isFeatured,
    isActive = true,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build filter
  const filter = {};
  
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }
  
  if (category) {
    filter.category = category;
  }
  
  if (type) {
    // Use regex to match type starting with the filter value
    // E.g., "Bàn" matches "Bàn", "Bàn Làm Việc", "Bàn Ăn", "Bàn Trà"
    filter.type = new RegExp(`^${type}`, "i");
  }
  
  if (material) {
    filter.material = new RegExp(material, "i");
  }
  
  if (isFeatured !== undefined) {
    filter.isFeatured = isFeatured === "true";
  }

  // Price filter (based on variants)
  let variantFilter = {};
  if (minPrice || maxPrice) {
    variantFilter.price = {};
    if (minPrice) variantFilter.price.$gte = Number(minPrice);
    if (maxPrice) variantFilter.price.$lte = Number(maxPrice);
  }

  // Search by name or description using regex (case-insensitive)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Get product IDs that match variant filters
  let productIds = null;
  if (Object.keys(variantFilter).length > 0) {
    const matchingVariants = await ProductVariant.find(variantFilter).distinct(
      "product"
    );
    productIds = matchingVariants;
    filter._id = { $in: productIds };
  }

  // Pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  // Execute query
  const products = await Product.find(filter)
    .populate("category", "name slug")
    .populate("variants")
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  // Get total count
  const total = await Product.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Products fetched successfully"
    )
  );
});

// Get featured products
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const products = await Product.find({ isFeatured: true, isActive: true })
    .populate("category", "name slug")
    .populate("variants")
    .sort({ averageRating: -1, createdAt: -1 })
    .limit(Number(limit));

  return res
    .status(200)
    .json(
      new ApiResponse(200, { products }, "Featured products fetched successfully")
    );
});

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id)
    .populate("category", "name slug")
    .populate("variants");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product fetched successfully"));
});

// Get product by slug
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug })
    .populate("category", "name slug")
    .populate("variants");

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product fetched successfully"));
});

// Update product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category,
    type,
    material,
    dimensions,
    weight,
    images,
    basePrice,
    isFeatured,
    isActive,
  } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check if category exists (if provided)
  if (category && category !== product.category.toString()) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new ApiError(404, "Category not found");
    }
    product.category = category;
  }

  // Update slug if name changed
  if (name && name !== product.name) {
    product.slug = await generateUniqueSlug(name, Product, id);
    product.name = name;
  }

  if (description !== undefined) product.description = description;
  if (type !== undefined) product.type = type;
  if (material !== undefined) product.material = material;
  if (dimensions !== undefined) product.dimensions = dimensions;
  if (weight !== undefined) product.weight = weight;
  if (images !== undefined) product.images = images;
  if (basePrice !== undefined) product.basePrice = basePrice;
  if (isFeatured !== undefined) product.isFeatured = isFeatured;
  if (isActive !== undefined) product.isActive = isActive;

  await product.save();

  const updatedProduct = await Product.findById(id)
    .populate("category", "name slug")
    .populate("variants");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { product: updatedProduct }, "Product updated successfully")
    );
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Delete all variants
  await ProductVariant.deleteMany({ product: id });

  // Delete product
  await product.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Product deleted successfully"));
});

// Search products
const searchProducts = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q || q.trim() === "") {
    throw new ApiError(400, "Search query is required");
  }

  const products = await Product.find({
    $text: { $search: q },
    isActive: true,
  })
    .populate("category", "name slug")
    .populate("variants")
    .limit(Number(limit))
    .select("name slug images basePrice averageRating");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { products }, "Search results fetched successfully")
    );
});

export {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  searchProducts,
};
