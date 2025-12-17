import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchBlogBySlug, toggleBlogLike, clearCurrentBlog } from '../../redux/features/blogs/blogsSlice';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentBlog, loading } = useSelector((state) => state.blogs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBlogBySlug(slug));

    return () => {
      dispatch(clearCurrentBlog());
    };
  }, [dispatch, slug]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thích bài viết');
      navigate('/login');
      return;
    }

    try {
      await dispatch(toggleBlogLike(currentBlog._id)).unwrap();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const isLiked = currentBlog?.likes?.includes(user?._id);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <i className="ri-article-line text-6xl text-gray-300 mb-4"></i>
        <p className="text-gray-500 text-lg mb-4">Không tìm thấy bài viết</p>
        <Link to="/blogs" className="text-[#a67c52] hover:underline">
          ← Quay lại danh sách blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-[#a67c52]">Trang chủ</Link>
            </li>
            <li><i className="ri-arrow-right-s-line"></i></li>
            <li>
              <Link to="/blogs" className="hover:text-[#a67c52]">Blog</Link>
            </li>
            <li><i className="ri-arrow-right-s-line"></i></li>
            <li className="text-gray-900 font-medium truncate">{currentBlog.title}</li>
          </ol>
        </nav>

        {/* Blog Content */}
        <article className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Cover Image */}
          <div className="relative h-96 overflow-hidden">
            <img
              src={currentBlog.coverImage}
              alt={currentBlog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-[#a67c52] text-white text-sm rounded-full">
                {currentBlog.category}
              </span>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              {currentBlog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img
                  src={currentBlog.author?.avatar || '/user.png'}
                  alt={currentBlog.author?.fullName}
                  className="w-12 h-12 rounded-full"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/user.png';
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900">{currentBlog.author?.fullName}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(currentBlog.publishedAt), {
                      addSuffix: true,
                      locale: vi
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <i className="ri-eye-line"></i>
                  {currentBlog.views} lượt xem
                </span>
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-500'
                    }`}
                >
                  <i className={isLiked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                  {currentBlog.likes?.length || 0}
                </button>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-gray-50 border-l-4 border-[#a67c52] p-6 mb-8 rounded-r-lg">
              <p className="text-lg text-gray-700 italic">
                {currentBlog.excerpt}
              </p>
            </div>

            {/* Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: currentBlog.content }}
            />

            {/* Tags */}
            {currentBlog.tags && currentBlog.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {currentBlog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Chia sẻ:</h3>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <i className="ri-facebook-fill"></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center hover:bg-blue-500 transition-colors">
                  <i className="ri-twitter-fill"></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center hover:bg-green-700 transition-colors">
                  <i className="ri-whatsapp-fill"></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-600 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <i className="ri-link"></i>
                </button>
              </div>
            </div>
          </div>
        </article>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#a67c52] text-white rounded-lg hover:bg-[#8b653d] transition-colors"
          >
            <i className="ri-arrow-left-line"></i>
            Quay lại danh sách blog
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;
