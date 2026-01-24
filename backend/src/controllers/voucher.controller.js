import Voucher from "../models/voucher.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { validateRequiredFields } from "../validations/common.validation.js";

// Create new voucher
const createVoucher = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    usageLimit,
    startDate,
    endDate,
  } = req.body;

  // Validate required fields
  validateRequiredFields(
    ["code", "discountType", "discountValue", "startDate", "endDate"],
    req.body
  );

  // Check if code already exists
  const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
  if (existingVoucher) {
    throw new ApiError(409, "Voucher code already exists");
  }

  // Create voucher
  const voucher = await Voucher.create({
    code: code.toUpperCase(),
    description,
    discountType,
    discountValue,
    minOrderValue: minOrderValue || 0,
    maxDiscountAmount,
    usageLimit,
    startDate,
    endDate,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { voucher }, "Voucher created successfully"));
});

// Get all vouchers (Admin)
const getAllVouchers = asyncHandler(async (req, res) => {
  const { isActive, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === "true";
  }

  // Add search functionality
  if (search) {
    filter.$or = [
      { code: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const vouchers = await Voucher.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Voucher.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        vouchers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      "Vouchers fetched successfully"
    )
  );
});

// Get active vouchers (Public)
const getActiveVouchers = asyncHandler(async (req, res) => {
  const now = new Date();

  const vouchers = await Voucher.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { usageLimit: { $exists: false } },
      { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    ],
  }).sort({ discountValue: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { vouchers }, "Active vouchers fetched successfully")
    );
});

// Validate voucher
const validateVoucher = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;

  validateRequiredFields(["code", "orderValue"], req.body);

  const voucher = await Voucher.findOne({ code: code.toUpperCase() });

  if (!voucher) {
    throw new ApiError(404, "Không tìm thấy mã giảm giá");
  }

  // Check if voucher is active
  if (!voucher.isActive) {
    throw new ApiError(400, "Mã giảm giá không còn hiệu lực");
  }

  // Check date validity
  const now = new Date();
  if (now < voucher.startDate) {
    throw new ApiError(400, "Mã giảm giá chưa có hiệu lực");
  }
  if (now > voucher.endDate) {
    throw new ApiError(400, "Mã giảm giá đã hết hạn");
  }

  // Check usage limit
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    throw new ApiError(400, "Mã giảm giá đã hết lượt sử dụng");
  }

  // Check minimum order value
  if (orderValue < voucher.minOrderValue) {
    throw new ApiError(
      400,
      `Minimum order value is ${voucher.minOrderValue}`
    );
  }

  // Calculate discount
  let discountAmount = 0;
  if (voucher.discountType === "percentage") {
    discountAmount = (orderValue * voucher.discountValue) / 100;
    if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
      discountAmount = voucher.maxDiscountAmount;
    }
  } else {
    discountAmount = voucher.discountValue;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        valid: true,
        voucher: {
          code: voucher.code,
          discountType: voucher.discountType,
          discountValue: voucher.discountValue,
          discountAmount,
        },
      },
      "Voucher is valid"
    )
  );
});

// Get voucher by ID
const getVoucherById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const voucher = await Voucher.findById(id);

  if (!voucher) {
    throw new ApiError(404, "Voucher not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { voucher }, "Voucher fetched successfully"));
});

// Update voucher
const updateVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderValue,
    maxDiscountAmount,
    usageLimit,
    startDate,
    endDate,
    isActive,
  } = req.body;

  const voucher = await Voucher.findById(id);
  if (!voucher) {
    throw new ApiError(404, "Voucher not found");
  }

  // Check if code already exists (if changed)
  if (code && code.toUpperCase() !== voucher.code) {
    const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (existingVoucher) {
      throw new ApiError(409, "Voucher code already exists");
    }
    voucher.code = code.toUpperCase();
  }

  if (description !== undefined) voucher.description = description;
  if (discountType !== undefined) voucher.discountType = discountType;
  if (discountValue !== undefined) voucher.discountValue = discountValue;
  if (minOrderValue !== undefined) voucher.minOrderValue = minOrderValue;
  if (maxDiscountAmount !== undefined)
    voucher.maxDiscountAmount = maxDiscountAmount;
  if (usageLimit !== undefined) voucher.usageLimit = usageLimit;
  if (startDate !== undefined) voucher.startDate = startDate;
  if (endDate !== undefined) voucher.endDate = endDate;
  if (isActive !== undefined) voucher.isActive = isActive;

  await voucher.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { voucher }, "Voucher updated successfully"));
});

// Delete voucher
const deleteVoucher = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const voucher = await Voucher.findById(id);
  if (!voucher) {
    throw new ApiError(404, "Voucher not found");
  }

  await voucher.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Voucher deleted successfully"));
});

export {
  createVoucher,
  getAllVouchers,
  getActiveVouchers,
  validateVoucher,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
};
