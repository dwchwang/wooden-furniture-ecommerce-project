import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement API call to send contact message
      // await contactService.sendMessage(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Liên Hệ Với Chúng Tôi</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại tin nhắn và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Address */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#a67c52] flex items-center justify-center flex-shrink-0">
                  <i className="ri-map-pin-line text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Địa Chỉ</h3>
                  <p className="text-gray-600">
                    252 Đường Phan Bội Châu, Thị Trấn Đô Lương<br />
                    Huyện Đô Lương, Tỉnh Nghệ An<br />
                    Việt Nam
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#a67c52] flex items-center justify-center flex-shrink-0">
                  <i className="ri-phone-line text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Điện Thoại</h3>
                  <p className="text-gray-600">
                    Hotline: <a href="tel:0123456789" className="text-[#a67c52] hover:underline">0123 456 789</a><br />
                    Hỗ trợ: <a href="tel:0987654321" className="text-[#a67c52] hover:underline">0987 654 321</a>
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#a67c52] flex items-center justify-center flex-shrink-0">
                  <i className="ri-mail-line text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                  <p className="text-gray-600">
                    <a href="mailto:contact@woodenfurniture.vn" className="text-[#a67c52] hover:underline">
                      noithatkhoivan@gmail.com
                    </a><br />
                    <a href="mailto:support@woodenfurniture.vn" className="text-[#a67c52] hover:underline">
                      noithatkhoivansupport@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#a67c52] flex items-center justify-center flex-shrink-0">
                  <i className="ri-time-line text-white text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Giờ Làm Việc</h3>
                  <p className="text-gray-600">
                    Thứ 2 - Thứ 6: 6:30 - 17:30<br />
                    Thứ 7: 8:00 - 17:30<br />
                    Chủ Nhật: 8:00 - 17:30
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-gray-900 mb-4">Kết Nối Với Chúng Tôi</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <i className="ri-facebook-fill text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white hover:bg-pink-700 transition-colors">
                  <i className="ri-instagram-fill text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white hover:bg-red-700 transition-colors">
                  <i className="ri-youtube-fill text-xl"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                  <i className="ri-twitter-fill text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Gửi Tin Nhắn</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và Tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent transition-all"
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent transition-all"
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Số Điện Thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent transition-all"
                      placeholder="0123 456 789"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Chủ Đề
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent transition-all"
                      placeholder="Tư vấn sản phẩm"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Nội Dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent transition-all resize-none"
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    required
                  ></textarea>
                  <p className="mt-2 text-sm text-gray-500">
                    {formData.message.length}/500 ký tự
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#a67c52] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#8b653d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill"></i>
                      Gửi Tin Nhắn
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Map */}
            <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-96 bg-gray-200 relative">
                <iframe
                  src="https://www.google.com/maps?q=V8X2+923,+Đô+Lương,+Nghệ+An,+Vietnam&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
