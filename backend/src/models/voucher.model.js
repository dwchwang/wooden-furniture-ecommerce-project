import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Voucher code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Code must be at least 3 characters"],
      maxlength: [20, "Code cannot exceed 20 characters"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    discountType: {
      type: String,
      required: [true, "Discount type is required"],
      enum: {
        values: ["percentage", "fixed"],
        message: "Discount type must be either 'percentage' or 'fixed'",
      },
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value must be positive"],
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: [0, "Minimum order value must be positive"],
    },
    maxDiscountAmount: {
      type: Number,
      min: [0, "Maximum discount amount must be positive"],
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate that endDate is after startDate
voucherSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("End date must be after start date"));
  }
  
  // For percentage discount, ensure value is between 0-100
  if (this.discountType === "percentage" && this.discountValue > 100) {
    next(new Error("Percentage discount cannot exceed 100%"));
  }
  
  next();
});

// Index for efficient queries
voucherSchema.index({ code: 1, isActive: 1 });
voucherSchema.index({ startDate: 1, endDate: 1 });

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;
