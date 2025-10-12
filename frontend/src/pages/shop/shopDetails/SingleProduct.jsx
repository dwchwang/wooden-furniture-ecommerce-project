import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import RatingStars from "../../../components/RatingStars";

const SingleProduct = () => {
  const { id } = useParams();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <>
      <section className="section__container bg-primary-light">
        <h2 className="section__header capitalize">Single Product Page</h2>
        <div className="section__subheader space-x-2 ">
          <span>
            <Link to="/">Home</Link>
          </span>
          <i className="ri-arrow-right-s-line"></i>
          <span>
            <Link to="/shop">Shop</Link>
          </span>
          <i className="ri-arrow-right-s-line"></i>
          <span className="hover:text-primary cursor-pointer">
            Product name
          </span>
        </div>
      </section>

      <section className="section__container mt-8">
        <div className="flex flex-col items-center md:flex-row gap-8">
          {/* product img */}
          <div className="md:w-1/2 w-full">
            <img
              src="https://noithattamviet.net/public/images/products/ghe-sofa-don-sd-05-1727661503.jpg"
              alt="image"
              className="rounded-md w-[500px] h-[450px] object-cover"
            />
          </div>

          {/* info */}
          <div className="md:w-1/2 w-full pl-8">
            <h3 className="text-2xl font-semibold mb-4">Product Name</h3>
            <p className="text-xl text-primary mb-4">
              6.000.000 VND <s>7.500.000 VND</s>
            </p>
            <p className="text-gray-400 mb-4">This is an product discription</p>

            {/* additional product info */}
            <div>
              <p className="mb-2">
                <strong>Category:</strong> Living Room
              </p>
              <p className="mb-2">
                <strong>type:</strong> Chair
              </p>
              <div className="flex gap-1 items-center">
                <strong>Rating: </strong>
                <RatingStars rating={4}></RatingStars>
              </div>
            </div>

            <button className="mt-6 px-6 py-3 bg-primary text-white rounded-md">
              Add to Cart
            </button>
          </div>
        </div>
      </section>

      {/* display review */}
      <section className="section__container mt-8">Reviews Here</section>
    </>
  );
};

export default SingleProduct;
