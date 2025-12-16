import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeaturedProducts } from "../../redux/features/products/productsSlice";
import ProductCards from "./ProductCards";

const TrendingProducts = () => {
  const dispatch = useDispatch();
  const { featuredProducts, loading } = useSelector((state) => state.products);
  const [visibleProducts, setVisibleProducts] = useState(8);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  const loadMoreProducts = () => {
    setVisibleProducts((prevCount) => prevCount + 4);
  };

  return (
    <section className="section__container product__container">
      <h2 className="section__header">Trending Products</h2>
      <p className="section__subheader">
        Khám phá những thiết kế nội thất gỗ đang được ưa chuộng nhất, mang đến
        sự sang trọng, bền bỉ và phong cách tinh tế cho không gian sống của bạn.
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a67c52]"></div>
        </div>
      ) : featuredProducts.length === 0 ? (
        <p className="text-center text-gray-500">No featured products available</p>
      ) : (
        <>
          {/* Product Cards */}
          <ProductCards
            products={featuredProducts.slice(0, visibleProducts)}
          />

          {/* load more products button */}
          <div className="product__btn">
            {visibleProducts < featuredProducts.length && (
              <button className="btn btn__primary" onClick={loadMoreProducts}>
                Load More
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default TrendingProducts;
