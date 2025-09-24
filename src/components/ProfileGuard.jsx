import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { getProfileStatus, createOrUpdateProfile } from '../services/patientService';
import PatientInfoModal from './PatientInfoModal';
import '../pages/Home.css';

const ProfileGuard = ({ children }) => {
  const { user } = useAuth();
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Removed showModal state as it's no longer needed

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
          // No need to set showModal anymore
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
        // If error occurs, assume profile is incomplete
        setIsProfileComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileStatus();
  }, [user]);

  // Listen for profile update event from Home component
  useEffect(() => {
    const handleProfileUpdate = async () => {
      if (!user || user.role !== 'patient') {
        return;
      }

      try {
        const response = await getProfileStatus();
        if (response.success) {
          setIsProfileComplete(response.data.isProfileComplete);
        }
      } catch (error) {
        console.error('Error re-checking profile status:', error);
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const handleSaveProfile = async (profileData) => {
    try {
      const response = await createOrUpdateProfile(profileData);
      if (response.success) {
        setIsProfileComplete(true);
        // Profile is now complete, notification will disappear
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  // Removed handleCloseModal as it's no longer needed

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Checking profile status...</p>
      </div>
    );
  }

  // If user is not a patient, show children
  if (!user || user.role !== 'patient') {
    return children;
  }

  // If profile is incomplete, show children with notification
  if (!isProfileComplete) {
    return (
      <>
        {children}
        {/* Show notification banner with button */}
        <div className="profile-notification">
          <div className="notification-content">
            <span className="notification-text">
              ⚠️ Please complete your profile to access all features
            </span>
            <button 
              className="notification-button"
              onClick={() => {
                // Trigger profile modal in Home component
                const event = new CustomEvent('openProfileModal');
                window.dispatchEvent(event);
              }}
            >
              📝 Complete Profile
            </button>
          </div>
        </div>
      </>
    );
  }

  // If profile is complete, show children
  return children;
};

export default ProfileGuard;