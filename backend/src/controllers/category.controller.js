import Category from "../models/category.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { validateRequiredFields } from "../validations/common.validation.js";
import { generateUniqueSlug } from "../utils/slug.util.js";

// Create new category
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent, image } = req.body;

  // Validate required fields
  validateRequiredFields(["name"], req.body);

  // Check if parent exists (if provided)
  if (parent) {
    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      throw new ApiError(404, "Parent category not found");
    }
  }

  // Generate unique slug
  const slug = await generateUniqueSlug(name, Category);

  // Create category
  const category = await Category.create({
    name,
    slug,
    description,
    parent: parent || null,
    image,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { category }, "Category created successfully"));
});

// Get all categories (flat list)
const getAllCategories = asyncHandler(async (req, res) => {
  const { isActive, parent } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }
  if (parent !== undefined) {
    filter.parent = parent === "null" ? null : parent;
  }

  const categories = await Category.find(filter)
    .populate("parent", "name slug")
    .sort({ name: 1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { categories }, "Categories fetched successfully")
    );
});

// Get category tree (hierarchical structure)
const getCategoryTree = asyncHandler(async (req, res) => {
  // Get all active categories
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  // Build tree structure
  const buildTree = (parentId = null) => {
    return categories
      .filter((cat) => {
        if (parentId === null) {
          return cat.parent === null || cat.parent === undefined;
        }
        return cat.parent && cat.parent.toString() === parentId.toString();
      })
      .map((cat) => ({
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        children: buildTree(cat._id),
      }));
  };

  const tree = buildTree();

  return res
    .status(200)
    .json(new ApiResponse(200, { tree }, "Category tree fetched successfully"));
});

// Get category by ID
const getCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id).populate("parent", "name slug");

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Get children
  const children = await Category.find({ parent: id }).select("name slug");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        category: {
          ...category.toObject(),
          children,
        },
      },
      "Category fetched successfully"
    )
  );
});

// Get category by slug
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug }).populate(
    "parent",
    "name slug"
  );

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Get children
  const children = await Category.find({ parent: category._id }).select(
    "name slug"
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        category: {
          ...category.toObject(),
          children,
        },
      },
      "Category fetched successfully"
    )
  );
});

// Update category
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, parent, image, isActive } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if parent exists (if provided and changed)
  if (parent && parent !== category.parent?.toString()) {
    // Prevent circular reference
    if (parent === id) {
      throw new ApiError(400, "Category cannot be its own parent");
    }

    const parentCategory = await Category.findById(parent);
    if (!parentCategory) {
      throw new ApiError(404, "Parent category not found");
    }

    // Check if new parent is a descendant of current category
    const isDescendant = async (categoryId, potentialDescendantId) => {
      const descendants = await Category.find({ parent: categoryId });
      for (const desc of descendants) {
        if (desc._id.toString() === potentialDescendantId) {
          return true;
        }
        if (await isDescendant(desc._id, potentialDescendantId)) {
          return true;
        }
      }
      return false;
    };

    if (await isDescendant(id, parent)) {
      throw new ApiError(
        400,
        "Cannot set a descendant category as parent (circular reference)"
      );
    }
  }

  // Update slug if name changed
  if (name && name !== category.name) {
    category.slug = await generateUniqueSlug(name, Category, id);
    category.name = name;
  }

  if (description !== undefined) category.description = description;
  if (parent !== undefined) category.parent = parent || null;
  if (image !== undefined) category.image = image;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { category }, "Category updated successfully"));
});

// Delete category
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if category has children
  const childrenCount = await Category.countDocuments({ parent: id });
  if (childrenCount > 0) {
    throw new ApiError(
      400,
      "Cannot delete category with subcategories. Delete subcategories first."
    );
  }

  // TODO: Check if category has products
  // const productsCount = await Product.countDocuments({ category: id });
  // if (productsCount > 0) {
  //   throw new ApiError(400, "Cannot delete category with products");
  // }

  await category.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Category deleted successfully"));
});

export {
  createCategory,
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
};
