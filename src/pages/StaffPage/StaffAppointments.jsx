import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import './StaffAppointments.css'; 

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function StaffAppointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  
  // State cho các bộ lọc
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(''); // Định dạng YYYY-MM-DD

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalAppointments: 0
  });

  // useEffect (MỚI) để debounce (tạo độ trễ) cho thanh tìm kiếm
  // Chỉ thực hiện tìm kiếm sau khi người dùng ngừng gõ 500ms
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset về trang 1 khi thực hiện tìm kiếm mới
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // useEffect (CẬP NHẬT) để tải dữ liệu
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        
        // Xây dựng URL động
        let apiUrl = `${API_BASE}/staff/receptionist/appointments?page=${currentPage}&limit=10`;

        if (activeFilter !== 'upcoming') {
          apiUrl += `&status=${activeFilter}`;
        }
        if (debouncedSearchTerm) { // Sử dụng giá trị đã debounce
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
    };
    if (user && user.role === 'staff') {
      fetchAppointments();
    }
  // CẬP NHẬT mảng phụ thuộc: thêm debouncedSearchTerm và selectedDate
  }, [user, activeFilter, currentPage, debouncedSearchTerm, selectedDate]);
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset trang
  };

  // Handler (MỚI) cho việc thay đổi ngày
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1); // Reset trang
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

      // Tải lại dữ liệu ở trang hiện tại để cập nhật danh sách
      const fetchCurrentPage = async () => {
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
        
        const response = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
        const updatedData = await response.json();
        setAppointments(updatedData.data);
        setPaginationInfo(updatedData.pagination);
      };

      fetchCurrentPage();
      alert('Thao tác thành công!');

    } catch (e) {
      setError(e.message);
      alert(`Lỗi: ${e.message}`);
    }
  };

  const handleCheckIn = (id) => {
    updateAppointmentStatus(id, 'checked-in');
  };

  return (
    <div className="content-card">
      <h2 className="content-title">Danh sách lịch hẹn</h2>
      
      {/* THÊM MỚI: Thanh tìm kiếm và lọc ngày */}
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

      {/* Cập nhật: Giao diện nút lọc */}
      <div className="filter-controls">
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

      {loading && <div className="loading-indicator">Đang tải danh sách...</div>}
      {error && <div className="error-message">{error}</div>}
      
      {!loading && !error && (
        <>
          <div className="table-responsive">
            <table className="staff-table">
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
    </div>
  );
}

export default StaffAppointments;