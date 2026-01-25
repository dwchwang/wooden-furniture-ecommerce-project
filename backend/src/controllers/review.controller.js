import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { validateRequiredFields } from "../validations/common.validation.js";

// Create review
const createReview = asyncHandler(async (req, res) => {
  const { product, order, rating, comment, images } = req.body;

  // Validate required fields
  validateRequiredFields(["product", "order", "rating"], req.body);

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    throw new ApiError(404, "Product not found");
  }

  // Check if order exists and belongs to user
  const orderExists = await Order.findOne({
    _id: order,
    user: req.user._id,
  }).populate("items.product");

  if (!orderExists) {
    throw new ApiError(404, "Order not found or does not belong to you");
  }

  // Check if order is delivered
  if (orderExists.orderStatus !== "delivered") {
    throw new ApiError(400, "Can only review products from delivered orders");
  }

  // Check if product is in the order
  const productInOrder = orderExists.items.some(
    (item) => item.product._id.toString() === product
  );

  if (!productInOrder) {
    throw new ApiError(400, "Product not found in this order");
  }

  // Check if user already reviewed this product for this order
  const existingReview = await Review.findOne({
    user: req.user._id,
    product,
    order,
  });

  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this product for this order");
  }

  // Create review
  const review = await Review.create({
    user: req.user._id,
    product,
    order,
    rating,
    comment,
    images: images || [],
  });

  const populatedReview = await Review.findById(review._id)
    .populate("user", "fullName avatar")
    .populate("product", "name slug");

  return res
    .status(201)
    .json(
      new ApiResponse(201, { review: populatedReview }, "Review created successfully")
    );
});

// Get product reviews
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating } = req.query;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const filter = { product: productId };
  if (rating) {
    filter.rating = Number(rating);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const reviews = await Review.find(filter)
    .populate("user", "fullName avatar")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Review.countDocuments(filter);

  // Get rating distribution
  const ratingStats = await Review.aggregate([
    { $match: { product: product._id } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
        ratingStats,
      },
      "Reviews fetched successfully"
    )
  );
});

// Check if user can review product
const checkCanReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Find delivered orders containing this product
  const orders = await Order.find({
    user: req.user._id,
    orderStatus: "delivered",
    "items.product": productId,
  });

  if (orders.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          canReview: false,
          reason: "Bạn phải mua và nhận sản phẩm này để đánh giá",
        },
        "Cannot review"
      )
    );
  }

  // Check if user has already reviewed for all orders
  const reviewedOrders = await Review.find({
    user: req.user._id,
    product: productId,
  }).distinct("order");

  const unreviewedOrders = orders.filter(
    (order) => !reviewedOrders.includes(order._id.toString())
  );

  if (unreviewedOrders.length === 0) {
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          canReview: false,
          reason: "Bạn đã đánh giá sản phẩm này cho tất cả đơn hàng của bạn",
        },
        "Cannot review"
      )
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        canReview: true,
        availableOrders: unreviewedOrders.map((o) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
        })),
      },
      "Can review"
    )
  );
});

// Update review
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment, images } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if review belongs to user
  if (review.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to update this review");
  }

  if (rating !== undefined) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  if (images !== undefined) review.images = images;

  await review.save();

  const updatedReview = await Review.findById(id)
    .populate("user", "fullName avatar")
    .populate("product", "name slug");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { review: updatedReview }, "Review updated successfully")
    );
});

// Delete review
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  // Check if review belongs to user or user is admin
  if (
    review.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Not authorized to delete this review");
  }

  await review.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Review deleted successfully"));
});

export {
  createReview,
  getProductReviews,
  checkCanReview,
  updateReview,
  deleteReview,
};
