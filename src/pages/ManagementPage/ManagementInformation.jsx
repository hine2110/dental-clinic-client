import React, { useState, useEffect, useMemo } from 'react';
import './ManagementInformation.css'; // Chúng ta sẽ tạo file CSS này ở dưới

// Component con để hiển thị thẻ thông tin
const ProfileCard = ({ person }) => {
  const { user, specializations, staffType } = person;

  // Lấy thông tin an toàn, ngay cả khi 'user' không tồn tại
  const fullName = user?.fullName || 'Không có tên';
  const email = user?.email || 'Không có email';
  const phone = user?.phone || 'Không có SĐT';
  const isActive = user ? user.isActive : false;

  // Xác định vị trí/chuyên khoa
  let roleInfo = '';
  if (specializations && specializations.length > 0) {
    roleInfo = `Chuyên khoa: ${specializations.join(', ')}`;
  } else if (staffType === 'receptionist') {
    roleInfo = 'Vị trí: Lễ tân';
  } else if (staffType === 'storeKepper') {
    roleInfo = 'Vị trí: Quản lý kho';
  }

  return (
    <div className={`profile-card ${!isActive ? 'inactive' : ''}`}>
      <div className="profile-card-header">
        <h3>{fullName}</h3>
        <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
          {isActive ? 'On' : 'Off'}
        </span>
      </div>
      <div className="profile-card-body">
        <p><strong><i className="fas fa-envelope"></i></strong> {email}</p>
        <p><strong><i className="fas fa-phone"></i></strong> {phone}</p>
        {roleInfo && <p><strong><i className="fas fa-id-badge"></i></strong> {roleInfo}</p>}
      </div>
    </div>
  );
};

// Component chính
function ManagementInformation() {
  const [doctors, setDoctors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Gọi đồng thời cả hai API
        const [doctorsRes, staffRes] = await Promise.all([
          fetch(`${API_BASE_URL}/management/doctors`, { headers }),
          fetch(`${API_BASE_URL}/management/staff`, { headers })
        ]);

        if (!doctorsRes.ok) throw new Error('Không thể tải danh sách bác sĩ');
        if (!staffRes.ok) throw new Error('Không thể tải danh sách nhân viên');

        const doctorsData = await doctorsRes.json();
        const staffData = await staffRes.json();

        setDoctors(doctorsData.data || []);
        setStaff(staffData.data || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Tách danh sách nhân viên thành 2 nhóm bằng useMemo
  const receptionists = useMemo(() => 
    staff.filter(s => s.staffType === 'receptionist'), 
  [staff]);

  const storeKeepers = useMemo(() => 
    staff.filter(s => s.staffType === 'storeKepper'), 
  [staff]);

  // Xử lý trạng thái loading và error
  if (loading) {
    return <div className="loading-container">Đang tải thông tin nhân sự...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="management-information-page">
      <h1>Thông tin nhân sự</h1>

      {/* Phần Bác Sĩ */}
      <section className="profile-section">
        <h2><i className="fas fa-user-md"></i> Bác sĩ ({doctors.length})</h2>
        <div className="profile-grid">
          {doctors.length > 0 ? (
            doctors.map(doctor => (
              <ProfileCard key={doctor._id} person={doctor} />
            ))
          ) : (
            <p>Không tìm thấy thông tin bác sĩ.</p>
          )}
        </div>
      </section>

      {/* Phần Lễ Tân */}
      <section className="profile-section">
        <h2><i className="fas fa-concierge-bell"></i> Lễ tân ({receptionists.length})</h2>
        <div className="profile-grid">
          {receptionists.length > 0 ? (
            receptionists.map(person => (
              <ProfileCard key={person._id} person={person} />
            ))
          ) : (
            <p>Không tìm thấy thông tin lễ tân.</p>
          )}
        </div>
      </section>

      {/* Phần Quản lý kho */}
      <section className="profile-section">
        <h2><i className="fas fa-boxes"></i> Quản lý kho ({storeKeepers.length})</h2>
        <div className="profile-grid">
          {storeKeepers.length > 0 ? (
            storeKeepers.map(person => (
              <ProfileCard key={person._id} person={person} />
            ))
          ) : (
            <p>Không tìm thấy thông tin quản lý kho.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ManagementInformation;