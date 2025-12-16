import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../../../services/categoryService';

// Async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchAll',
  async (isActive, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories(isActive);
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

export const fetchCategoryTree = createAsyncThunk(
  'categories/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryTree();
      return response.data.categories;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch category tree');
    }
  }
);

export const fetchCategoryBySlug = createAsyncThunk(
  'categories/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategoryBySlug(slug);
      return response.data.category;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch category');
    }
  }
);

const initialState = {
  categories: [],
  categoryTree: [],
  currentCategory: null,
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch category tree
      .addCase(fetchCategoryTree.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.loading = false;
        state.categoryTree = action.payload;
      })
      .addCase(fetchCategoryTree.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch category by slug
      .addCase(fetchCategoryBySlug.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoryBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
