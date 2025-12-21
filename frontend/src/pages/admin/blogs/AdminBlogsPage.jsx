import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import blogService from '../../../services/blogService';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const AdminBlogsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    limit: 10
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: '',
    search: ''
  });

  useEffect(() => {
    fetchBlogs();
  }, [filters.page, filters.category]);

  // Debounced search effect
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (filters.search !== undefined) {
        fetchBlogs();
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delaySearch);
  }, [filters.search]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await blogService.getAllBlogsForAdmin(filters);
      setBlogs(response.blogs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (blogId, blogTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${blogTitle}"?`)) {
      return;
    }

    try {
      await blogService.deleteBlog(blogId);
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Xóa bài viết thành công!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      // Refresh blog list
      fetchBlogs();
    } catch (error) {
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài viết';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  };

  const categories = ['Tin tức', 'Hướng dẫn', 'Sản phẩm mới', 'Khuyến mãi', 'Khác'];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
          <p className="text-gray-600 mt-1">Quản lý và tạo bài viết mới</p>
        </div>
        <Link
          to="/admin/blogs/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors"
        >
          <i className="ri-add-line"></i>
          Viết blog mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, search: '', page: 1 })}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#a67c52]"
                >
                  <i className="ri-search-line text-xl"></i>
                </button>
              </div>
            </form>
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Search Results Indicator */}
        {filters.search && !loading && (
          <div className="mt-4 text-sm text-gray-600">
            Tìm thấy <span className="font-semibold text-[#a67c52]">{pagination.totalBlogs || 0}</span> kết quả cho "{filters.search}"
          </div>
        )}
      </div>

      {/* Blog List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-article-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg mb-4">Chưa có bài viết nào</p>
            <Link
              to="/admin/blogs/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors"
            >
              <i className="ri-add-line"></i>
              Viết blog đầu tiên
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bài viết
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tác giả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt xem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{blog.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{blog.excerpt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {blog.author?.fullName}
                    </td>
                    <td className="px-6 py-4">
                      {blog.isPublished ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                          Đã xuất bản
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                          Nháp
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {blog.views}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(blog.createdAt), {
                        addSuffix: true,
                        locale: vi
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/blogs/${blog.slug}`}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem"
                        >
                          <i className="ri-eye-line text-lg"></i>
                        </Link>
                        <Link
                          to={`/admin/blogs/edit/${blog._id}`}
                          className="text-[#a67c52] hover:text-[#8b653d]"
                          title="Sửa"
                        >
                          <i className="ri-edit-line text-lg"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(blog._id, blog.title)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <i className="ri-delete-bin-line text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{blogs.length}</span> trong tổng số{' '}
                  <span className="font-medium">{pagination.totalBlogs}</span> bài viết
                </div>
                <div className="flex gap-2">
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
                      className={`px-4 py-2 rounded-lg ${filters.page === index + 1
                        ? 'bg-[#a67c52] text-white hover:bg-[#8b653d]'
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBlogsPage;
