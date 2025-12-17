import React from "react";
import { Link } from "react-router-dom";
import RatingStars from "../../components/RatingStars";
import { useDispatch } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";

const ProductCards = ({ products }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (product) => {
    // Select first variant if available, otherwise use product base price
    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: firstVariant ? firstVariant.price : product.basePrice,
      image: product.images && product.images.length > 0 ? product.images[0] : "/placeholder.jpg",
      quantity: 1,
      variant: firstVariant ? {
        _id: firstVariant._id,
        color: firstVariant.color,
        size: firstVariant.size,
        sku: firstVariant.sku,
      } : null,
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <div key={product._id} className="product__card">
          <div className="relative">
            <Link to={`/shop/${product._id}`}>
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.jpg"}
                alt={product.name}
                className="max-h-96 md:h-64 w-full object-cover hover:scale-105 transition-all duration-300 rounded-t-lg"
              />
            </Link>

            {/* View detail button - top right */}
            <div className="absolute top-3 right-3">
              <Link
                to={`/shop/${product._id}`}
                className="w-10 h-10 flex items-center justify-center bg-[#a67c52] text-white rounded-full hover:bg-[#8b653d] transition-colors shadow-lg"
              >
                <i className="ri-shopping-cart-line text-lg"></i>
              </Link>
            </div>
          </div>

          {/* Product description */}
          <div className="product__card__content">
            <h4 className="font-semibold text-base mb-2">{product.name}</h4>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.description}
            </p>
            <p className="text-lg font-bold text-[#a67c52] mb-2">
              {formatPrice(product.basePrice)}
            </p>

            <div className="flex items-center justify-between">
              <RatingStars rating={product.averageRating || 0} />
              <span className="text-xs text-gray-500">
                ({product.totalReviews || 0} reviews)
              </span>
            </div>

            {product.material && (
              <p className="text-xs text-gray-500 mt-2">
                Material: {product.material}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCards;
