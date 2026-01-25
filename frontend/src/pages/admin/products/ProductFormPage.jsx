import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    material: '',
    images: [],
    basePrice: '',
    isActive: true,
    isFeatured: false
  });

  const [variants, setVariants] = useState([
    {
      color: '', size: '', price: '', stock: '', sku: '', images: [],
      dimensions: { length: '', width: '', height: '' }, weight: ''
    }
  ]);

  const [imagePreview, setImagePreview] = useState([]);
  const [uploading, setUploading] = useState(false);

  const productTypes = ['Bàn', 'Ghế', 'Giường', 'Tủ', 'Kệ', 'Sofa', 'Bàn Làm Việc', 'Tủ Quần Áo', 'Bàn Ăn', 'Ghế Ăn', 'Bàn Trà', 'Kệ Sách', 'Tủ Giày', 'Khác'];

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data?.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      console.log('Fetching product with ID:', id);
      const response = await api.get(`/products/${id}`);
      console.log('Product response:', response);
      const product = response.data?.product || response.data;
      console.log('Extracted product:', product);
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || '',
        type: product.type || '',
        material: product.material || '',
        images: product.images || [],
        basePrice: product.basePrice || '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false
      });
      setImagePreview(product.images || []);

      // Fetch variants
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map(v => ({
          _id: v._id,
          color: v.color || '',
          size: v.size || '',
          price: v.price || '',
          stock: v.stock || '',
          sku: v.sku || '',
          images: v.images || [],
          dimensions: v.dimensions || { length: '', width: '', height: '' },
          weight: v.weight || ''
        })));
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Lỗi khi tải sản phẩm');
      navigate('/admin/products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 10) {
      toast.error('Tối đa 10 ảnh cho sản phẩm');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        const response = await api.post('/upload/image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('Upload response:', response);
        let imageUrl = response.data?.image?.url;

        // If URL is a local path, prepend backend URL
        if (imageUrl && !imageUrl.startsWith('http')) {
          const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
          imageUrl = `${backendUrl}/${imageUrl}`;
        }

        return imageUrl;
      });

      const urls = await Promise.all(uploadPromises);
      console.log('Uploaded URLs:', urls);

      const validUrls = urls.filter(url => url); // Filter out undefined

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validUrls]
      }));
      setImagePreview(prev => [...prev, ...validUrls]);
      toast.success(`Upload ${validUrls.length} ảnh thành công`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, {
      color: '', size: '', price: '', stock: '', sku: '', images: [],
      dimensions: { length: '', width: '', height: '' }, weight: ''
    }]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      toast.error('Phải có ít nhất 1 biến thể');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantImageUpload = async (variantIndex, e) => {
    const files = Array.from(e.target.files);
    const currentVariant = variants[variantIndex];
    const currentImages = currentVariant.images || [];

    if (files.length + currentImages.length > 5) {
      toast.error('Tối đa 5 ảnh cho mỗi phiên bản');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);
        const response = await api.post('/upload/image', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        let imageUrl = response.data?.image?.url;

        // If URL is a local path, prepend backend URL
        if (imageUrl && !imageUrl.startsWith('http')) {
          const backendUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';
          imageUrl = `${backendUrl}/${imageUrl}`;
        }

        return imageUrl;
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(url => url);

      const newVariants = [...variants];
      newVariants[variantIndex].images = [...currentImages, ...validUrls];
      setVariants(newVariants);

      toast.success(`Upload ${validUrls.length} ảnh thành công`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category || !formData.basePrice) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (variants.some(v => !v.price || !v.stock)) {
      toast.error('Vui lòng điền đầy đủ thông tin biến thể');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice)
      };

      let productId;
      if (isEdit) {
        await api.patch(`/products/${id}`, productData);
        productId = id;
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        const response = await api.post('/products', productData);
        console.log('Create product response:', response);
        productId = response.data?._id || response.data?.product?._id;
        console.log('Product ID:', productId);
        toast.success('Thêm sản phẩm thành công');
      }

      // Create/Update variants
      const variantPromises = variants.map(async (variant) => {
        // Parse dimensions - only include if at least one field has a value
        let parsedDimensions = undefined;
        if (variant.dimensions) {
          const length = variant.dimensions.length && variant.dimensions.length.trim() !== ''
            ? parseFloat(variant.dimensions.length)
            : undefined;
          const width = variant.dimensions.width && variant.dimensions.width.trim() !== ''
            ? parseFloat(variant.dimensions.width)
            : undefined;
          const height = variant.dimensions.height && variant.dimensions.height.trim() !== ''
            ? parseFloat(variant.dimensions.height)
            : undefined;

          // Only set dimensions if at least one value exists
          if (length !== undefined || width !== undefined || height !== undefined) {
            parsedDimensions = { length, width, height };
          }
        }

        // Parse weight - only include if value is non-empty
        const parsedWeight = variant.weight && variant.weight.toString().trim() !== ''
          ? parseFloat(variant.weight)
          : undefined;

        const variantData = {
          product: productId,
          color: variant.color,
          size: variant.size,
          price: parseFloat(variant.price),
          stock: parseInt(variant.stock) || 0,
          sku: variant.sku || undefined,
          images: variant.images || [],
          dimensions: parsedDimensions,
          weight: parsedWeight
        };

        if (variant._id) {
          return api.patch(`/products/variants/${variant._id}`, variantData);
        } else {
          return api.post(`/products/${productId}/variants`, variantData);
        }
      });

      await Promise.all(variantPromises);

      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </h1>
        <p className="text-gray-600 mt-1">Điền thông tin sản phẩm và biến thể</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                placeholder="Nhập tên sản phẩm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                placeholder="Mô tả chi tiết sản phẩm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại sản phẩm</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
              >
                <option value="">Chọn loại</option>
                {productTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chất liệu</label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                placeholder="Gỗ sồi, kim loại..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá cơ bản (đ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                placeholder="15000000"
              />
            </div>
          </div>
        </div>



        {/* Images */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Hình ảnh sản phẩm</h2>
          <div className="mb-4">
            <label className="block w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#a67c52] transition-colors">
              <i className="ri-upload-cloud-line text-4xl text-gray-400 mb-2"></i>
              <p className="text-gray-600">Click để upload ảnh (tối đa 10 ảnh)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imagePreview.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Biến thể sản phẩm</h2>
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <i className="ri-add-line mr-2"></i>
              Thêm biến thể
            </button>
          </div>
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Biến thể #{index + 1}</h3>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Màu sắc</label>
                    <input
                      type="text"
                      value={variant.color}
                      onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                      placeholder="Nâu, Trắng..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kích thước</label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                      placeholder="L, M, S..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá (đ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tồn kho <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                      placeholder="Auto-generate"
                    />
                  </div>
                </div>

                {/* Dimensions & Weight for this variant */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Kích thước & Trọng lượng</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dài (cm)</label>
                      <input
                        type="number"
                        value={variant.dimensions?.length || ''}
                        onChange={(e) => handleVariantChange(index, 'dimensions', { ...variant.dimensions, length: e.target.value })}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                        placeholder="180"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rộng (cm)</label>
                      <input
                        type="number"
                        value={variant.dimensions?.width || ''}
                        onChange={(e) => handleVariantChange(index, 'dimensions', { ...variant.dimensions, width: e.target.value })}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cao (cm)</label>
                      <input
                        type="number"
                        value={variant.dimensions?.height || ''}
                        onChange={(e) => handleVariantChange(index, 'dimensions', { ...variant.dimensions, height: e.target.value })}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                        placeholder="75"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                      <input
                        type="number"
                        value={variant.weight || ''}
                        onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                        placeholder="45"
                      />
                    </div>
                  </div>
                </div>

                {/* Variant Images */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh phiên bản (tối đa 5 ảnh)
                  </label>
                  <div className="mb-3">
                    <label className="block w-full px-4 py-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#a67c52] transition-colors">
                      <i className="ri-image-add-line text-2xl text-gray-400 mb-1"></i>
                      <p className="text-sm text-gray-600">Click để upload ảnh cho phiên bản này</p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleVariantImageUpload(index, e)}
                        className="hidden"
                        disabled={uploading || (variant.images?.length >= 5)}
                      />
                    </label>
                  </div>
                  {variant.images && variant.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {variant.images.map((url, imgIndex) => (
                        <div key={imgIndex} className="relative group">
                          <img
                            src={url}
                            alt={`Variant ${index + 1} - Image ${imgIndex + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(index, imgIndex)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <i className="ri-close-line text-xs"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Cài đặt</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#a67c52] rounded focus:ring-[#a67c52]"
              />
              <span className="text-gray-700">Kích hoạt sản phẩm (hiển thị trên cửa hàng)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#a67c52] rounded focus:ring-[#a67c52]"
              />
              <span className="text-gray-700">Sản phẩm nổi bật</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Đang xử lý...
              </>
            ) : (
              <>{isEdit ? 'Cập nhật' : 'Thêm sản phẩm'}</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
