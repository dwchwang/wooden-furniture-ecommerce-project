// import React, { useState } from "react";
// import productsData from "../../data/products.json";
// import ProductCards from "../shop/ProductCards";

// const Search = () => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filteredProducts, setFilteredProducts] = useState(productsData);

//   const handleSearch = () => {
//     const query = searchQuery.toLowerCase();
//     const filtered = productsData.filter(
//       (product) =>
//         product.name.toLowerCase().includes(query) ||
//         product.description.toLowerCase().includes(query)
//     );
//     setFilteredProducts(filtered);
//   };

//   return (
//     <>
//       <section className="section__container bg-primary-light">
//         <h2 className="section__header capitalize">Search Products</h2>
//         <p className="section__subheader">
//           Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum,
//           commodi!
//         </p>
//       </section>

//       <section className="section__container">
//         <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
//           <input
//             type="text"
//             placeholder="Search"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="search-bar w-full max-w-4xl p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brown-300 focus:border-brown-300"
//           />
//           <button
//             onClick={handleSearch}
//             className="search-button w-full md:w-auto bg-primary text-white rounded-md"
//           >
//             Search
//           </button>
//         </div>


//         <div>
//           {filteredProducts.length > 0 && (
//             <ProductCards products={filteredProducts}></ProductCards>
//           )}
//         </div>
//       </section>
//     </>
//   );
// };

// export default Search;

import React, { useState } from "react";
import productsData from "../../data/products.json";
import ProductCards from "../shop/ProductCards";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(productsData); // ban đầu show hết

  const handleSearch = () => {
    const query = searchQuery.toLowerCase().trim();

    if (query === "") {
      setFilteredProducts(productsData); // nếu rỗng thì hiện lại tất cả
    } else {
      const filtered = productsData.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }

    setSearchQuery(""); // clear input sau khi search
  };

  return (
    <>
      <section className="section__container bg-primary-light">
        <h2 className="section__header capitalize">Search Products</h2>
        <p className="section__subheader">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatum,
          commodi!
        </p>
      </section>

      <section className="section__container">
        <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar w-full max-w-4xl p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brown-300 focus:border-brown-300"
          />
          <button
            onClick={handleSearch}
            className="search-button w-full md:w-auto bg-primary text-white rounded-md px-4 py-2"
          >
            Search
          </button>
        </div>

        <div className="mt-6">
          {filteredProducts.length > 0 ? (
            <ProductCards products={filteredProducts} />
          ) : (
            <p className="text-center text-gray-500">
              Không tìm thấy sản phẩm nào.
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default Search;