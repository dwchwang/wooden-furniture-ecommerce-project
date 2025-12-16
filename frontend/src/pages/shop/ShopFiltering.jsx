import React from "react";

const ShopFiltering = ({
  filters,
  filtersState,
  setFiltersState,
  clearFilter,
}) => {
  const handleCategoryChange = (categoryName) => {
    if (categoryName === "All") {
      setFiltersState({ ...filtersState, category: "" });
    } else {
      // Find category ID by name
      const category = filters.categories.find((cat) => cat === categoryName);
      setFiltersState({ ...filtersState, category: categoryName });
    }
  };

  const handlePriceChange = (range) => {
    if (range.label === "All") {
      setFiltersState({ ...filtersState, minPrice: "", maxPrice: "" });
    } else {
      setFiltersState({
        ...filtersState,
        minPrice: range.min,
        maxPrice: range.max || "",
      });
    }
  };

  const handleMaterialChange = (material) => {
    if (material === "All") {
      setFiltersState({ ...filtersState, material: "" });
    } else {
      setFiltersState({ ...filtersState, material });
    }
  };

  const handleTypeChange = (type) => {
    if (type === "All") {
      setFiltersState({ ...filtersState, type: "" });
    } else {
      setFiltersState({ ...filtersState, type });
    }
  };

  const handleSortChange = (sortValue) => {
    setFiltersState({ ...filtersState, sort: sortValue });
  };

  return (
    <div className="space-y-5 flex-shrink-0 w-full md:w-64">
      <h3 className="text-xl font-semibold">Filters</h3>

      {/* Category - Phòng */}
      <div className="flex flex-col space-y-2">
        <h4 className="font-medium text-lg">Phòng</h4>
        <hr />
        {filters.categories.map((category) => (
          <label key={category} className="capitalize cursor-pointer">
            <input
              type="radio"
              name="category"
              value={category}
              checked={
                category === "All"
                  ? !filtersState.category
                  : filtersState.category === category
              }
              onChange={() => handleCategoryChange(category)}
            />
            <span className="ml-1">{category}</span>
          </label>
        ))}
      </div>

      {/* Type - Loại Đồ */}
      {filters.types && (
        <div className="flex flex-col space-y-2">
          <h4 className="font-medium text-lg">Loại Đồ</h4>
          <hr />
          {filters.types.map((type) => (
            <label key={type} className="capitalize cursor-pointer">
              <input
                type="radio"
                name="type"
                value={type}
                checked={
                  type === "All"
                    ? !filtersState.type
                    : filtersState.type === type
                }
                onChange={() => handleTypeChange(type)}
              />
              <span className="ml-1">{type}</span>
            </label>
          ))}
        </div>
      )}

      {/* Material */}
      {filters.materials && (
        <div className="flex flex-col space-y-2">
          <h4 className="font-medium text-lg">Material</h4>
          <hr />
          {filters.materials.map((material) => (
            <label key={material} className="capitalize cursor-pointer">
              <input
                type="radio"
                name="material"
                value={material}
                checked={
                  material === "All"
                    ? !filtersState.material
                    : filtersState.material === material
                }
                onChange={() => handleMaterialChange(material)}
              />
              <span className="ml-1">{material}</span>
            </label>
          ))}
        </div>
      )}

      {/* Price Range */}
      <div className="flex flex-col space-y-2">
        <h4 className="font-medium text-lg">Price Range</h4>
        <hr />
        {filters.priceRanges.map((range) => (
          <label key={range.label} className="capitalize cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              checked={
                range.label === "All"
                  ? !filtersState.minPrice && !filtersState.maxPrice
                  : filtersState.minPrice === range.min &&
                  (filtersState.maxPrice === range.max || (!filtersState.maxPrice && !range.max))
              }
              onChange={() => handlePriceChange(range)}
            />
            <span className="ml-1">{range.label}</span>
          </label>
        ))}
      </div>

      {/* Sort */}
      {filters.sortOptions && (
        <div className="flex flex-col space-y-2">
          <h4 className="font-medium text-lg">Sort By</h4>
          <hr />
          <select
            value={filtersState.sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a67c52]"
          >
            {filters.sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Clear button */}
      <button
        onClick={clearFilter}
        className="w-full bg-[#a67c52] py-2 px-4 text-white rounded-lg hover:bg-[#8b653d] transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ShopFiltering;
