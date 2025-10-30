// File: src/components/PatientAppointmentList.jsx
// NÂNG CẤP: Thêm đồng hồ đếm ngược và nút "Pay Now" cho 'pending-payment'

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import AppointmentService from '../services/appointmentService'; // <-- THÊM MỚI
import './PatientAppointmentList.css';
import RescheduleWarningModal from './RescheduleWarningModal'; 

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const formatDate = (dateString) => {
  // ... (giữ nguyên hàm)
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// ==========================================================
// === THÊM MỚI COMPONENT ĐỒNG HỒ ĐẾM NGƯỢC ===
// ==========================================================
const CountdownTimer = ({ createdAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Thời hạn là 15 phút (900 giây) từ lúc tạo
    const expiresAt = new Date(new Date(createdAt).getTime() + 900 * 1000);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft('Expired');
        onExpire(); // Gọi callback khi hết hạn
        return;
      }

      const minutes = Math.floor((diff / 1000) / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`);
    }, 1000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(interval);
  }, [createdAt, onExpire]);

  return (
    <span className="countdown-timer">
      {timeLeft}
    </span>
  );
};
// ==========================================================
// === KẾT THÚC COMPONENT MỚI ===
// ==========================================================


function PatientAppointmentList({ initialLimit, incrementBy = 5 }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [displayCount, setDisplayCount] = useState(initialLimit);

  // === THÊM MỚI STATE CHO THANH TOÁN LẠI ===
  const [retryLoading, setRetryLoading] = useState(null); // Lưu ID của apt đang thử
  const [expiredAppointments, setExpiredAppointments] = useState(new Set()); // Lưu ID các apt đã hết hạn

  // Fetch appointments (Giữ nguyên)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        // Sửa: Dùng AppointmentService
        const data = await AppointmentService.getPatientAppointments();
        
        const sortedData = data.data.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        setAppointments(sortedData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  // === CÁC HÀM XỬ LÝ ĐỔI LỊCH (Giữ nguyên) ===
  const handleReschedule = async () => {
    // ... (giữ nguyên hàm)
     if (!selectedAppointmentId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/patient/appointments/${selectedAppointmentId}/generate-reschedule-link`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error generating reschedule link.');
      }
      navigate(`/reschedule?token=${data.token}`);
    } catch (err) {
      alert(`Error: ${err.message}`); 
    } finally {
      handleCloseWarningModal();
    }
  };
  const handleOpenWarningModal = (appointmentId) => {
    // ... (giữ nguyên hàm)
    setSelectedAppointmentId(appointmentId);
    setIsWarningModalOpen(true);
  };
  const handleCloseWarningModal = () => {
    // ... (giữ nguyên hàm)
    setSelectedAppointmentId(null);
    setIsWarningModalOpen(false);
  };
  const handleConfirmReschedule = () => {
    // ... (giữ nguyên hàm)
    handleReschedule();
  };
  
  // === THÊM MỚI HÀM XỬ LÝ THANH TOÁN LẠI ===
  const handleRetryPayment = async (appointmentId) => {
    setRetryLoading(appointmentId); // Báo loading cho nút này
    setError(''); // Xóa lỗi cũ
    try {
      const data = await AppointmentService.retryCheckoutSession(appointmentId);
      if (data.success && data.url) {
        window.location.href = data.url; // Chuyển hướng đến trang Stripe mới
      } else {
        throw new Error(data.message || 'Failed to create retry session');
      }
    } catch (err) {
      setError(err.message); // Hiển thị lỗi (ví dụ: "Lịch hẹn đã hết hạn...")
      setRetryLoading(null);
    }
    // Không setRetryLoading(null) ở đây vì trang sẽ chuyển hướng
  };

  // Callback khi đồng hồ đếm ngược hết hạn
  const handleAppointmentExpired = (appointmentId) => {
    setExpiredAppointments(prev => new Set(prev).add(appointmentId));
  };
  // === KẾT THÚC HÀM MỚI ===

  // Sửa: Bổ sung case 'pending-payment'
  const renderStatusBadge = (status) => {
    if (!status) return null;

    let className = 'status-badge';
    let text = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '); 

    switch (status.toLowerCase()) {
      case 'confirmed':
        className += ' confirmed';
        text = 'Confirmed';
        break;
      case 'pending': // (Pending của admin)
        className += ' pending';
        text = 'Pending';
        break;
      // === THÊM MỚI CASE NÀY ===
      case 'pending-payment':
        className += ' pending-payment';
        text = 'Pending Payment';
        break;
      // === KẾT THÚC ===
      case 'completed':
        className += ' completed';
        text = 'Completed';
        break;
      case 'cancelled':
        className += ' cancelled';
        text = 'Cancelled';
        break;
      case 'checked-in':
        className += ' checked-in'; 
        text = 'Checked In';
        break;
      default:
        className += ' default';
    }
    return <span className={className}>{text}</span>;
  };

  // ... (Giữ nguyên logic xem thêm / thu gọn) ...
  const handleViewMore = () => { setDisplayCount(prevCount => Math.min(prevCount + incrementBy, appointments.length)); };
  const handleCollapse = () => { setDisplayCount(initialLimit); };
  const totalAppointments = appointments.length;
  const displayedAppointments = initialLimit ? appointments.slice(0, displayCount) : appointments;
  const showPaginationButtons = initialLimit && totalAppointments > initialLimit;
  const allItemsShown = displayCount >= totalAppointments;
  const isExpanded = displayCount > initialLimit;


  return (
    <div className="appointment-list-container">
      {loading && ( <p className="loading-text">Loading...</p> )}
      {/* Sửa: Hiển thị lỗi chung của component (nếu có) */}
      {error && !retryLoading && ( <div className="appointment-list-error">{error}</div> )}
      {!loading && !error && totalAppointments === 0 && (
        <p className="empty-text">You don't have any appointments yet.</p>
      )}

      {!loading && !error && totalAppointments > 0 && (
        <div className="appointment-list">
          {displayedAppointments.map(apt => {
            // Kiểm tra xem lịch hẹn này đã hết hạn chưa
            const isExpired = expiredAppointments.has(apt._id);
            
            return (
              <div key={apt._id} className="appointment-card">
                <div className="appointment-info">
                  <h4>{formatDate(apt.appointmentDate)}</h4>
                  <p><strong>Time:</strong> {apt.startTime}</p>
                  <p><strong>Doctor:</strong> {apt.doctor?.user?.fullName || 'N/A'}</p>
                  <p><strong>Location:</strong> {apt.location?.name || 'N/A'}</p>
                  <p><strong>Status:</strong> {renderStatusBadge(apt.status)}</p>
                </div>

                {/* === CẬP NHẬT LOGIC HIỂN THỊ NÚT === */}
                <div className="appointment-actions">
                  
                  {/* --- Luồng 1: Đã xác nhận (Giữ nguyên) --- */}
                  {apt.status === 'confirmed' && !apt.hasBeenRescheduled && (
                    <button onClick={() => handleOpenWarningModal(apt._id)} className="btn-reschedule">
                      Reschedule
                    </button>
                  )}
                  {apt.status === 'confirmed' && apt.hasBeenRescheduled && (
                    <span className="rescheduled-text">Rescheduled</span>
                  )}

                  {/* --- Luồng 2: Chờ thanh toán (Mới) --- */}
                  {apt.status === 'pending-payment' && (
                    <div className="pending-payment-actions">
                      <div className="timer-wrapper">
                        <i className="bi bi-clock-history"></i>
                        {isExpired ? (
                          <span className="countdown-timer expired">Expired</span>
                        ) : (
                          <CountdownTimer 
                            createdAt={apt.createdAt} 
                            onExpire={() => handleAppointmentExpired(apt._id)} 
                          />
                        )}
                      </div>
                      {/* Hiển thị lỗi của riêng nút này (nếu có) */}
                      {retryLoading === apt._id && error && (
                         <div className="retry-error">{error}</div>
                      )}
                      <button 
                        onClick={() => handleRetryPayment(apt._id)} 
                        className="btn-pay-now"
                        disabled={retryLoading === apt._id || isExpired}
                      >
                        {retryLoading === apt._id ? 'Processing...' : 'Pay Now'}
                      </button>
                    </div>
                  )}

                </div>
                {/* === KẾT THÚC CẬP NHẬT NÚT === */}
              </div>
            );
          })}
        </div>
      )}

      {/* ... (Giữ nguyên logic nút "Show more" / "Show less") ... */}
      {showPaginationButtons && (
        <div className="toggle-view-container">
          {isExpanded && ( <button onClick={handleCollapse} className="btn-toggle-view btn-collapse">Show less</button> )}
          {!allItemsShown && ( <button onClick={handleViewMore} className="btn-toggle-view">Show more {incrementBy} items</button> )}
        </div>
      )}

      <RescheduleWarningModal
        isOpen={isWarningModalOpen}
        onClose={handleCloseWarningModal}
        onConfirm={handleConfirmReschedule}
      />
    </div>
  );
}

export default PatientAppointmentList;