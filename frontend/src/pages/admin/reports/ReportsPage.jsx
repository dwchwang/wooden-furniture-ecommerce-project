import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    completedOrders: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Fetch all orders
      const ordersResponse = await api.get('/orders', {
        params: { limit: 1000 }
      });

      const orders = ordersResponse.data?.orders || [];

      console.log("📊 Orders Response:", ordersResponse);
      console.log("📊 Orders Data:", ordersResponse.data);
      console.log("📊 Extracted Orders:", orders);
      console.log("📊 Orders Count:", orders.length);
      if (orders.length > 0) {
        console.log("📊 Sample Order:", orders[0]);
        console.log("📊 Sample Order totalAmount:", orders[0].totalAmount);
        console.log("📊 Sample Order items:", orders[0].items);
        console.log("📊 Sample Order Keys:", Object.keys(orders[0]));
        console.log("📊 Sample Item:", orders[0].items[0]);
        console.log("📊 Sample Item Keys:", Object.keys(orders[0].items[0]));
      }

      // Calculate date range
      const now = new Date();
      const daysAgo = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
      const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Filter orders by date range
      const filteredOrders = orders.filter(order =>
        new Date(order.createdAt) >= startDate
      );

      console.log("📊 Filtered Orders:", filteredOrders);
      console.log("📊 Filtered Count:", filteredOrders.length);

      // Calculate stats
      const completedOrders = filteredOrders.filter(o => o.orderStatus === 'delivered');
      const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = filteredOrders.length;
      const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

      console.log("💰 Total Revenue:", totalRevenue);
      console.log("💰 Average Order Value:", averageOrderValue);

      setStats({
        totalRevenue,
        totalOrders,
        averageOrderValue,
        completedOrders: completedOrders.length
      });

      // Generate revenue chart data (daily)
      const revenueByDate = {};
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
        revenueByDate[date] = (revenueByDate[date] || 0) + (order.total || 0);
      });

      console.log('Revenue by Date:', revenueByDate);

      const revenueChartData = Object.entries(revenueByDate)
        .map(([date, revenue]) => ({ date, revenue }))
        .slice(-14); // Last 14 days

      console.log('Revenue Chart Data:', revenueChartData);
      setRevenueData(revenueChartData);

      // Category revenue data
      const categoryRevenue = {};
      filteredOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
        if (order.items && order.items[0]) {
          console.log("📦 Sample Product:", order.items[0].product);
          console.log("📦 Product Category:", order.items[0].product?.category);
        }
            const category = item.product?.category?.name || 'Khác';
            categoryRevenue[category] = (categoryRevenue[category] || 0) + ((item.price * item.quantity) || 0);
          });
        }
      });

      console.log('Category Revenue:', categoryRevenue);

      const categoryChartData = Object.entries(categoryRevenue)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      console.log('Category Chart Data:', categoryChartData);
      setCategoryData(categoryChartData);

      // Top products
      const productSales = {};
      filteredOrders.forEach(order => {
        order.items.forEach(item => {
          const productName = item.product?.name || 'Unknown';
          if (!productSales[productName]) {
            productSales[productName] = {
              name: productName,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productName].quantity += item.quantity;
          productSales[productName].revenue += (item.price * item.quantity);
        });
      });

      const topProductsData = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setTopProducts(topProductsData);

      // Order status distribution
      const statusCount = {};
      filteredOrders.forEach(order => {
        const status = order.orderStatus;
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      const statusLabels = {
        pending: 'Chờ xử lý',
        confirmed: 'Đã xác nhận',
        processing: 'Đang xử lý',
        shipping: 'Đang giao',
        delivered: 'Đã giao',
        cancelled: 'Đã hủy'
      };

      const statusChartData = Object.entries(statusCount).map(([status, count]) => ({
        name: statusLabels[status] || status,
        value: count
      }));

      setOrderStatusData(statusChartData);

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Lỗi khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#a67c52', '#8b653d', '#6b4e3d', '#d4a574', '#e8c9a0'];
  const STATUS_COLORS = {
    'Chờ xử lý': '#fbbf24',
    'Đã xác nhận': '#60a5fa',
    'Đang xử lý': '#a78bfa',
    'Đang giao': '#f97316',
    'Đã giao': '#34d399',
    'Đã hủy': '#ef4444'
  };

  const formatCurrency = (value) => {
    if (!value || value === 0) return '0';
    if (value < 1000) return `${value.toLocaleString('vi-VN')}đ`;
    if (value < 1000000) return `${(value / 1000).toFixed(1)}K`;
    return `${(value / 1000000).toFixed(1)}M`;
  };

  const formatFullCurrency = (value) => {
    if (!value || value === 0) return '0đ';
    return `${value.toLocaleString('vi-VN')}đ`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo Doanh thu</h1>
          <p className="text-gray-600 mt-1">Phân tích và thống kê kinh doanh</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#a67c52] focus:border-transparent"
        >
          <option value="7days">7 ngày qua</option>
          <option value="30days">30 ngày qua</option>
          <option value="90days">90 ngày qua</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <i className="ri-loader-4-line animate-spin text-4xl text-[#a67c52]"></i>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Tổng doanh thu</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.totalRevenue)}</p>
                  <p className="text-xs text-green-100 mt-1">{formatFullCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-3xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tổng đơn hàng</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                  <p className="text-xs text-blue-100 mt-1">Tất cả trạng thái</p>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i className="ri-shopping-cart-line text-3xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Giá trị TB/Đơn</p>
                  <p className="text-3xl font-bold mt-2">{formatCurrency(stats.averageOrderValue)}</p>
                  <p className="text-xs text-purple-100 mt-1">{formatFullCurrency(stats.averageOrderValue)}</p>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i className="ri-line-chart-line text-3xl"></i>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Đơn hoàn thành</p>
                  <p className="text-3xl font-bold mt-2">{stats.completedOrders}</p>
                  <p className="text-xs text-orange-100 mt-1">Đã giao hàng</p>
                </div>
                <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <i className="ri-checkbox-circle-line text-3xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Trend */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-line-chart-line text-[#a67c52]"></i>
                Xu hướng doanh thu (14 ngày gần nhất)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatFullCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#a67c52"
                    strokeWidth={3}
                    name="Doanh thu"
                    dot={{ fill: '#a67c52', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-pie-chart-line text-[#a67c52]"></i>
                Phân bố trạng thái đơn hàng
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Category Revenue */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-bar-chart-line text-[#a67c52]"></i>
                Doanh thu theo danh mục (Top 5)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatFullCurrency(value)} />
                  <Legend />
                  <Bar dataKey="value" fill="#a67c52" name="Doanh thu" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="ri-trophy-line text-[#a67c52]"></i>
                Sản phẩm bán chạy (Top 5)
              </h2>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                          'bg-[#a67c52]'
                      }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-sm text-gray-500">Đã bán: {product.quantity} sản phẩm</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#a67c52]">{formatCurrency(product.revenue)}</p>
                      <p className="text-xs text-gray-500">{formatFullCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
