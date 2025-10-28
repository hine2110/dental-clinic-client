// src/pages/staff/StaffInvoices.jsx
// (ĐÃ CẬP NHẬT GIAO DIỆN)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import PaymentModal from './PaymentModal'; 
import Toast from '../../components/common/Toast';
import './StaffInvoices.css'; // <-- 1. IMPORT FILE CSS MỚI

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function StaffInvoices() {
  const { user } = useAuth();
  const [paymentQueue, setPaymentQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [toast, setToast] = useState(null);

  // Hàm gọi API (giữ nguyên)
  const fetchPaymentQueue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff/receptionist/payment-queue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch payment queue');
      }
      setPaymentQueue(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPaymentQueue();
    }
  }, [user]);

  // Các hàm xử lý modal (giữ nguyên)
  const handleOpenPaymentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(false);
  };

  const handlePaymentSuccess = (toastInfo) => {
    handleClosePaymentModal();
    fetchPaymentQueue(); 
    setToast(toastInfo); 
  };

  return (
    <div className="container-fluid">
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 2. Tiêu đề trang (giữ nguyên) */}
      <h1 className="h3 mb-4">Hóa đơn & Thanh toán</h1>
      <h6 className="m-0 font-weight-bold text-primary mb-3">Hàng đợi thanh toán</h6>

      {/* 3. Thay thế Table bằng giao diện Card List */}
      <div className="payment-queue-container">
        {loading && <p>Đang tải danh sách...</p>}
        {error && <div className="alert alert-danger">{error}</div>}
        
        {!loading && !error && (
          <>
            {paymentQueue.length > 0 ? paymentQueue.map((apt) => (
              <div key={apt._id} className="payment-queue-card">
                <div className="pq-card-header">
                  <h5 className="pq-patient-name">{apt.patient?.basicInfo?.fullName || 'N/A'}</h5>
                  <span className="pq-patient-phone">{apt.patient?.contactInfo?.phone || 'N/A'}</span>
                </div>
                <div className="pq-card-body">
                  <div className="pq-info-row">
                    <i className="fas fa-user-md"></i>
                    <span>{apt.doctor?.user?.fullName || 'N/A'}</span>
                  </div>
                  <div className="pq-info-row">
                    <i className="fas fa-clock"></i>
                    <span>Hoàn thành lúc: {new Date(apt.updatedAt).toLocaleTimeString('vi-VN')}</span>
                  </div>
                </div>
                <div className="pq-card-footer">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleOpenPaymentModal(apt)}
                  >
                    Lập Hóa Đơn
                  </button>
                </div>
              </div>
            )) : (
              <div className="no-patients-message">
                <h4>Không có bệnh nhân nào</h4>
                <p>Hiện không có bệnh nhân nào đang trong hàng đợi thanh toán.</p>
              </div>
            )}
          </>
        )}
      </div>
      {/* ================================ */}


      {/* Render Modal (giữ nguyên) */}
      {isModalOpen && selectedAppointment && (
        <PaymentModal
          appointment={selectedAppointment}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default StaffInvoices;