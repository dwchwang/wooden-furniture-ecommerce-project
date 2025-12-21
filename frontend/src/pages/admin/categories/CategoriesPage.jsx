import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    parent: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      const categoriesData = response.data?.categories || [];

      setCategories(categoriesData);

      // Calculate stats
      const total = categoriesData.length;
      const active = categoriesData.filter(c => c.isActive).length;
      const inactive = categoriesData.filter(c => !c.isActive).length;
      const parent = categoriesData.filter(c => !c.parent).length;

      setStats({ total, active, inactive, parent });
    } catch (error) {
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa danh mục');
    }
  };

  const toggleStatus = async (category) => {
    try {
      await api.put(`/categories/${category._id}`, {
        isActive: !category.isActive
      });
      toast.success(`${category.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} danh mục thành công`);
      fetchCategories();
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Danh mục</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục sản phẩm</p>
        </div>
        <Link
          to="/admin/categories/new"
          className="px-4 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Tạo danh mục mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng danh mục</p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-folder-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Đang hoạt động</p>
              <p className="text-3xl font-bold mt-2">{stats.active}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-check-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Vô hiệu hóa</p>
              <p className="text-3xl font-bold mt-2">{stats.inactive}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-close-line text-3xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Danh mục cha</p>
              <p className="text-3xl font-bold mt-2">{stats.parent}</p>
            </div>
            <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <i className="ri-folder-open-line text-3xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md text-center py-16">
          <i className="ri-folder-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg mb-4">Chưa có danh mục nào</p>
          <Link
            to="/admin/categories/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors"
          >
            <i className="ri-add-line"></i>
            Tạo danh mục đầu tiên
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục cha
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {category.image && (
                        <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.parent ? (
                      <span className="text-sm text-gray-900">{category.parent.name}</span>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Danh mục gốc</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleStatus(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${category.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {category.isActive ? 'Hoạt động' : 'Vô hiệu'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/categories/edit/${category._id}`}
                        className="text-[#a67c52] hover:text-[#8b653d]"
                        title="Sửa"
                      >
                        <i className="ri-edit-line text-lg"></i>
                      </Link>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-800"
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
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
