import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/features/products/productsSlice";
import { fetchCategories } from "../../redux/features/categories/categoriesSlice";
import ProductCards from "../shop/ProductCards";

const Search = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, pagination } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    sort: "-createdAt",
  });

  // Initialize search query and filters from URL params
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchQuery(q);

    setFilters({
      category: searchParams.get("category") || "",
      sort: searchParams.get("sort") || "-createdAt",
    });
  }, []); // Run only once on mount

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories(true));
  }, [dispatch]);

  // Fetch products when search params change
  useEffect(() => {
    const queryParams = {
      page: 1,
      limit: 12,
      isActive: true,
    };

    const q = searchParams.get("q");
    if (q) queryParams.search = q;

    const category = searchParams.get("category");
    if (category) queryParams.category = category;

    const sort = searchParams.get("sort");
    if (sort) queryParams.sort = sort;

    dispatch(fetchProducts(queryParams));
  }, [dispatch, searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("q", searchQuery.trim());
      setSearchParams(newParams);
    }
  };

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
      category: "",
      sort: "-createdAt",
    });
    setSearchQuery("");
    setSearchParams({});
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const currentQuery = searchParams.get("q");
  const hasFilters = currentQuery || filters.category;

  return (
    <>
      {/* Header Section */}
      <section className="section__container bg-primary-light">
        <h2 className="section__header capitalize">Tìm Kiếm Sản Phẩm</h2>
        <p className="section__subheader">
          {currentQuery
            ? `Kết quả tìm kiếm cho "${currentQuery}"`
            : "Tìm kiếm sản phẩm nội thất gỗ cao cấp"}
        </p>
      </section>

      <section className="section__container">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-4xl px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
          />
          <button
            type="submit"
            className="w-full md:w-auto bg-[#a67c52] text-white rounded-lg px-8 py-3 hover:bg-[#8b653d] transition-colors font-medium"
          >
            <i className="ri-search-line mr-2"></i>
            Tìm Kiếm
          </button>
        </form>

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

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Danh Mục</h4>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
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
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600">
                  {products.length > 0 ? (
                    <>
                      Tìm thấy <span className="font-semibold text-gray-900">{pagination?.total || products.length}</span> sản phẩm
                    </>
                  ) : (
                    "Không tìm thấy sản phẩm nào"
                  )}
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52] mb-4"></i>
                  <p className="text-gray-600">Đang tìm kiếm...</p>
                </div>
              </div>
            ) : products.length > 0 ? (
              <ProductCards products={products} />
            ) : (
              <div className="text-center py-20">
                <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy sản phẩm nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc
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

export default Search;