// File: dental-clinic-client/src/pages/patient/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import { getPatientProfile } from '../../services/patientService';
import ProfileEditModal from '../../components/ProfileEditModal';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Lấy thông tin profile khi component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await getPatientProfile();
        if (response.success) {
          setProfile(response.data);
        } else {
          setError('Không thể tải thông tin profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Lỗi khi tải thông tin profile');
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'patient') {
      fetchProfile();
    }
  }, [user]);

  // Xử lý cập nhật profile
  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setShowEditModal(false);
  };

  // Nếu không phải patient, hiển thị thông báo
  if (user && user.role !== 'patient') {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="access-denied">
            <h2>Không có quyền truy cập</h2>
            <p>Chỉ có bệnh nhân mới có thể xem trang profile này.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Đang tải thông tin profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="error">
            <h2>Lỗi</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="no-profile">
            <h2>Chưa có thông tin profile</h2>
            <p>Bạn chưa có thông tin profile. Vui lòng tạo profile để sử dụng hệ thống.</p>
            <button onClick={() => setShowEditModal(true)} className="btn-primary">
              Tạo Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {profile.basicInfo?.fullName?.charAt(0) || user?.firstName?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="profile-info">
            <h1>{profile.basicInfo?.fullName || 'Chưa có tên'}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-status">
              <span className={`status-badge ${profile.isProfileComplete ? 'complete' : 'incomplete'}`}>
                {profile.isProfileComplete ? 'Đã hoàn thành' : 'Chưa hoàn thành'}
              </span>
            </div>
          </div>
          <div className="profile-actions">
            <button 
              onClick={() => setShowEditModal(true)} 
              className="btn-primary"
            >
              Chỉnh sửa
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Thông tin cơ bản */}
          <div className="profile-section">
            <h2>Thông tin cơ bản</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Họ và tên</label>
                <p>{profile.basicInfo?.fullName || 'Chưa có'}</p>
              </div>
              <div className="profile-field">
                <label>Ngày sinh</label>
                <p>{profile.basicInfo?.dateOfBirth ? new Date(profile.basicInfo.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa có'}</p>
              </div>
              <div className="profile-field">
                <label>Giới tính</label>
                <p>{profile.basicInfo?.gender === 'male' ? 'Nam' : profile.basicInfo?.gender === 'female' ? 'Nữ' : profile.basicInfo?.gender || 'Chưa có'}</p>
              </div>
              <div className="profile-field">
                <label>Số CCCD</label>
                <p>{profile.basicInfo?.idCard?.idNumber || 'Chưa có'}</p>
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="profile-section">
            <h2>Thông tin liên hệ</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Số điện thoại</label>
                <p>{profile.contactInfo?.phone || 'Chưa có'}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{profile.contactInfo?.email || 'Chưa có'}</p>
              </div>
              <div className="profile-field full-width">
                <label>Địa chỉ</label>
                <p>
                  {profile.contactInfo?.address ? 
                    `${profile.contactInfo.address.street || ''}, ${profile.contactInfo.address.city || ''}, ${profile.contactInfo.address.state || ''}`.trim() || 'Chưa có'
                    : 'Chưa có'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Liên hệ khẩn cấp */}
          {profile.emergencyContact?.name && (
            <div className="profile-section">
              <h2>Liên hệ khẩn cấp</h2>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Tên</label>
                  <p>{profile.emergencyContact.name}</p>
                </div>
                <div className="profile-field">
                  <label>Mối quan hệ</label>
                  <p>{profile.emergencyContact.relationship || 'Chưa có'}</p>
                </div>
                <div className="profile-field">
                  <label>Số điện thoại</label>
                  <p>{profile.emergencyContact.phone || 'Chưa có'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin y tế */}
          {(profile.medicalHistory?.length > 0 || profile.allergies?.length > 0) && (
            <div className="profile-section">
              <h2>Thông tin y tế</h2>
              
              {profile.medicalHistory?.length > 0 && (
                <div className="medical-info">
                  <h3>Lịch sử bệnh án</h3>
                  <div className="medical-list">
                    {profile.medicalHistory.map((item, index) => (
                      <div key={index} className="medical-item">
                        <strong>{item.condition}</strong>
                        {item.year && <span className="year">({item.year})</span>}
                        {item.notes && <p className="notes">{item.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.allergies?.length > 0 && (
                <div className="medical-info">
                  <h3>Dị ứng</h3>
                  <div className="allergy-list">
                    {profile.allergies.map((item, index) => (
                      <div key={index} className="allergy-item">
                        <strong>{item.allergen}</strong>
                        {item.severity && <span className="severity">({item.severity})</span>}
                        {item.reaction && <p className="reaction">{item.reaction}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Thông tin bảo hiểm */}
          {profile.insuranceInfo && (
            <div className="profile-section">
              <h2>Thông tin bảo hiểm</h2>
              <p>{profile.insuranceInfo}</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProfileEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileUpdate}
          initialData={profile}
        />
      )}
    </div>
  );
};

export default ProfilePage;
