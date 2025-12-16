import mongoose from "mongoose";
import { generateUniqueSlug } from "../utils/slug.util.js";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
      index: true,
    },
    type: {
      type: String,
      trim: true,
      index: true,
      enum: [
        "Bàn",
        "Ghế", 
        "Giường",
        "Tủ",
        "Kệ",
        "Sofa",
        "Bàn Làm Việc",
        "Tủ Quần Áo",
        "Bàn Ăn",
        "Ghế Ăn",
        "Bàn Trà",
        "Kệ Sách",
        "Tủ Giày",
        "Khác"
      ],
    },
    material: {
      type: String,
      trim: true,
      maxlength: [100, "Material cannot exceed 100 characters"],
    },
    dimensions: {
      length: {
        type: Number,
        min: [0, "Length must be positive"],
      },
      width: {
        type: Number,
        min: [0, "Width must be positive"],
      },
      height: {
        type: Number,
        min: [0, "Height must be positive"],
      },
      unit: {
        type: String,
        default: "cm",
        enum: ["cm", "m", "inch"],
      },
    },
    weight: {
      type: Number,
      min: [0, "Weight must be positive"],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: "Cannot upload more than 10 images",
      },
    },
    basePrice: {
      type: Number,
      min: [0, "Base price must be positive"],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
productSchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    this.slug = await generateUniqueSlug(this.name, this.constructor);
  }
  next();
});

// Indexes for better query performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ type: 1, isActive: 1 });
productSchema.index({ category: 1, type: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ averageRating: -1 });

// Virtual for getting variants
productSchema.virtual("variants", {
  ref: "ProductVariant",
  localField: "_id",
  foreignField: "product",
});

// Ensure virtuals are included when converting to JSON
productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
