import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, clearCurrentProduct } from "../../../redux/features/products/productsSlice";
import { addToCart } from "../../../redux/features/cart/cartSlice";
import RatingStars from "../../../components/RatingStars";
import ProductReviews from "../../../components/ProductReviews";
import { formatPrice, getImageUrl } from "../../../utils/helpers";
import { toast } from "react-toastify";

const SingleProduct = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProduct: product, loading } = useSelector((state) => state.products);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchProductById(id));

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.basePrice,
      image: getImageUrl(product.images, selectedImage),
      variant: selectedVariant ? {
        _id: selectedVariant._id,
        color: selectedVariant.color,
        size: selectedVariant.size,
        sku: selectedVariant.sku,
      } : null,
      quantity: 1,
    };

    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#a67c52]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
          <Link to="/shop" className="text-[#a67c52] hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="section__container bg-primary-light">
        <h2 className="section__header capitalize">{product.name}</h2>
        <div className="section__subheader space-x-2 ">
          <span>
            <Link to="/">Home</Link>
          </span>
          <i className="ri-arrow-right-s-line"></i>
          <span>
            <Link to="/shop">Shop</Link>
          </span>
          <i className="ri-arrow-right-s-line"></i>
          <span className="hover:text-primary cursor-pointer">
            {product.name}
          </span>
        </div>
      </section>

      <section className="section__container mt-8">
        <div className="flex flex-col items-center md:flex-row gap-8">
          {/* product images */}
          <div className="md:w-1/2 w-full">
            <img
              src={getImageUrl(product.images, selectedImage)}
              alt={product.name}
              className="rounded-md w-full h-[450px] object-cover mb-4"
            />

            {/* Image thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${selectedImage === index ? 'border-[#a67c52]' : 'border-gray-200'
                      }`}
                    onClick={() => setSelectedImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* product info */}
          <div className="md:w-1/2 w-full">
            <h3 className="text-2xl font-semibold mb-4">{product.name}</h3>

            <p className="text-2xl text-[#a67c52] font-bold mb-4">
              {formatPrice(selectedVariant ? selectedVariant.price : product.basePrice)}
            </p>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Select Variant:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant._id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-2 border rounded ${selectedVariant?._id === variant._id
                        ? 'border-[#a67c52] bg-[#a67c52] text-white'
                        : 'border-gray-300 hover:border-[#a67c52]'
                        }`}
                    >
                      {variant.color} - {variant.size}
                      <br />
                      <span className="text-xs">
                        {formatPrice(variant.price)}
                      </span>
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="text-sm text-gray-600 mt-2">
                    Stock: {selectedVariant.stock} available
                  </p>
                )}
              </div>
            )}

            {/* additional product info */}
            <div className="space-y-2 mb-6">
              {product.category && (
                <p>
                  <strong>Category:</strong> {product.category.name}
                </p>
              )}
              {product.material && (
                <p>
                  <strong>Material:</strong> {product.material}
                </p>
              )}
              {product.dimensions && (
                <p>
                  <strong>Dimensions:</strong> {product.dimensions.length} x{' '}
                  {product.dimensions.width} x {product.dimensions.height} cm
                </p>
              )}
              {product.weight && (
                <p>
                  <strong>Weight:</strong> {product.weight} kg
                </p>
              )}
              <div className="flex gap-2 items-center">
                <strong>Rating:</strong>
                <RatingStars rating={product.averageRating || 0} />
                <span className="text-sm text-gray-600">
                  ({product.totalReviews || 0} reviews)
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={selectedVariant && selectedVariant.stock === 0}
              className="px-6 py-3 bg-[#a67c52] text-white rounded-md hover:bg-[#8b653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedVariant && selectedVariant.stock === 0
                ? 'Out of Stock'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </section>

      {/* Product Reviews */}
      <section className="section__container mt-8">
        <ProductReviews productId={product._id} />
      </section>
    </>
  );
};

export default SingleProduct;
