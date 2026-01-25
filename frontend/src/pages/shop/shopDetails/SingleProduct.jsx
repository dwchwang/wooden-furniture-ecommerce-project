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
  const [thumbnailScrollPosition, setThumbnailScrollPosition] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchProductById(id));

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

  // Don't auto-select variant - let user choose
  // This ensures the general product image is shown first

  // Get all images to display (general product images + all variant images)
  const getAllImages = () => {
    if (!product) return [];

    const allImages = [];

    // Add general product images first
    if (product.images && product.images.length > 0) {
      allImages.push(...product.images);
    }

    // Add all variant images (avoiding duplicates)
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(variant => {
        if (variant.images && variant.images.length > 0) {
          variant.images.forEach(img => {
            if (!allImages.includes(img)) {
              allImages.push(img);
            }
          });
        }
      });
    }

    return allImages;
  };

  const allImages = getAllImages();

  // When variant changes, switch to the first image of that variant
  // Only if variant is explicitly selected (not null)
  useEffect(() => {
    if (selectedVariant?.images?.length > 0) {
      // Find the index of the first variant image in all images array
      const firstVariantImageIndex = allImages.findIndex(
        img => img === selectedVariant.images[0]
      );
      if (firstVariantImageIndex !== -1) {
        setSelectedImage(firstVariantImageIndex);
      }
    }
  }, [selectedVariant]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      _id: product._id,
      name: product.name,
      price: selectedVariant ? selectedVariant.price : product.basePrice,
      image: allImages[selectedImage] || allImages[0] || getImageUrl(product.images, 0),
      variant: selectedVariant ? {
        _id: selectedVariant._id,
        color: selectedVariant.color,
        size: selectedVariant.size,
        sku: selectedVariant.sku,
      } : null,
      quantity: 1,
    };

    dispatch(addToCart(cartItem));
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const displayImages = allImages;

  // Scroll thumbnail carousel
  const scrollThumbnails = (direction) => {
    const container = document.getElementById('thumbnail-container');
    if (container) {
      const scrollAmount = 100; // Scroll by 100px
      const newPosition = direction === 'left'
        ? Math.max(0, thumbnailScrollPosition - scrollAmount)
        : thumbnailScrollPosition + scrollAmount;

      container.scrollTo({ left: newPosition, behavior: 'smooth' });
      setThumbnailScrollPosition(newPosition);
    }
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
          <h2 className="text-2xl font-semibold mb-4">Không tìm thấy sản phẩm</h2>
          <Link to="/shop" className="text-[#a67c52] hover:underline">
            Quay lại cửa hàng
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
            <Link to="/">Trang chủ</Link>
          </span>
          <i className="ri-arrow-right-s-line"></i>
          <span>
            <Link to="/shop">Cửa hàng</Link>
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
              src={displayImages[selectedImage] || displayImages[0]}
              alt={product.name}
              className="rounded-md w-full h-[450px] object-cover mb-4"
            />

            {/* Image thumbnails with scroll buttons */}
            {displayImages && displayImages.length > 1 && (
              <div className="relative">
                {/* Left scroll button - only show when there are many images */}
                {displayImages.length > 5 && (
                  <button
                    onClick={() => scrollThumbnails('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-[#a67c52] hover:text-white rounded-full p-1.5 shadow-lg border border-gray-200 transition-all"
                  >
                    <i className="ri-arrow-left-s-line text-lg"></i>
                  </button>
                )}

                {/* Thumbnail container */}
                <div
                  id="thumbnail-container"
                  className={`flex gap-2 overflow-x-auto scrollbar-hide ${displayImages.length > 5 ? 'px-10' : ''}`}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {displayImages.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 flex-shrink-0 rounded cursor-pointer border-2 transition-all overflow-hidden ${selectedImage === index
                        ? 'border-[#a67c52] scale-110'
                        : 'border-gray-200 hover:border-[#a67c52]/50'
                        }`}
                      style={{ minWidth: '80px', minHeight: '80px', maxWidth: '80px', maxHeight: '80px' }}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Right scroll button - only show when there are many images */}
                {displayImages.length > 5 && (
                  <button
                    onClick={() => scrollThumbnails('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-[#a67c52] hover:text-white rounded-full p-1.5 shadow-lg border border-gray-200 transition-all"
                  >
                    <i className="ri-arrow-right-s-line text-lg"></i>
                  </button>
                )}
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
                <h4 className="font-semibold mb-2">Chọn phiên bản:</h4>
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
                  <>
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Kho:</strong> {selectedVariant.stock} sản phẩm có sẵn
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Đã bán:</strong> {product.soldCount || 0} sản phẩm
                    </p>
                  </>
                )}
              </div>
            )}

            {/* additional product info */}
            <div className="space-y-2 mb-6">
              {product.category && (
                <p>
                  <strong>Danh mục:</strong> {product.category.name}
                </p>
              )}
              {product.material && (
                <p>
                  <strong>Chất liệu:</strong> {product.material}
                </p>
              )}
              {selectedVariant?.dimensions?.length && (
                <p>
                  <strong>Kích thước:</strong>{' '}
                  {selectedVariant.dimensions.length} x{' '}
                  {selectedVariant.dimensions.width} x{' '}
                  {selectedVariant.dimensions.height} cm
                </p>
              )}
              {selectedVariant?.weight && (
                <p>
                  <strong>Trọng lượng:</strong> {selectedVariant.weight} kg
                </p>
              )}
              <div className="flex gap-2 items-center">
                <strong>Đánh giá:</strong>
                <RatingStars rating={product.averageRating || 0} />
                <span className="text-sm text-gray-600">
                  ({product.totalReviews || 0} đánh giá)
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={selectedVariant && selectedVariant.stock === 0}
              className="px-6 py-3 bg-[#a67c52] text-white rounded-md hover:bg-[#8b653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedVariant && selectedVariant.stock === 0
                ? 'Hết hàng'
                : 'Thêm vào giỏ hàng'}
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
