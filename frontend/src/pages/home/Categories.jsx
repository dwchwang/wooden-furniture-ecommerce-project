import { Link } from "react-router-dom";
import category1 from "../../assets/category-livingroom.jpg";
import category2 from "../../assets/category-bedroom.jpg";
import category3 from "../../assets/category-diningroom.jpg";
import category4 from "../../assets/category-decor.jpg";
import category5 from "../../assets/category-homeoffice.jpg";
import category6 from "../../assets/category-outdoor.jpg";

const Categories = () => {
  const categories = [
    { name: "Living Room", image: category1, path: "living-room" },
    { name: "Bedroom", image: category2, path: "bedroom" },
    { name: "Dining Room", image: category3, path: "dining-room" },
    {
      name: "Decor & Accessories",
      image: category4,
      path: "decor-accessories",
    },
    { name: "Home Office", image: category5, path: "home-office" },
    { name: "Outdoor", image: category6, path: "outdoor" },
  ];
  return (
    <>
      <div className="product__grid">
        {categories.map((categories) => (
          <Link
            to={`/categories/${categories.path}`}
            className="categories__card"
            key={categories.name}
          >
            <img src={categories.image} alt={categories.name} />
            <h4>{categories.name}</h4>
          </Link>
        ))}
      </div>
    </>
  );
};

export default Categories;
