import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/features/products/productsSlice";
import { fetchCategoryBySlug } from "../../redux/features/categories/categoriesSlice";
import ProductCards from "../shop/ProductCards";

const CategoryPage = () => {
  const { categoryName } = useParams(); // slug from URL
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const { products, loading } = useSelector((state) => state.products);
  const { currentCategory, loading: categoryLoading } = useSelector((state) => state.categories);

  const [filters, setFilters] = useState({
    sort: searchParams.get("sort") || "-createdAt",
  });

  // Fetch category details by slug
  useEffect(() => {
    if (categoryName) {
      dispatch(fetchCategoryBySlug(categoryName));
    }
  }, [dispatch, categoryName]);

  // Fetch products when category or filters change
  useEffect(() => {
    if (currentCategory) {
      const queryParams = {
        page: 1,
        limit: 12,
        isActive: true,
        category: currentCategory._id,
      };

      const sort = searchParams.get("sort");
      if (sort) queryParams.sort = sort;

      dispatch(fetchProducts(queryParams));
    }
  }, [dispatch, currentCategory, searchParams]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setFilters({
      sort: "-createdAt",
    });
    setSearchParams({});
  };

  const hasFilters = filters.sort !== "-createdAt";

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52] mb-4"></i>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Không tìm thấy danh mục
          </h2>
          <p className="text-gray-600">Danh mục bạn tìm kiếm không tồn tại</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Category Header */}
      <section className="section__container bg-primary-light">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="section__header capitalize">{currentCategory.name}</h2>
          {currentCategory.description && (
            <p className="section__subheader">{currentCategory.description}</p>
          )}
        </div>
      </section>

      <section className="section__container">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-[#a67c52] transition-colors">
                Trang chủ
              </a>
            </li>
            <li>
              <i className="ri-arrow-right-s-line"></i>
            </li>
            <li>
              <a href="/shop" className="hover:text-[#a67c52] transition-colors">
                Cửa hàng
              </a>
            </li>
            <li>
              <i className="ri-arrow-right-s-line"></i>
            </li>
            <li className="text-gray-900 font-medium">{currentCategory.name}</li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Bộ Lọc</h3>
                {hasFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-[#a67c52] hover:text-[#8b653d] font-medium"
                  >
                    Xóa Tất Cả
                  </button>
                )}
              </div>

              {/* Sort Filter */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Sắp Xếp</h4>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                >
                  <option value="-createdAt">Mới Nhất</option>
                  <option value="basePrice">Giá: Thấp đến Cao</option>
                  <option value="-basePrice">Giá: Cao đến Thấp</option>
                  <option value="name">Tên: A-Z</option>
                  <option value="-name">Tên: Z-A</option>
                  <option value="-averageRating">Đánh Giá Cao Nhất</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            {!loading && (
              <div className="mb-6">
                <p className="text-gray-600">
                  {products.length > 0 ? (
                    <>
                      Tìm thấy <span className="font-semibold text-gray-900">{products.length}</span> sản phẩm
                    </>
                  ) : (
                    "Không có sản phẩm nào"
                  )}
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52] mb-4"></i>
                  <p className="text-gray-600">Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : products.length > 0 ? (
              <ProductCards products={products} />
            ) : (
              <div className="text-center py-20">
                <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không có sản phẩm nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Danh mục này hiện chưa có sản phẩm nào
                </p>
                {hasFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors"
                  >
                    Xóa Bộ Lọc
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default CategoryPage;
