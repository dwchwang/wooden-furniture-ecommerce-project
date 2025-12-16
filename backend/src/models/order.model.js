import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariant",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price must be positive"],
        },
      },
    ],
    shippingAddress: {
      fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone is required"],
        trim: true,
      },
      street: {
        type: String,
        required: [true, "Street is required"],
        trim: true,
      },
      ward: {
        type: String,
        required: [true, "Ward is required"],
        trim: true,
      },
      district: {
        type: String,
        required: [true, "District is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal must be positive"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount must be positive"],
    },
    voucher: {
      code: String,
      discountAmount: {
        type: Number,
        default: 0,
        min: [0, "Discount amount must be positive"],
      },
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: [0, "Shipping fee must be positive"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total must be positive"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["COD", "VNPay"],
        message: "Payment method must be either 'COD' or 'VNPay'",
      },
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed"],
        message: "Invalid payment status",
      },
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: {
        values: ["pending", "processing", "shipping", "delivered", "cancelled"],
        message: "Invalid order status",
      },
      default: "pending",
      index: true,
    },
    vnpayTransactionId: {
      type: String,
      sparse: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ orderStatus: 1, paymentStatus: 1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
