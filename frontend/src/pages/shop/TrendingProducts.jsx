import React, { useState } from "react";
import ProductCards from "./ProductCards";
import products from "../../data/products.json";

const TrendingProducts = () => {
  const [visibleProducts, setVisibleProducts] = useState(8);
  const loadMoreProducts = () => {
    setVisibleProducts((prevCount) => prevCount + 4);
  };
  return (
    <section className="section__container product__container">
      <h2 className="section__header">Trending Product</h2>
      <p className="section__subheader">
        Khám phá những thiết kế nội thất gỗ đang được ưa chuộng nhất, mang đến
        sự sang trọng, bền bỉ và phong cách tinh tế cho không gian sống của bạn.
      </p>

      {/* Product Cards */}
      <ProductCards
        products={products.slice(0, visibleProducts)}
      ></ProductCards>

      {/* load more products button */}
      <div className="product__btn">
        {visibleProducts < products.length && (
          <button className="btn btn__primary" onClick={loadMoreProducts}>
            Load More
          </button>
        )}
      </div>
    </section>
  );
};

export default TrendingProducts;
