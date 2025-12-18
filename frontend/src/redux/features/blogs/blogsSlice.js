import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import blogService from '../../../services/blogService';

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await blogService.getBlogs(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blogs');
    }
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  'blogs/fetchBlogBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await blogService.getBlogBySlug(slug);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch blog');
    }
  }
);

export const toggleBlogLike = createAsyncThunk(
  'blogs/toggleLike',
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await blogService.toggleLike(blogId);
      return { blogId, ...response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  }
);

const blogsSlice = createSlice({
  name: 'blogs',
  initialState: {
    blogs: [],
    currentBlog: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalBlogs: 0,
      limit: 10
    },
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = action.payload?.blogs || [];
        state.pagination = action.payload?.pagination || state.pagination;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch single blog
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBlog = action.payload || null;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle like
      .addCase(toggleBlogLike.fulfilled, (state, action) => {
        if (state.currentBlog && state.currentBlog._id === action.payload.blogId) {
          state.currentBlog.likes = action.payload.likes || 0;
        }
      });
  }
});

export const { clearCurrentBlog, clearError } = blogsSlice.actions;
export default blogsSlice.reducer;
