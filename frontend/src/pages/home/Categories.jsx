import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../../redux/features/categories/categoriesSlice";
import { getImageUrl } from "../../utils/helpers";

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories(true)); // Only active categories
  }, [dispatch]);

  if (loading) {
    return (
      <div className="product__grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="categories__card animate-pulse">
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Show only top 6 categories
  const displayCategories = categories.slice(0, 6);

  return (
    <div className="product__grid">
      {displayCategories.map((category) => (
        <Link
          to={`/categories/${category.slug}`}
          className="categories__card"
          key={category._id}
        >
          <img
            src={getImageUrl(category.image ? [category.image] : [])}
            alt={category.name}
            className="w-full h-48 object-cover rounded"
          />
          <h4 className="mt-2 text-center font-semibold">{category.name}</h4>
        </Link>
      ))}
    </div>
  );
};

export default Categories;
