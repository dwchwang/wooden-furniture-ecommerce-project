import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductReviews, deleteReview, checkCanReview } from '../redux/features/reviews/reviewsSlice';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getImageUrl } from '../utils/imageUtils';

const ProductReviews = ({ productId }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    reviews,
    ratingStats,
    pagination,
    loading,
    canReview,
    availableOrders,
    canReviewReason
  } = useSelector((state) => state.reviews);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filterRating, setFilterRating] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadReviews();
  }, [productId, filterRating, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(checkCanReview(productId));
    }
  }, [productId, isAuthenticated]);

  const loadReviews = () => {
    dispatch(fetchProductReviews({
      productId,
      params: {
        page: currentPage,
        limit: 10,
        ...(filterRating && { rating: filterRating }),
      },
    }));
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await dispatch(deleteReview(reviewId)).unwrap();
        toast.success('Đã xóa đánh giá thành công!');
        loadReviews();
      } catch (error) {
        toast.error(error || 'Không thể xóa đánh giá!');
      }
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    loadReviews();
    dispatch(checkCanReview(productId));
  };

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (ratingStats && Array.isArray(ratingStats)) {
      ratingStats.forEach(stat => {
        distribution[stat._id] = stat.count;
      });
    }
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
  const averageRating = totalReviews > 0
    ? Object.entries(ratingDistribution).reduce((sum, [rating, count]) => sum + (rating * count), 0) / totalReviews
    : 0;

  // Debug logging
  console.log('ProductReviews Debug:', {
    productId,
    reviews,
    ratingStats,
    pagination,
    totalReviews,
    averageRating,
    loading
  });

  // Check if current user has already reviewed this product
  const userHasReviewed = reviews && reviews.some(review => review.user?._id === user?._id);
  console.log('User has reviewed:', userHasReviewed, 'User ID:', user?._id);

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Đánh giá sản phẩm</h2>

      {/* Rating Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center border-r border-gray-200">
            <div className="text-6xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size="lg" />
            <p className="text-gray-600 mt-2">{totalReviews} đánh giá</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

              return (
                <button
                  key={star}
                  onClick={() => setFilterRating(filterRating === star ? null : star)}
                  className={`w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition-colors ${filterRating === star ? 'bg-gray-100' : ''
                    }`}
                >
                  <span className="text-sm font-medium text-gray-700 w-12">{star} sao</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter indicator */}
        {filterRating && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">Đang lọc:</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-2">
              {filterRating} sao
              <button
                onClick={() => setFilterRating(null)}
                className="hover:text-yellow-900"
              >
                <i className="ri-close-line"></i>
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Write Review Button */}
      {isAuthenticated && !userHasReviewed && (
        canReview ? (
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors flex items-center gap-2"
          >
            <i className="ri-edit-line"></i>
            {showReviewForm ? 'Đóng' : 'Viết đánh giá'}
          </button>
        ) : (
          <div className="text-sm text-gray-600 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
            <i className="ri-information-line mr-2"></i>
            {canReviewReason || 'Bạn cần mua sản phẩm này để có thể đánh giá'}
          </div>
        )
      )}
      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <i className="ri-information-line mr-2"></i>
            Vui lòng đăng nhập để viết đánh giá
          </p>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8">
          <ReviewForm
            productId={productId}
            availableOrders={availableOrders}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      {loading && (!reviews || reviews.length === 0) ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#a67c52]"></div>
          <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
        </div>
      ) : !reviews || reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <i className="ri-chat-3-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-600 text-lg">Chưa có đánh giá nào</p>
          <p className="text-gray-500 text-sm mt-2">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* User Avatar - ROUNDED */}
                <div className="flex-shrink-0">
                  {review.user?.avatar ? (
                    <img
                      src={getImageUrl(review.user.avatar)}
                      alt={review.user.fullName}
                      className="w-14 h-14 aspect-square rounded-full object-cover ring-2 ring-gray-100"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/user.png";
                      }}
                    />
                  ) : (
                    <div className="w-14 h-14 aspect-square rounded-full bg-gradient-to-br from-[#a67c52] to-[#8b653d] flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-100">
                      {review.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  {/* User Info & Rating */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg">{review.user?.fullName}</h4>
                        {review.isVerifiedPurchase && (
                          <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200 flex items-center gap-1">
                            <i className="ri-checkbox-circle-fill"></i>
                            Đã mua hàng
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    {user && review.user?._id === user._id && (
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Xóa đánh giá"
                      >
                        <i className="ri-delete-bin-line text-xl"></i>
                      </button>
                    )}
                  </div>

                  {/* Comment */}
                  <p className="text-gray-700 leading-relaxed mt-3 text-base">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>

          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 border rounded-lg transition-colors ${currentPage === index + 1
                ? 'bg-[#a67c52] text-white border-[#a67c52]'
                : 'border-gray-300 hover:bg-gray-50'
                }`}
            >
              {index + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
