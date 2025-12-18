import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
    fetchVariants();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data?.product || response.data);
    } catch (error) {
      toast.error('Lỗi khi tải sản phẩm');
      navigate('/admin/products');
    }
  };

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${id}/variants`);
      setVariants(response.data?.variants || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này? Tất cả biến thể cũng sẽ bị xóa.')) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Xóa sản phẩm thành công');
      navigate('/admin/products');
    } catch (error) {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-64">
        <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-600 mt-1">Chi tiết sản phẩm</p>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/admin/products/edit/${id}`}
            className="px-4 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors flex items-center gap-2"
          >
            <i className="ri-edit-line"></i>
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <i className="ri-delete-bin-line"></i>
            Xóa
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Images */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Hình ảnh</h2>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {product.images.map((img, index) => (
                  <div key={index} className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có hình ảnh</p>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin chi tiết</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Danh mục</p>
                <p className="font-medium">{product.category?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loại</p>
                <p className="font-medium">{product.type || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Chất liệu</p>
                <p className="font-medium">{product.material || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giá cơ bản</p>
                <p className="font-medium text-[#a67c52]">{product.basePrice?.toLocaleString('vi-VN')}đ</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kích thước (D x R x C)</p>
                <p className="font-medium">
                  {product.dimensions?.length && product.dimensions?.width && product.dimensions?.height
                    ? `${product.dimensions.length} x ${product.dimensions.width} x ${product.dimensions.height} cm`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cân nặng</p>
                <p className="font-medium">{product.weight ? `${product.weight} kg` : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng thái</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {product.isActive ? 'Đang bán' : 'Ngừng bán'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nổi bật</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${product.isFeatured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {product.isFeatured ? 'Có' : 'Không'}
                </span>
              </div>
            </div>
            {product.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">Mô tả</p>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Biến thể sản phẩm ({variants.length})
        </h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <i className="ri-loader-4-line animate-spin text-3xl text-[#a67c52]"></i>
          </div>
        ) : variants.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Chưa có biến thể nào</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Màu sắc</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kích thước</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Giá</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {variants.map((variant) => (
                  <tr key={variant._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{variant.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{variant.color || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{variant.size || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-right text-gray-900">
                      {variant.price?.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={`font-medium ${variant.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {variant.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${variant.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;
