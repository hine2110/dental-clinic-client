
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { getPatientProfile } from '../../services/patientService';
import ProfileEditModal from '../../components/ProfileEditModal';
import './ProfilePage.css';
import PatientAppointmentList from '../../components/PatientAppointmentList';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        setError('Bạn cần đăng nhập để xem thông tin cá nhân.');
        return;
      }
      try {
        setLoading(true);
        setError('');
        const response = await getPatientProfile(); 
        if (response && response.success) {
          setProfile(response.data || null); 
        } else {
          throw new Error(response.message || 'Không thể tải dữ liệu profile.');
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin cá nhân:", err);
        const errorMessage = (err.response && err.response.data && err.response.data.message) 
                             || err.message 
                             || 'Lỗi khi tải thông tin cá nhân.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Hàm này được gọi khi modal 'onSave' thành công
  const handleProfileUpdate = (updatedProfileData) => {
    setProfile(updatedProfileData); // Cập nhật state với dữ liệu mới
    setShowEditModal(false); // Đóng modal
  };

  if (!user) {
    return (
      <div className="profile-page access-denied">
        <p>Vui lòng đăng nhập để xem trang này.</p>
      </div>
    );
  }

  if (loading) {
    return <p className="loading-message">Đang tải thông tin cá nhân...</p>;
  }

  if (error) {
    return <div className="alert alert-danger error-message">{error}</div>;
  }

  // Nếu profile là null (người dùng mới, chưa tạo)
  if (!profile) {
    return (
      <div className="profile-page no-profile">
        <p>Bạn chưa có thông tin hồ sơ. Hãy cập nhật hồ sơ của bạn.</p>
        <button onClick={() => setShowEditModal(true)} className="btn btn-primary">
          Tạo hồ sơ
        </button>
        {showEditModal && (
          <ProfileEditModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            initialData={null}
            onSave={handleProfileUpdate} 
          />
        )}
      </div>
    );
  }

  // Nếu profile đã tồn tại
  return (
    <div className="profile-page">
      <div className="back-to-home-container">
        <Link to="/" className="btn-back-to-home">
          &larr; Back to Home
        </Link>
      </div>
      <div className="profile-container">
        {/* Header (Giữ nguyên) */}
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-letter">
              {profile.basicInfo?.fullName ? profile.basicInfo.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="profile-info">
            <h3>{profile.basicInfo?.fullName || 'Tên bệnh nhân'}</h3>
            <p className="profile-email">{user.email}</p>
            <span className={`profile-status ${profile.isProfileComplete ? 'completed' : 'incomplete'}`}>
              {profile.isProfileComplete ? 'completed' : 'incomplete'}
            </span>
          </div>
          <button onClick={() => setShowEditModal(true)} className="btn btn-edit">
            Edit
          </button>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Basic Information (Giữ nguyên) */}
          <div className="profile-section">
            <h2>Basic Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Full Name</strong>
                <span>{profile.basicInfo?.fullName || '-'}</span>
              </div>
              <div className="info-item">
                <strong>Date of Birth</strong>
                <span>{profile.basicInfo?.dateOfBirth ? new Date(profile.basicInfo.dateOfBirth).toLocaleDateString('vi-VN') : '-'}</span>
              </div>
              <div className="info-item">
                <strong>Gender</strong>
                <span>{profile.basicInfo?.gender || '-'}</span>
              </div>
              <div className="info-item">
                <strong>ID Number</strong>
                <span>{profile.basicInfo?.idCard?.idNumber || '-'}</span>
              </div>
            </div>
          </div>

          {/* Contact Information (Giữ nguyên) */}
          <div className="profile-section">
            <h2>Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>Phone Number</strong>
                <span>{profile.contactInfo?.phone || '-'}</span>
              </div>
              <div className="info-item">
                <strong>Email</strong>
                <span>{profile.contactInfo?.email || user.email || '-'}</span>
              </div>
              <div className="info-item full-width">
                <strong>Address</strong>
                <span>
                  {(() => {
                    // Gom các phần của địa chỉ lại
                    const address = profile.contactInfo?.address;
                    if (!address) return '-'; // Nếu không có object address

                    const parts = [];
                    // 1. Thêm Số nhà, Đường
                    if (address.street) parts.push(address.street);
                    // 2. Thêm Phường (đang lưu trong zipCode)
                    if (address.zipCode) parts.push(address.zipCode);
                    // 3. Thêm Quận (đang lưu trong state)
                    if (address.state) parts.push(address.state);
                    // 4. Thêm Thành phố
                    if (address.city) parts.push(address.city);

                    // Nối tất cả lại bằng dấu phẩy
                    return parts.length > 0 ? parts.join(', ') : '-';
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* === BẮT ĐẦU PHẦN CODE BỊ THIẾU === */}
          
          {/* Emergency Contact (Chỉ hiển thị nếu có tên) */}
          {profile.emergencyContact?.name && (
            <div className="profile-section">
              <h2>Emergency Contact</h2>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Name</strong>
                  <span>{profile.emergencyContact.name}</span>
                </div>
                <div className="info-item">
                  <strong>Relationship</strong>
                  <span>{profile.emergencyContact.relationship}</span>
                </div>
                <div className="info-item">
                  <strong>Phone Number</strong>
                  <span>{profile.emergencyContact.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* Medical Information (Chỉ hiển thị nếu có 1 trong 2) */}
          {(profile.medicalHistory?.length > 0 || profile.allergies?.length > 0) && (
            <div className="profile-section">
              <h2>Medical Information</h2>
              <div className="info-grid">
                {/* Controller của bạn lưu medicalHistory/allergies dạng array,
                  nên chúng ta cần đọc nó từ array 
                */}
                {profile.medicalHistory?.length > 0 && (
                  <div className="info-item full-width">
                    <strong>Medical History</strong>
                    <span>{profile.medicalHistory.map(item => item.condition).join(', ')}</span>
                  </div>
                )}
                {profile.allergies?.length > 0 && (
                  <div className="info-item full-width">
                    <strong>Allergies</strong>
                    <span>{profile.allergies.map(item => item.allergen).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Lịch sử cuộc hẹn */}
          <div className="profile-section">
            <h2>My Appointments</h2>
            <PatientAppointmentList initialLimit={3} incrementBy={5} />
          </div>
          
        </div>
      </div>

      {/* Modal Edit (Giữ nguyên) */}
      {showEditModal && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          initialData={profile} 
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default ProfilePage;