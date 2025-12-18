import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    color: {
      type: String,
      trim: true,
      maxlength: [50, "Color cannot exceed 50 characters"],
    },
    size: {
      type: String,
      trim: true,
      maxlength: [50, "Size cannot exceed 50 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be positive"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "Cannot upload more than 5 images per variant",
      },
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

// Compound index for efficient queries
productVariantSchema.index({ product: 1, isActive: 1 });
productVariantSchema.index({ product: 1, color: 1, size: 1 });

// Pre-save hook to generate SKU if not provided
productVariantSchema.pre("save", async function (next) {
  if (!this.sku) {
    // Generate SKU: PROD-{productId}-{color}-{size}
    const productId = this.product.toString().slice(-6).toUpperCase();
    const color = (this.color || "DEFAULT").replace(/\s+/g, "").toUpperCase().slice(0, 3);
    const size = (this.size || "STD").replace(/\s+/g, "").toUpperCase().slice(0, 3);
    const timestamp = Date.now().toString().slice(-4);
    
    this.sku = `PROD-${productId}-${color}-${size}-${timestamp}`;
  }
  next();
});

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);

export default ProductVariant;
