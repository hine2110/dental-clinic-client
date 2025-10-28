// File: src/components/PatientAppointmentList.jsx
// ĐÃ SỬA: Bổ sung logic cho các hàm renderStatusBadge và Reschedule

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './PatientAppointmentList.css';
import RescheduleWarningModal from './RescheduleWarningModal'; 

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

function PatientAppointmentList({ initialLimit, incrementBy = 5 }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  const [displayCount, setDisplayCount] = useState(initialLimit);

  // Fetch appointments effect (Giữ nguyên)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('You need to be logged in to view appointments.');
        }
        const response = await fetch(`${API_BASE}/patient/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load appointment history.');
        }
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

  // === SỬA LỖI 1: BỔ SUNG LOGIC CHO CÁC HÀM RESCHEDULE ===

  // Hàm này gọi API để tạo link đổi lịch
  const handleReschedule = async () => {
    if (!selectedAppointmentId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/patient/appointments/${selectedAppointmentId}/generate-reschedule-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error generating reschedule link.');
      }

      // Chuyển hướng người dùng đến trang đổi lịch
      navigate(`/reschedule?token=${data.token}`);

    } catch (err) {
      alert(`Error: ${err.message}`); 
    } finally {
      handleCloseWarningModal(); // Đóng modal
    }
  };

  // Hàm này mở modal và lưu ID cuộc hẹn
  const handleOpenWarningModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsWarningModalOpen(true);
  };

  // Hàm này đóng modal và xóa ID
  const handleCloseWarningModal = () => {
    setSelectedAppointmentId(null);
    setIsWarningModalOpen(false);
  };
  
  // Hàm này được modal gọi khi bấm "Confirm"
  const handleConfirmReschedule = () => {
    handleReschedule(); // Gọi hàm xử lý chính
  };
  
  // === SỬA LỖI 2: BỔ SUNG LOGIC CHO HÀM STATUS ===
  const renderStatusBadge = (status) => {
    if (!status) return null;

    let className = 'status-badge';
    let text = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '); 

    switch (status.toLowerCase()) {
      case 'confirmed':
        className += ' confirmed';
        text = 'Confirmed';
        break;
      case 'pending':
        className += ' pending';
        text = 'Pending';
        break;
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


  // === HANDLERS CHO VIỆC XEM THÊM / THU GỌN (Giữ nguyên) ===
  const handleViewMore = () => {
    setDisplayCount(prevCount => 
      Math.min(prevCount + incrementBy, appointments.length)
    );
  };
  const handleCollapse = () => {
    setDisplayCount(initialLimit);
  };
  // === KẾT THÚC HANDLERS ===

  const totalAppointments = appointments.length;

  const displayedAppointments = initialLimit
    ? appointments.slice(0, displayCount)
    : appointments;

  const showPaginationButtons = initialLimit && totalAppointments > initialLimit;
  const allItemsShown = displayCount >= totalAppointments;
  const isExpanded = displayCount > initialLimit;


  return (
    <div className="appointment-list-container">
      {/* Loading, error, empty state rendering (Giữ nguyên) */}
      {loading && ( <p className="loading-text">Loading...</p> )}
      {error && ( <div className="appointment-list-error">{error}</div> )}
      {!loading && !error && totalAppointments === 0 && (
        <p className="empty-text">You don't have any appointments yet.</p>
      )}

      {/* Render appointment list (Giữ nguyên) */}
      {!loading && !error && totalAppointments > 0 && (
        <div className="appointment-list">
          {displayedAppointments.map(apt => (
            <div key={apt._id} className="appointment-card">
              <div className="appointment-info">
                <h4>{formatDate(apt.appointmentDate)}</h4>
                <p><strong>Time:</strong> {apt.startTime}</p>
                <p><strong>Doctor:</strong> {apt.doctor?.user?.fullName || 'N/A'}</p>
                <p><strong>Location:</strong> {apt.location?.name || 'N/A'}</p>
                {/* DÒNG NÀY SẼ HIỂN THỊ ĐÚNG SAU KHI SỬA */}
                <p><strong>Status:</strong> {renderStatusBadge(apt.status)}</p>
              </div>
              <div className="appointment-actions">
                {/* NÚT NÀY SẼ HOẠT ĐỘNG ĐÚNG SAU KHI SỬA */}
                {apt.status === 'confirmed' && !apt.hasBeenRescheduled && (
                  <button onClick={() => handleOpenWarningModal(apt._id)} className="btn-reschedule">
                    Reschedule
                  </button>
                )}
                {apt.status === 'confirmed' && apt.hasBeenRescheduled && (
                  <span className="rescheduled-text">Rescheduled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logic hiển thị nút "Xem thêm" và "Thu gọn" (Giữ nguyên) */}
      {showPaginationButtons && (
        <div className="toggle-view-container">
          
          {isExpanded && (
            <button onClick={handleCollapse} className="btn-toggle-view btn-collapse">
              Show less
            </button>
          )}

          {!allItemsShown && (
            <button onClick={handleViewMore} className="btn-toggle-view">
              Show more {incrementBy} items
            </button>
          )}

        </div>
      )}

      {/* Modal (Giữ nguyên) */}
      <RescheduleWarningModal
        isOpen={isWarningModalOpen}
        onClose={handleCloseWarningModal}
        onConfirm={handleConfirmReschedule}
      />
    </div>
  );
}

export default PatientAppointmentList;