import api from './api';

export const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId, params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.rating) queryParams.append('rating', params.rating);
    
    const response = await api.get(`/reviews/product/${productId}?${queryParams.toString()}`);
    console.log('reviewService.getProductReviews response:', response);
    return response;
  },

  // Check if user can review a product
  checkCanReview: async (productId) => {
    return await api.get(`/reviews/can-review/${productId}`);
  },

  // Create a new review
  createReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  },

  // Update an existing review
  updateReview: async (reviewId, reviewData) => {
    return await api.patch(`/reviews/${reviewId}`, reviewData);
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    return await api.delete(`/reviews/${reviewId}`);
  },
};
