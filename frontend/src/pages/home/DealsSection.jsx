import React, { useEffect, useState } from 'react';
import dealsImg from "../../assets/deals-img.jpg";
import api from '../../services/api';

const DealsSection = () => {
  const [voucher, setVoucher] = useState(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    mins: 0,
    secs: 0
  });

  useEffect(() => {
    fetchBestVoucher();
  }, []);

  useEffect(() => {
    if (!voucher) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(voucher.endDate).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [voucher]);

  const fetchBestVoucher = async () => {
    try {
      const response = await api.get('/vouchers/active');
      const vouchers = response.data?.vouchers || [];

      if (vouchers.length === 0) return;

      // Get current month's vouchers
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthVouchers = vouchers.filter(v => {
        const startDate = new Date(v.startDate);
        const endDate = new Date(v.endDate);
        return (
          (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
          (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear) ||
          (startDate <= now && endDate >= now)
        );
      });

      if (monthVouchers.length === 0) return;

      // Get voucher with highest percentage discount
      const bestVoucher = monthVouchers.reduce((best, current) => {
        if (current.discountType !== 'percentage') return best;
        if (!best) return current;
        return current.discountValue > best.discountValue ? current : best;
      }, null);

      setVoucher(bestVoucher || monthVouchers[0]);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  if (!voucher) {
    return null;
  }

  const getDiscountText = () => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}%`;
    }
    return `${voucher.discountValue.toLocaleString('vi-VN')}đ`;
  };

  return (
    <section className='section__container deals__container'>
      <div className='deals__image'>
        <img src={dealsImg} alt="Deals" />
      </div>
      <div className='deals__content'>
        {/* Discount Badge */}
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '8px 20px',
          borderRadius: '25px',
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '16px',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}>
          🎉 Giảm giá lên đến {getDiscountText()}
        </div>

        {/* Voucher Code */}
        <h4 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '2px'
        }}>
          Voucher code: {voucher.code}
        </h4>

        {/* Description */}
        <p style={{
          fontSize: '15px',
          color: '#666',
          lineHeight: '1.6',
          marginBottom: '24px'
        }}>
          {voucher.description || 'Ưu đãi đặc biệt trong tháng này. Đừng bỏ lỡ cơ hội tiết kiệm!'}
        </p>

        {/* Countdown Timer */}
        <div className='deals__countdown flex-wrap' style={{ gap: '12px' }}>
          <div className="deals__countdown__card" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px 20px',
            minWidth: '80px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            border: 'none'
          }}>
            <h4 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 4px 0',
              color: 'white'
            }}>
              {countdown.days.toString().padStart(2, '0')}
            </h4>
            <p style={{
              fontSize: '12px',
              margin: 0,
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'white'
            }}>
              Ngày
            </p>
          </div>

          <div className="deals__countdown__card" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px 20px',
            minWidth: '80px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(240, 147, 251, 0.3)',
            border: 'none'
          }}>
            <h4 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 4px 0',
              color: 'white'
            }}>
              {countdown.hours.toString().padStart(2, '0')}
            </h4>
            <p style={{
              fontSize: '12px',
              margin: 0,
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'white'
            }}>
              Giờ
            </p>
          </div>

          <div className="deals__countdown__card" style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px 20px',
            minWidth: '80px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(79, 172, 254, 0.3)',
            border: 'none'
          }}>
            <h4 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 4px 0',
              color: 'white'
            }}>
              {countdown.mins.toString().padStart(2, '0')}
            </h4>
            <p style={{
              fontSize: '12px',
              margin: 0,
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'white'
            }}>
              Phút
            </p>
          </div>

          <div className="deals__countdown__card" style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px 20px',
            minWidth: '80px',
            textAlign: 'center',
            boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)',
            border: 'none'
          }}>
            <h4 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 4px 0',
              color: 'white'
            }}>
              {countdown.secs.toString().padStart(2, '0')}
            </h4>
            <p style={{
              fontSize: '12px',
              margin: 0,
              opacity: 0.9,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'white'
            }}>
              Giây
            </p>
          </div>
        </div>

        {/* Additional Info */}
        {voucher.minOrderValue > 0 && (
          <div style={{
            marginTop: '24px',
            padding: '12px 16px',
            background: '#f8f9fa',
            borderLeft: '4px solid #667eea',
            borderRadius: '4px'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#666',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '16px' }}>ℹ️</span>
              Áp dụng cho đơn hàng từ <strong style={{ color: '#667eea' }}>
                {voucher.minOrderValue.toLocaleString('vi-VN')}đ
              </strong>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DealsSection;