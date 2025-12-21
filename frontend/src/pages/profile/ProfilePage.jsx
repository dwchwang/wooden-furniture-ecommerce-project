import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import { setUser } from '../../redux/features/auth/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setIsLoading(true);
      const response = await userService.uploadAvatar(file);

      // Update Redux store with user data
      if (response && response.data && response.data.user) {
        dispatch(setUser(response.data.user));
      } else if (response && response.user) {
        dispatch(setUser(response.user));
      }

      toast.success('Cập nhật ảnh đại diện thành công!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error(error.message || 'Không thể tải ảnh lên!');
      setAvatarPreview(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await userService.updateProfile(formData);

      // Update Redux store with user data
      if (response && response.data && response.data.user) {
        dispatch(setUser(response.data.user));
      } else if (response && response.user) {
        dispatch(setUser(response.user));
      }

      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Không thể cập nhật thông tin!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Thông Tin Cá Nhân</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32">
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-200">
              <img
                src={avatarPreview || user.avatar || '/default-avatar.png'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-[#a67c52] text-white p-2 rounded-full cursor-pointer hover:bg-[#8b653d] transition-colors"
            >
              <i className="ri-camera-line text-lg"></i>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={isLoading}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500 mt-2">Click vào biểu tượng camera để thay đổi ảnh</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                  required
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.fullName}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">{user.email}</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số Điện Thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user.phone || 'Chưa cập nhật'}</p>
              )}
            </div>

            {/* Role (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai Trò
              </label>
              <p className="px-4 py-2 bg-gray-50 rounded-lg capitalize">{user.role}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#a67c52] text-white py-3 rounded-lg hover:bg-[#8b653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
                className="flex-1 bg-[#a67c52] text-white py-3 rounded-lg hover:bg-[#8b653d] transition-colors"
              >
                <i className="ri-edit-line mr-2"></i>
                Chỉnh Sửa Thông Tin
              </button>
            )}
          </div>
        </form>

        {/* Change Password Link */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <a
            href="/profile/password"
            className="text-[#a67c52] hover:text-[#8b653d] font-medium flex items-center"
          >
            <i className="ri-lock-password-line mr-2"></i>
            Đổi Mật Khẩu
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
