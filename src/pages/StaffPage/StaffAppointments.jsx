import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';
import AppointmentService from '../../services/appointmentService'; 

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function StaffAppointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('upcoming');

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalAppointments: 0
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        let apiUrl = `${API_BASE}/staff/receptionist/appointments?page=${currentPage}&limit=10`;
        if (activeFilter !== 'upcoming') {
          apiUrl += `&status=${activeFilter}`;
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
  }, [user, activeFilter, currentPage]);
  
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
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

      // Tải lại dữ liệu ở trang hiện tại để cập nhật danh sách
      // Thay vì chỉ filter ở client, gọi lại API sẽ chính xác hơn khi có phân trang
      const fetchCurrentPage = async () => {
        let apiUrl = `${API_BASE}/staff/receptionist/appointments?page=${currentPage}&limit=10`;
        if (activeFilter !== 'upcoming') {
          apiUrl += `&status=${activeFilter}`;
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

  const handleReschedule = async (appointmentId) => {
    if (!window.confirm('Bạn có muốn tạo link để bệnh nhân tự đổi lịch hẹn này không?')) {
      return;
    }

    try {
      const response = await AppointmentService.generateRescheduleLink(appointmentId);
      
      if (response.success && response.token) {
        const rescheduleUrl = `${window.location.origin}/reschedule?token=${response.token}`;
        
        window.prompt(
          "Tạo link thành công! Hãy sao chép và gửi link này cho bệnh nhân:", 
          rescheduleUrl
        );
      }
    } catch (err) {
      alert(`Lỗi khi tạo link: ${err.message}`);
    }
  };

  return (
    <div className="container" style={{ padding: 24 }}>
      <h2 className="mb-3">Danh sách lịch hẹn</h2>
      
      <div className="mb-3">
        <button 
          className={`btn ${activeFilter === 'upcoming' ? 'btn-primary' : 'btn-outline-primary'} me-2`}
          onClick={() => handleFilterChange('upcoming')}>
          Lịch hẹn sắp tới
        </button>
        <button 
          className={`btn ${activeFilter === 'checked-in' ? 'btn-success' : 'btn-outline-success'} me-2`}
          onClick={() => handleFilterChange('checked-in')}>
          Đã Check-in
        </button>
        <button 
          className={`btn ${activeFilter === 'no-show' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => handleFilterChange('no-show')}>
          Vắng mặt
        </button>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <>
          <div className="table-responsive">
            <table className="table table-striped">
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
                      {/* === BẮT ĐẦU PHẦN SỬA LỖI - KHÔI PHỤC NÚT BẤM === */}
                      {activeFilter === 'upcoming' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm me-2" 
                            onClick={() => handleCheckIn(a._id)}>
                            Check-in
                          </button>
                          
                          {a.status === 'confirmed' && (
                             <button 
                                className="btn btn-info btn-sm"
                                onClick={() => handleReschedule(a._id)}>
                                Đổi lịch
                             </button>
                          )}
                        </>
                      )}
                      
                      {activeFilter === 'checked-in' && (
                         <span className="badge bg-success">Đã Check-in</span>
                      )}
                      {activeFilter === 'no-show' && (
                         <span className="badge bg-warning text-dark">Vắng mặt</span>
                      )}
                      {/* === KẾT THÚC PHẦN SỬA LỖI === */}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="text-center">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {paginationInfo && paginationInfo.totalPages > 1 && (
            <nav className="d-flex justify-content-end mt-3">
              <ul className="pagination">
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