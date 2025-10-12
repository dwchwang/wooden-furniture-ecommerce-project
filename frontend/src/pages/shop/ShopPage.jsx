import React, { useEffect, useState } from "react";
import productsData from "../../data/products.json";
import ProductCards from "./ProductCards";
import ShopFiltering from "./ShopFiltering";

const categoriesMap = {
  All: "all",
  "Living Room": "living-room",
  Bedroom: "bedroom",
  "Dining Room": "dining-room",
  "Decor & Accessories": "decor-accessories",
  "Home Office": "home-office",
  Outdoor: "outdoor",
};

const filters = {
  categories: [
    "All",
    "Living Room",
    "Bedroom",
    "Dining Room",
    "Decor & Accessories",
    "Home Office",
    "Outdoor",
  ],
  types: [
    "All",
    "Bed",
    "Sofa",
    "Chair",
    "Table",
    "Wardrobe",
    "Cabinet",
    "Bookshelf",
  ],
  priceRanges: [
    { label: "Under 2.000.000 VND", min: 0, max: 2000000 },
    { label: "2.000.000 - 5.000.000 VND", min: 2000000, max: 5000000 },
    { label: "5.000.000 - 10.000.000 VND", min: 5000000, max: 10000000 },
    { label: "10.000.000 - 20.000.000 VND", min: 10000000, max: 20000000 },
    { label: "Above 20.000.000 VND", min: 20000000, max: Infinity },
  ],
};

const ShopPage = () => {
  const [products, setProducts] = useState(productsData);
  const [filtersState, setFiltersState] = useState({
    category: "All",
    type: "All",
    priceRange: "All",
  });

  //filtering functions
  const applyFilters = () => {
    let filteredProducts = productsData;

    // filter by category
    if (filtersState.category && filtersState.category !== "All") {
      const categorySlug = categoriesMap[filtersState.category];
      filteredProducts = filteredProducts.filter(
        (product) => product.category === categorySlug
      );
    }

    // filter by type
    if (filtersState.type && filtersState.type !== "All") {
      filteredProducts = filteredProducts.filter(
        (product) => product.type === filtersState.type
      );
    }

    // filter by price range
    if (filtersState.priceRange && filtersState.priceRange !== "All") {
      const [minPrice, maxPrice] = filtersState.priceRange
        .split("-")
        .map(Number);

      filteredProducts = filteredProducts.filter((product) => {
        // chuyển "12.000.000" -> 12000000
        const numericPrice = Number(product.price.replace(/\./g, ""));
        return numericPrice >= minPrice && numericPrice <= maxPrice;
      });
    }

    setProducts(filteredProducts);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersState]);

  const clearFilter = () => {
    setFiltersState({
      categories: "All",
      Types: "All",
      priceRanges: "All",
    });
  };

  return (
    <>
      <section className="section__container bg-primary-light">
        <h2 className="section__header capitalize">Shop Page</h2>
        <p className="section__subheader">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum,
          commodi!
        </p>
      </section>

      <section className="section__container">
        <div className="flex flex-col md:flex-row md:gap-12 gap-8 ">
          {/* left side */}
          <ShopFiltering
            filters={filters}
            filtersState={filtersState}
            setFiltersState={setFiltersState}
            clearFilter={clearFilter}
          ></ShopFiltering>

          {/* right side */}
          <div>
            <h3 className="text-xl font-medium mb-6">
              Products Available: {products.length}
            </h3>
            <ProductCards products={products}></ProductCards>
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopPage;
