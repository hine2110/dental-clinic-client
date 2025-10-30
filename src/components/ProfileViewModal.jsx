import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getPatientProfile } from '../services/patientService';

const ProfileViewModal = ({ isOpen, onClose, onEdit }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading profile...');
      const response = await getPatientProfile();
      console.log('Profile response:', response);
      
      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(`Error loading profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onEdit();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Profile Information</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading profile...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p>❌ {error}</p>
              <button onClick={loadProfile} className="retry-button">
                🔄 Try Again
              </button>
            </div>
          )}

          {profile && !loading && !error && (
            <div className="profile-content">
              {/* Basic Information */}
              <div className="profile-section">
                <h3>📋 Basic Information</h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Full Name:</label>
                    <span>{profile.fullName || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <label>Date of Birth:</label>
                    <span>{profile.dateOfBirth || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <label>Gender:</label>
                    <span>{profile.gender || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <label>Person ID:</label>
                    <span>{profile.idNumber || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="profile-section">
                <h3>📞 Contact Information</h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Phone Number:</label>
                    <span>{profile.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <label>Email:</label>
                    <span>{profile.email || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <label>Address:</label>
                    <span>{profile.address?.street || 'Not provided'}</span>
                  </div>
                  <div className="profile-field">
                    <label>City:</label>
                    <span>{profile.address?.city || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {profile.emergencyContact && (
                <div className="profile-section">
                  <h3>🚨 Emergency Contact</h3>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>Name:</label>
                      <span>{profile.emergencyContact.name || 'Not provided'}</span>
                    </div>
                    <div className="profile-field">
                      <label>Relationship:</label>
                      <span>{profile.emergencyContact.relationship || 'Not provided'}</span>
                    </div>
                    <div className="profile-field">
                      <label>Phone:</label>
                      <span>{profile.emergencyContact.phone || 'Not provided'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Medical Information */}
              {(profile.medicalHistory || profile.allergies) && (
                <div className="profile-section">
                  <h3>🏥 Medical Information</h3>
                  <div className="profile-grid">
                    {profile.medicalHistory && (
                      <div className="profile-field full-width">
                        <label>Medical History:</label>
                        <span>{profile.medicalHistory || 'Not provided'}</span>
                      </div>
                    )}
                    {profile.allergies && (
                      <div className="profile-field full-width">
                        <label>Allergies:</label>
                        <span>{profile.allergies || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Close
          </button>
          <button className="edit-button" onClick={handleEdit}>
            ✏️ Edit Profile
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProfileViewModal;
