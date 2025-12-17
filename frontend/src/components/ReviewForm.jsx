import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitReview } from '../redux/features/reviews/reviewsSlice';
import StarRating from './StarRating';
import { toast } from 'react-toastify';

const ReviewForm = ({ productId, availableOrders, onSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.reviews);

  const [formData, setFormData] = useState({
    order: availableOrders[0]?._id || '',
    rating: 0,
    comment: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.order) {
      newErrors.order = 'Vui lòng chọn đơn hàng';
    }

    if (formData.rating === 0) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Vui lòng nhập nội dung đánh giá';
    } else if (formData.comment.length < 10) {
      newErrors.comment = 'Nội dung đánh giá phải có ít nhất 10 ký tự';
    } else if (formData.comment.length > 1000) {
      newErrors.comment = 'Nội dung đánh giá không được quá 1000 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await dispatch(submitReview({
        product: productId,
        order: formData.order,
        rating: formData.rating,
        comment: formData.comment,
      })).unwrap();

      toast.success('Đánh giá của bạn đã được gửi thành công!');
      onSuccess && onSuccess();
    } catch (error) {
      toast.error(error || 'Không thể gửi đánh giá. Vui lòng thử lại!');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Viết đánh giá</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order Selection */}
        {availableOrders.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn đơn hàng <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
            >
              {availableOrders.map((order) => (
                <option key={order._id} value={order._id}>
                  Đơn hàng #{order.orderNumber}
                </option>
              ))}
            </select>
            {errors.order && <p className="mt-1 text-sm text-red-500">{errors.order}</p>}
          </div>
        )}

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-4">
            <StarRating
              rating={formData.rating}
              size="xl"
              interactive={true}
              onRatingChange={(rating) => setFormData({ ...formData, rating })}
            />
            <span className="text-lg font-semibold text-gray-700">
              {formData.rating > 0 ? `${formData.rating}/5` : 'Chọn số sao'}
            </span>
          </div>
          {errors.rating && <p className="mt-1 text-sm text-red-500">{errors.rating}</p>}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-transparent resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.comment ? (
              <p className="text-sm text-red-500">{errors.comment}</p>
            ) : (
              <p className="text-sm text-gray-500">Tối thiểu 10 ký tự</p>
            )}
            <p className="text-sm text-gray-500">{formData.comment.length}/1000</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
