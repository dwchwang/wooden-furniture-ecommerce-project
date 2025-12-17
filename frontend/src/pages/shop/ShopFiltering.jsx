import React from "react";

const ShopFiltering = ({
  filters,
  filtersState,
  setFiltersState,
  clearFilter,
}) => {
  const handleCategoryChange = (categoryId) => {
    setFiltersState({ ...filtersState, category: categoryId });
  };

  const handleTypeChange = (type) => {
    setFiltersState({ ...filtersState, type });
  };

  const handleMaterialChange = (material) => {
    setFiltersState({ ...filtersState, material });
  };

  const handlePriceChange = (range) => {
    if (range.label === "Tất cả giá") {
      setFiltersState({ ...filtersState, minPrice: "", maxPrice: "" });
    } else {
      setFiltersState({
        ...filtersState,
        minPrice: range.min,
        maxPrice: range.max,
      });
    }
  };

  const handleSortChange = (sortValue) => {
    setFiltersState({ ...filtersState, sort: sortValue });
  };

  const hasActiveFilters =
    filtersState.category ||
    filtersState.type ||
    filtersState.material ||
    filtersState.minPrice ||
    filtersState.maxPrice ||
    filtersState.sort !== "-createdAt";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Bộ Lọc</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilter}
            className="text-sm text-[#a67c52] hover:text-[#8b653d] font-medium transition-colors"
          >
            Xóa Tất Cả
          </button>
        )}
      </div>

      {/* Categories */}
      {filters.categories && filters.categories.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Danh Mục</h4>
          <hr className="mb-3 border-gray-200" />
          <div className="space-y-2">
            {filters.categories.map((cat) => (
              <label key={cat._id} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  checked={filtersState.category === cat._id}
                  onChange={() => handleCategoryChange(cat._id)}
                  className="w-4 h-4 text-[#a67c52] focus:ring-[#a67c52] focus:ring-2"
                />
                <span className="ml-3 text-gray-700 group-hover:text-[#a67c52] transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Product Types */}
      {filters.types && filters.types.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Loại Sản Phẩm</h4>
          <hr className="mb-3 border-gray-200" />
          <div className="space-y-2">
            {filters.types.map((type) => (
              <label key={type} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="type"
                  checked={type === "All" ? !filtersState.type : filtersState.type === type}
                  onChange={() => handleTypeChange(type === "All" ? "" : type)}
                  className="w-4 h-4 text-[#a67c52] focus:ring-[#a67c52] focus:ring-2"
                />
                <span className="ml-3 text-gray-700 group-hover:text-[#a67c52] transition-colors">
                  {type === "All" ? "Tất cả loại" : type}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Materials */}
      {filters.materials && filters.materials.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Chất Liệu</h4>
          <hr className="mb-3 border-gray-200" />
          <div className="space-y-2">
            {filters.materials.map((material) => (
              <label key={material} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="material"
                  checked={material === "All" ? !filtersState.material : filtersState.material === material}
                  onChange={() => handleMaterialChange(material === "All" ? "" : material)}
                  className="w-4 h-4 text-[#a67c52] focus:ring-[#a67c52] focus:ring-2"
                />
                <span className="ml-3 text-gray-700 group-hover:text-[#a67c52] transition-colors">
                  {material === "All" ? "Tất cả chất liệu" : material}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Ranges */}
      {filters.priceRanges && filters.priceRanges.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Khoảng Giá</h4>
          <hr className="mb-3 border-gray-200" />
          <div className="space-y-2">
            {filters.priceRanges.map((range) => (
              <label key={range.label} className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={
                    filtersState.minPrice === range.min &&
                    filtersState.maxPrice === range.max
                  }
                  onChange={() => handlePriceChange(range)}
                  className="w-4 h-4 text-[#a67c52] focus:ring-[#a67c52] focus:ring-2"
                />
                <span className="ml-3 text-gray-700 group-hover:text-[#a67c52] transition-colors">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Sort Options */}
      {filters.sortOptions && filters.sortOptions.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Sắp Xếp</h4>
          <hr className="mb-3 border-gray-200" />
          <select
            value={filtersState.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52] focus:border-transparent transition-all"
          >
            {filters.sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ShopFiltering;
