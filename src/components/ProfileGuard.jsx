import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { getProfileStatus, createOrUpdateProfile } from '../services/patientService';
import PatientInfoModal from './PatientInfoModal';

const ProfileGuard = ({ children }) => {
  const { user } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user || user.role !== 'patient') {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getProfileStatus();
        if (response.success) {
          setIsProfileComplete(response.data.isProfileComplete);
          if (!response.data.isProfileComplete) {
            setShowModal(true);
          }
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
        // Nếu xảy ra lỗi, giả định rằng hồ sơ chưa hoàn chỉnh
        setIsProfileComplete(false);
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileStatus();
  }, [user]);

  const handleSaveProfile = async (profileData) => {
    try {
      const response = await createOrUpdateProfile(profileData);
      if (response.success) {
        setIsProfileComplete(true);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    // Không cho phép đóng modal nếu hồ sơ chưa hoàn chỉnh
    if (!isProfileComplete) {
      return;
    }
    setShowModal(false);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking profile status...</p>
      </div>
    );
  }

  // Nếu người dùng không phải là bệnh nhân, thì hiển thị trẻ em
  if (!user || user.role !== 'patient') {
    return children;
  }

  // Nếu hồ sơ chưa hoàn chỉnh, hiển thị modal
  if (!isProfileComplete) {
    return (
      <>
        <PatientInfoModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveProfile}
        />
        {/* Show overlay behind modal */}
        <div className="profile-incomplete-overlay">
          <div className="profile-incomplete-message">
            <h2>Profile Setup Required</h2>
            <p>Please complete your profile to continue using the system.</p>
          </div>
        </div>
      </>
    );
  }

  // Nếu hồ sơ đã hoàn chỉnh, hiển thị trẻ em
  return children;
};

export default ProfileGuard;