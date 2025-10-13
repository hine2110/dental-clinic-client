import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function StaffAppointments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/staff/receptionist/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load appointments');
        }
        setAppointments(data.data); // Backend đã sort sẵn, không cần sort lại ở client
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'staff') fetchAppointments();
  }, [user]);

  if (!user || user.role !== 'staff') {
    return (
      <div className="container" style={{ padding: 24 }}>
        <div className="alert alert-warning">Bạn không có quyền truy cập trang này.</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 24 }}>
      <h2 className="mb-3">Danh sách lịch hẹn</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Bệnh nhân</th>
                <th>Bác sĩ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a, idx) => (
                <tr key={a._id || idx}>
                  <td>{idx + 1}</td>
                  <td>{a.appointmentDate ? new Date(a.appointmentDate).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>{a.startTime || '-'}</td>
                  
                  {/* === DÒNG NÀY ĐÃ ĐƯỢC SỬA LẠI === */}
                  <td>{a.patient?.basicInfo?.fullName || '-'}</td>
                  
                  <td>{a.doctor?.user?.fullName || '-'}</td>
                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StaffAppointments;