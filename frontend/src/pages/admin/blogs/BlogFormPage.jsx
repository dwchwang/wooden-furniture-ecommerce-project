import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import blogService from '../../../services/blogService';

const BlogFormPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    category: 'Tin tức',
    tags: '',
    isPublished: false
  });

  const categories = ['Tin tức', 'Hướng dẫn', 'Sản phẩm mới', 'Khuyến mãi', 'Khác'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.excerpt || !formData.content || !formData.coverImage) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const blogData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await blogService.createBlog(blogData);
      toast.success('Tạo blog thành công!');
      navigate('/admin/blogs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Viết blog mới</h1>
        <p className="text-gray-600 mt-1">Tạo bài viết mới cho website</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                required
              />
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả ngắn <span className="text-red-500">*</span>
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Nhập mô tả ngắn (tối đa 500 ký tự)..."
                rows="3"
                maxLength="500"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.excerpt.length}/500 ký tự
              </p>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Nhập nội dung bài viết (hỗ trợ HTML)..."
                rows="15"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent font-mono text-sm"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: Bạn có thể sử dụng HTML tags như &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publish */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Xuất bản</h3>

              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  name="isPublished"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#a67c52] border-gray-300 rounded focus:ring-[#a67c52]"
                />
                <label htmlFor="isPublished" className="text-sm text-gray-700">
                  Xuất bản ngay
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : formData.isPublished ? (
                    'Xuất bản'
                  ) : (
                    'Lưu nháp'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/blogs')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>

            {/* Cover Image */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh bìa <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                required
              />
              {formData.coverImage && (
                <div className="mt-3">
                  <img
                    src={formData.coverImage}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="nội thất, gỗ, trang trí"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Phân cách bằng dấu phẩy
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogFormPage;
