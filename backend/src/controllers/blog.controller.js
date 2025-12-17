import Blog from '../models/blog.model.js';
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";

// @desc    Get all blogs (public - only published)
// @route   GET /api/blogs
// @access  Public
export const getBlogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    tag,
    search,
    sort = '-publishedAt'
  } = req.query;

  const query = { isPublished: true };

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by tag
  if (tag) {
    query.tags = tag;
  }

  // Search in title and excerpt
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .populate('author', 'fullName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Blog.countDocuments(query)
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        limit: parseInt(limit)
      }
    }, 'Blogs fetched successfully')
  );
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug, isPublished: true })
    .populate('author', 'fullName avatar');

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  // Increment views
  blog.views += 1;
  await blog.save();

  res.status(200).json(
    new ApiResponse(200, blog, 'Blog fetched successfully')
  );
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin/Staff)
export const createBlog = asyncHandler(async (req, res) => {
  const {
    title,
    excerpt,
    content,
    coverImage,
    category,
    tags,
    isPublished
  } = req.body;

  const blog = await Blog.create({
    title,
    excerpt,
    content,
    coverImage,
    category,
    tags,
    isPublished,
    author: req.user._id
  });

  res.status(201).json(
    new ApiResponse(201, blog, 'Blog created successfully')
  );
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin/Staff)
export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  // Check if user is author or admin
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update this blog');
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  ).populate('author', 'fullName avatar');

  res.status(200).json(
    new ApiResponse(200, updatedBlog, 'Blog updated successfully')
  );
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin/Staff)
export const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  // Check if user is author or admin
  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to delete this blog');
  }

  await blog.deleteOne();

  res.status(200).json(
    new ApiResponse(200, null, 'Blog deleted successfully')
  );
});

// @desc    Toggle like on blog
// @route   POST /api/blogs/:id/like
// @access  Private
export const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  const userIndex = blog.likes.indexOf(req.user._id);

  if (userIndex > -1) {
    // Unlike
    blog.likes.splice(userIndex, 1);
  } else {
    // Like
    blog.likes.push(req.user._id);
  }

  await blog.save();

  res.status(200).json(
    new ApiResponse(200, { likes: blog.likes.length }, 'Like toggled successfully')
  );
});
