// src/pages/patient/PaymentStatusPage.jsx

import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

function PaymentStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const paymentStatus = searchParams.get('status');
    setStatus(paymentStatus);

    if (paymentStatus === 'success') {
      setMessage('Đặt cọc và đặt lịch thành công! Chúng tôi sẽ sớm liên hệ với bạn.');

      const timer = setTimeout(() => {
        navigate('/'); // Chuyển về trang chủ
      }, 3000);
      return () => clearTimeout(timer);

    } else {
      const errorMessage = searchParams.get('message');
      if (errorMessage === 'Invalid_signature') {
        setMessage('Thanh toán thất bại: Chữ ký không hợp lệ. Vui lòng thử lại.');
      } else {
        setMessage('Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ với chúng tôi.');
      }
    }
  }, [searchParams,  navigate]);

  return (
    <div className="container" style={{ paddingTop: '120px', paddingBottom: '120px', textAlign: 'center' }}>
      {status === 'success' ? (
        <div className="alert alert-success">
          <h2>Thanh toán thành công! ✅</h2>
          <p>{message}</p>
        </div>
      ) : (
        <div className="alert alert-danger">
          <h2>Thanh toán thất bại! ❌</h2>
          <p>{message}</p>
        </div>
      )}
      <Link to="/" className="btn btn-primary mt-4">
        Quay về trang chủ
      </Link>
    </div>
  );
}

export default PaymentStatusPage;