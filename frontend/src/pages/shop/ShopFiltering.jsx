import React from "react";

const ShopFiltering = ({
  filters,
  filtersState,
  setFiltersState,
  clearFilter,
}) => {
  return (
    <div className="space-y-5 flex-shrink-0">
      <h3>Filters</h3>

      {/* category */}
      <div className="flex flex-col space-y-2">
        <h4 className="font-medium text-lg">Category</h4>
        <hr />
        {filters.categories.map((category) => (
          <label key={category} className="capitalize cursor-pointer">
            <input
              type="radio"
              name="category"
              value={category}
              id="category"
              checked={filtersState.category === category}
              onChange={(e) =>
                setFiltersState({ ...filtersState, category: e.target.value })
              }
            />
            <span className="ml-1">{category}</span>
          </label>
        ))}
      </div>

      {/* types */}
      <div className="flex flex-col space-y-2">
        <h4 className="font-medium text-lg">Types</h4>
        <hr />
        {filters.types.map((type) => (
          <label key={type} className="capitalize cursor-pointer">
            <input
              type="radio"
              name="type"
              value={type}
              id="type"
              checked={filtersState.type === type}
              onChange={(e) =>
                setFiltersState({ ...filtersState, type: e.target.value })
              }
            />
            <span className="ml-1">{type}</span>
          </label>
        ))}
      </div>

      {/* pricing */}
      <div className="flex flex-col space-y-2">
        <h4 className="font-medium text-lg">Price Ranges</h4>
        <hr />
        {filters.priceRanges.map((range) => (
          <label key={range.label} className="capitalize cursor-pointer">
            <input
              type="radio"
              name="priceRange"
              id="priceRange"
              value={`${range.min}-${range.max}`}
              checked={filtersState.priceRange === `${range.min}-${range.max}`}
              onChange={(e) =>
                setFiltersState({ ...filtersState, priceRange: e.target.value })
              }
            />
            <span className="ml-1">{range.label}</span>
          </label>
        ))}
      </div>

      {/* clear button */}
      <button
        onClick={clearFilter}
        className="bg-primary py-1 px-4 text-white rounded-lg"
      >
        Clear All Filters
      </button>
    </div>
  );
};

export default ShopFiltering;
