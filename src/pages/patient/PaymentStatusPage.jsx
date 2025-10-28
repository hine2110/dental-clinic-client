// src/pages/patient/PaymentStatusPage.jsx
// (ĐÃ CẬP NHẬT GIAO DIỆN)

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import './PaymentStatusPage.css'; // <-- 1. IMPORT FILE CSS MỚI

function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true); // Thêm state loading

  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    const errorCode = searchParams.get('vnp_ResponseCode') || searchParams.get('code'); // Lấy mã lỗi VNPAY nếu có

    setStatus(paymentStatus);
    setIsLoading(false); // Đánh dấu đã tải xong

    if (paymentStatus === 'success') {
      setMessage('Đặt cọc và đặt lịch thành công! Chi tiết lịch hẹn sẽ được gửi qua email của bạn.');

      const timer = setTimeout(() => {
        navigate('/'); // Chuyển về trang chủ sau 5 giây
      }, 5000); // Tăng thời gian chờ lên 5 giây
      return () => clearTimeout(timer);

    } else {
      // Xử lý thông báo lỗi cụ thể hơn (ví dụ cho VNPAY)
      let detailedMessage = 'Thanh toán thất bại.';
      if (errorCode === '24') {
        detailedMessage = 'Giao dịch không thành công do: Khách hàng hủy giao dịch.';
      } else if (errorCode === '11') {
          detailedMessage = 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Vui lòng thử lại.';
      } else if (searchParams.get('message') === 'Invalid_signature') {
        detailedMessage = 'Thanh toán thất bại: Chữ ký không hợp lệ. Vui lòng thử lại.';
      }
       else {
        detailedMessage += ' Vui lòng thử lại hoặc liên hệ phòng khám để được hỗ trợ.';
      }
      setMessage(detailedMessage);
    }
  }, [searchParams, navigate]);

  // Hiển thị loading nếu chưa xác định được status
  if (isLoading) {
    return (
      <div className="payment-status-container">
        <p>Đang kiểm tra trạng thái thanh toán...</p>
      </div>
    );
  }

  return (
    // 2. Sử dụng class CSS mới cho container
    <div className="payment-status-container">
      {/* 3. Thay thế alert bằng card */}
      <div className="payment-status-card">
        {status === 'success' ? (
          <>
            {/* Icon thành công */}
            <div className="status-icon success">
              <i className="fas fa-check-circle"></i>
            </div>
            <h2>Thanh toán thành công!</h2>
            <p>{message}</p>
            <p className="text-muted small">Bạn sẽ được chuyển về trang chủ sau vài giây...</p>
          </>
        ) : (
          <>
            {/* Icon thất bại */}
            <div className="status-icon failure">
              <i className="fas fa-times-circle"></i>
            </div>
            <h2>Thanh toán thất bại!</h2>
            <p>{message}</p>
          </>
        )}
        {/* Nút bấm với class mới */}
        <Link to="/" className="btn btn-primary btn-back-home mt-4">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default PaymentStatusPage;