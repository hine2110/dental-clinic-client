// src/pages/staff/StaffAppointments.jsx (ĐÃ CẬP NHẬT)

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import './StaffAppointments.css'; 
import WalkInModal from '../../components/staff/WalkInModal';
import Toast from '../../components/common/Toast'; // <-- BƯỚC 1: IMPORT TOAST

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function StaffAppointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); 
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalAppointments: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===== BƯỚC 2: THÊM STATE CHO TOAST =====
  const [toast, setToast] = useState(null); // null hoặc { message: '', type: 'success' | 'error' }
  // ======================================

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      let apiUrl = `${API_BASE}/staff/receptionist/appointments?page=${currentPage}&limit=10`;

      if (activeFilter !== 'upcoming') {
        apiUrl += `&status=${activeFilter}`;
      }
      if (debouncedSearchTerm) { 
        apiUrl += `&search=${debouncedSearchTerm}`;
      }
      if (selectedDate) {
        apiUrl += `&date=${selectedDate}`;
      }

      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load appointments');
      }
      setAppointments(data.data);
      setPaginationInfo(data.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, activeFilter, currentPage, debouncedSearchTerm, selectedDate]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); 
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (user && user.role === 'staff') {
      fetchAppointments();
    }
  }, [user, fetchAppointments]);
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); 
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1); 
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/staff/receptionist/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Cập nhật thất bại');
      }

      fetchAppointments(); 
      // ===== BƯỚC 3: THAY THẾ ALERT BẰNG SETTOAST =====
      setToast({ message: 'Thao tác thành công!', type: 'success' });
      // alert('Thao tác thành công!'); // <-- XÓA DÒNG NÀY

    } catch (e) {
      setError(e.message);
      // ===== BƯỚC 3: THAY THẾ ALERT BẰNG SETTOAST =====
      setToast({ message: `Lỗi: ${e.message}`, type: 'error' });
      // alert(`Lỗi: ${e.message}`); // <-- XÓA DÒNG NÀY
    }
  };

  const handleCheckIn = (id) => {
    updateAppointmentStatus(id, 'checked-in');
  };

  return (
    <div className="content-card">
      {/* ===== BƯỚC 4: RENDER TOAST ===== */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* ================================ */}

      <h2 className="content-title">Danh sách lịch hẹn</h2>
      
      {/* ... (phần input search và date giữ nguyên) ... */}
      <div className="search-date-controls">
        <input
          type="text"
          placeholder="Tìm theo tên bệnh nhân..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="date"
          className="date-input"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>

      {/* ... (phần filter-controls giữ nguyên) ... */}
      <div className="filter-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div> 
          <button 
            className={`filter-btn ${activeFilter === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleFilterChange('upcoming')}>
            Lịch hẹn sắp tới
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'checked-in' ? 'active' : ''}`}
            onClick={() => handleFilterChange('checked-in')}>
            Đã Check-in
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'no-show' ? 'active' : ''}`}
            onClick={() => handleFilterChange('no-show')}>
            Vắng mặt
          </button>
        </div>
        
        <button 
          className="filter-btn btn-create-walkin"
          onClick={() => setIsModalOpen(true)}
        >
          <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
          Tạo Lịch Vãng Lai
        </button>
      </div>

      {loading && <div className="loading-indicator">Đang tải danh sách...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <>
          {/* ... (Phần table và pagination giữ nguyên) ... */}
          <div className="table-responsive">
            <table className="staff-table">
              {/* ... (thead) ... */}
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Bệnh nhân</th>
                  <th>Bác sĩ</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length > 0 ? appointments.map((a, idx) => (
                  <tr key={a._id || idx}>
                    <td>{(currentPage - 1) * 10 + idx + 1}</td>
                    <td>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('vi-VN') : '-'}</td>
                    <td>{a.startTime || '-'}</td>
                    <td>{a.patient?.basicInfo?.fullName || 'Không có tên'}</td>
                    <td>{a.doctor?.user?.fullName || '-'}</td>
                    <td>
                      {activeFilter === 'upcoming' && (
                        <button 
                          className="btn-action btn-checkin" 
                          onClick={() => handleCheckIn(a._id)}>
                          Check-in
                        </button>
                      )}
                      
                      {activeFilter === 'checked-in' && (
                         <span className="status-badge status-checked-in">Đã Check-in</span>
                      )}
                      {activeFilter === 'no-show' && (
                         <span className="status-badge status-no-show">Vắng mặt</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ... (pagination) ... */}
          {paginationInfo && paginationInfo.totalPages > 1 && (
            <nav className="pagination-nav">
              <ul className="pagination-list">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                    Trang trước
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    Trang {currentPage} / {paginationInfo.totalPages}
                  </span>
                </li>
                <li className={`page-item ${currentPage === paginationInfo.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                    Trang sau
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* ===== BƯỚC 5: CẬP NHẬT PROP ONSUCCESS ===== */}
      {isModalOpen && (
        <WalkInModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={(message) => { // <-- Nhận message từ modal
            setIsModalOpen(false); 
            fetchAppointments();    
            setToast({ message: message, type: 'success' }); // <-- Kích hoạt toast
          }}
        />
      )}
    </div>
  );
}

export default StaffAppointments;