import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchBlogs } from '../../redux/features/blogs/blogsSlice';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const BlogListPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { blogs, pagination, loading } = useSelector((state) => state.blogs);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page')) || 1
  });

  useEffect(() => {
    dispatch(fetchBlogs(filters));
  }, [dispatch, filters]);

  const handleCategoryFilter = (category) => {
    const newFilters = { ...filters, category, page: 1 };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    setSearchParams(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categories = ['Tin tức', 'Hướng dẫn', 'Sản phẩm mới', 'Khuyến mãi', 'Khác'];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog & Tin Tức</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Cập nhật tin tức mới nhất về nội thất, xu hướng thiết kế và hướng dẫn chăm sóc sản phẩm
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              {/* Search */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Tìm kiếm</h3>
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      placeholder="Tìm bài viết..."
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#a67c52]"
                    >
                      <i className="ri-search-line text-xl"></i>
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Danh mục</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryFilter('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${!filters.category
                      ? 'bg-[#a67c52] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryFilter(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${filters.category === category
                        ? 'bg-[#a67c52] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Blog List */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <i className="ri-article-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {blogs.map((blog) => (
                    <Link
                      key={blog._id}
                      to={`/blogs/${blog.slug}`}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-[#a67c52] text-white text-xs rounded-full">
                            {blog.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#a67c52] transition-colors">
                          {blog.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <img
                              src={blog.author?.avatar || '/user.png'}
                              alt={blog.author?.fullName}
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/user.png';
                              }}
                            />
                            <span>{blog.author?.fullName}</span>
                          </div>
                          <span>
                            {formatDistanceToNow(new Date(blog.publishedAt), {
                              addSuffix: true,
                              locale: vi
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <i className="ri-eye-line"></i>
                            {blog.views}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-arrow-left-line"></i>
                    </button>
                    {[...Array(pagination.totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-4 py-2 rounded-lg ${pagination.currentPage === index + 1
                          ? 'bg-[#a67c52] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogListPage;
