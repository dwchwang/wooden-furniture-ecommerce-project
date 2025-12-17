import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchBlogs } from "../../redux/features/blogs/blogsSlice";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const Blogs = () => {
  const dispatch = useDispatch();
  const { blogs, loading } = useSelector((state) => state.blogs);

  useEffect(() => {
    // Fetch latest 4 blogs for home page
    dispatch(fetchBlogs({ limit: 4, sort: '-publishedAt' }));
  }, [dispatch]);

  return (
    <section className="section__container blog__container">
      <h2 className="section__header">Tin Tức & Blog Mới Nhất</h2>
      <p className="section__subheader">
        Cập nhật những xu hướng nội thất mới nhất, hướng dẫn chăm sóc và bảo quản sản phẩm gỗ
      </p>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Chưa có bài viết nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-12">
          {blogs.map((blog) => (
            <Link
              key={blog._id}
              to={`/blogs/${blog.slug}`}
              className="blog__card cursor-pointer hover:scale-105 transition-all duration-300"
            >
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="h-[212px] w-full object-cover rounded-t-lg"
              />
              <div className="blog__card__content">
                <h6 className="text-[#a67c52] text-sm font-medium">{blog.category}</h6>
                <h4 className="text-lg font-bold text-gray-900 mt-2 line-clamp-2">{blog.title}</h4>
                <p className="text-gray-500 text-sm mt-2">
                  {formatDistanceToNow(new Date(blog.publishedAt), {
                    addSuffix: true,
                    locale: vi
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* View All Button */}
      <div className="text-center mt-8">
        <Link
          to="/blogs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors"
        >
          Xem tất cả bài viết
          <i className="ri-arrow-right-line"></i>
        </Link>
      </div>
    </section>
  );
};

export default Blogs;
