import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { reviewService } from '../../../services/reviewService';

// Async thunks
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, params }, { rejectWithValue }) => {
    try {
      const response = await reviewService.getProductReviews(productId, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

export const checkCanReview = createAsyncThunk(
  'reviews/checkCanReview',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await reviewService.checkCanReview(productId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check review eligibility');
    }
  }
);

export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewService.createReview(reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewService.updateReview(reviewId, reviewData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewService.deleteReview(reviewId);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete review');
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    ratingStats: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    canReview: false,
    availableOrders: [],
    canReviewReason: '',
    loading: false,
    error: null,
  },
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.ratingStats = [];
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        // API response structure: { data: { reviews, pagination, ratingStats } }
        const data = action.payload?.data || action.payload;
        state.reviews = data?.reviews || [];
        state.ratingStats = data?.ratingStats || [];
        state.pagination = data?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        };
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check can review
      .addCase(checkCanReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkCanReview.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        state.canReview = data?.canReview || false;
        state.availableOrders = data?.availableOrders || [];
        state.canReviewReason = data?.reason || '';
      })
      .addCase(checkCanReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.canReview = false;
      })
      
      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        const newReview = data?.review || data;
        if (newReview) {
          state.reviews = [newReview, ...state.reviews];
        }
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data || action.payload;
        const updatedReview = data?.review || data;
        if (updatedReview) {
          const index = state.reviews.findIndex(r => r._id === updatedReview._id);
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviews, clearError } = reviewsSlice.actions;
export default reviewsSlice.reducer;
