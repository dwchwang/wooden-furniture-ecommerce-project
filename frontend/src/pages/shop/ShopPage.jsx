import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/features/products/productsSlice";
import { fetchCategories } from "../../redux/features/categories/categoriesSlice";
import ProductCards from "./ProductCards";
import ShopFiltering from "./ShopFiltering";

const ShopPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, loading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const [filtersState, setFiltersState] = useState({
    category: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    material: "",
    sort: "-createdAt",
  });

  // Read URL query parameters on mount
  useEffect(() => {
    const typeFromUrl = searchParams.get('type');
    const categoryFromUrl = searchParams.get('category');

    if (typeFromUrl || categoryFromUrl) {
      setFiltersState(prev => ({
        ...prev,
        type: typeFromUrl || "",
        category: categoryFromUrl || ""
      }));

      // Scroll to top when navigating with filters
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams]);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories(true)); // Only active categories
  }, [dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    const filters = {
      page: 1,
      limit: 12,
      isActive: true,
    };

    if (filtersState.category) filters.category = filtersState.category;
    if (filtersState.type) filters.type = filtersState.type;
    if (filtersState.minPrice) filters.minPrice = filtersState.minPrice;
    if (filtersState.maxPrice) filters.maxPrice = filtersState.maxPrice;
    if (filtersState.material) filters.material = filtersState.material;
    if (filtersState.sort) filters.sort = filtersState.sort;

    console.log('ShopPage filters:', filters); // DEBUG
    dispatch(fetchProducts(filters));
  }, [dispatch, filtersState]);

  const clearFilter = () => {
    setFiltersState({
      category: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      material: "",
      sort: "-createdAt",
    });
  };

  // Build filters object for ShopFiltering component
  const filters = {
    categories: [{ _id: "", name: "Tất cả danh mục" }, ...categories],
    types: [
      "All",
      "Bàn",
      "Ghế",
      "Giường",
      "Tủ",
      "Kệ",
      "Sofa",
      "Khác",
    ],
    priceRanges: [
      { label: "Tất cả giá", min: "", max: "" },
      { label: "Dưới 2.000.000đ", min: 0, max: 2000000 },
      { label: "2.000.000đ - 5.000.000đ", min: 2000000, max: 5000000 },
      { label: "5.000.000đ - 10.000.000đ", min: 5000000, max: 10000000 },
      { label: "10.000.000đ - 20.000.000đ", min: 10000000, max: 20000000 },
      { label: "Trên 20.000.000đ", min: 20000000, max: "" },
    ],
    materials: ["All", "Gỗ Sồi", "Gỗ Tần Bì", "Gỗ Óc Chó", "Gỗ Thông", "Kim Loại"],
    sortOptions: [
      { label: "Mới Nhất", value: "-createdAt" },
      { label: "Giá: Thấp đến Cao", value: "basePrice" },
      { label: "Giá: Cao đến Thấp", value: "-basePrice" },
      { label: "Tên: A-Z", value: "name" },
      { label: "Tên: Z-A", value: "-name" },
    ],
  };

  return (
    <>
      <section className="section__container bg-primary-light">
        <h2 className="section__header capitalize">Cửa hàng</h2>
        <p className="section__subheader">
          Khám phá bộ sưu tập nội thất gỗ thủ công cao cấp
        </p>
      </section>

      <section className="section__container">
        <div className="flex flex-col md:flex-row md:gap-12 gap-8 ">
          {/* left side - filters */}
          <ShopFiltering
            filters={filters}
            filtersState={filtersState}
            setFiltersState={setFiltersState}
            clearFilter={clearFilter}
          />

          {/* right side - products */}
          <div className="flex-1">
            <h3 className="text-xl font-medium mb-6">
              {loading ? (
                "Đang tải sản phẩm..."
              ) : (
                `Sản phẩm có sẵn: ${products.length}`
              )}
            </h3>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a67c52]"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm</p>
                <button
                  onClick={clearFilter}
                  className="mt-4 px-6 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d]"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <ProductCards products={products} />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopPage;
