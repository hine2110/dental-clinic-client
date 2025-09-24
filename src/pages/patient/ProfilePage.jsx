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
          setError('Unable to load profile information');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Error loading profile information');
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
            <h2>Access Denied</h2>
            <p>Only patients can view this profile page.</p>
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
            <p>Loading profile information...</p>
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
            <h2>Error</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
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
            <h2>No Profile Information</h2>
            <p>You don't have profile information yet. Please create a profile to use the system.</p>
            <button onClick={() => setShowEditModal(true)} className="btn-primary">
              Create Profile
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
            <h1>{profile.basicInfo?.fullName || 'No Name'}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-status">
              <span className={`status-badge ${profile.isProfileComplete ? 'complete' : 'incomplete'}`}>
                {profile.isProfileComplete ? 'Completed' : 'Incomplete'}
              </span>
            </div>
          </div>
          <div className="profile-actions">
            <button 
              onClick={() => setShowEditModal(true)} 
              className="btn-primary"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Thông tin cơ bản */}
          <div className="profile-section">
            <h2>Basic Information</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <p>{profile.basicInfo?.fullName || 'Not available'}</p>
              </div>
              <div className="profile-field">
                <label>Date of Birth</label>
                <p>{profile.basicInfo?.dateOfBirth ? new Date(profile.basicInfo.dateOfBirth).toLocaleDateString('en-US') : 'Not available'}</p>
              </div>
              <div className="profile-field">
                <label>Gender</label>
                <p>{profile.basicInfo?.gender === 'male' ? 'Male' : profile.basicInfo?.gender === 'female' ? 'Female' : profile.basicInfo?.gender || 'Not available'}</p>
              </div>
              <div className="profile-field">
                <label>ID Number</label>
                <p>{profile.basicInfo?.idCard?.idNumber || 'Not available'}</p>
              </div>
            </div>
          </div>

          {/* Thông tin liên hệ */}
          <div className="profile-section">
            <h2>Contact Information</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Phone Number</label>
                <p>{profile.contactInfo?.phone || 'Not available'}</p>
              </div>
              <div className="profile-field">
                <label>Email</label>
                <p>{profile.contactInfo?.email || 'Not available'}</p>
              </div>
              <div className="profile-field full-width">
                <label>Address</label>
                <p>
                  {profile.contactInfo?.address ? 
                    `${profile.contactInfo.address.street || ''}, ${profile.contactInfo.address.city || ''}, ${profile.contactInfo.address.state || ''}`.trim() || 'Not available'
                    : 'Not available'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Liên hệ khẩn cấp */}
          {profile.emergencyContact?.name && (
            <div className="profile-section">
              <h2>Emergency Contact</h2>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Name</label>
                  <p>{profile.emergencyContact.name}</p>
                </div>
                <div className="profile-field">
                  <label>Relationship</label>
                  <p>{profile.emergencyContact.relationship || 'Not available'}</p>
                </div>
                <div className="profile-field">
                  <label>Phone Number</label>
                  <p>{profile.emergencyContact.phone || 'Not available'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin y tế */}
          {(profile.medicalHistory?.length > 0 || profile.allergies?.length > 0) && (
            <div className="profile-section">
              <h2>Medical Information</h2>
              
              {profile.medicalHistory?.length > 0 && (
                <div className="medical-info">
                  <h3>Medical History</h3>
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
                  <h3>Allergies</h3>
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
              <h2>Insurance Information</h2>
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
