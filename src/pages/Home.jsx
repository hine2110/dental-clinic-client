import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import { getProfileStatus } from "../services/patientService";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import StatsSection from "../components/sections/StatsSection";
import ServicesSection from "../components/sections/ServicesSection";
import AppointmentSection from "../components/sections/AppointmentSection";
import DoctorsSection from "../components/sections/DoctorsSection";
import ContactSection from "../components/sections/ContactSection";
import AuthModal from "../components/AuthModal";
import PatientInfoModal from "../components/PatientInfoModal";
import { createOrUpdateProfile } from "../services/patientService";
import Lottie from "lottie-react";
import successAnim from "../assets/lottie/Success.json";
import "./Home.css";


function Home() {
  const { user } = useAuth();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [profileModal, setProfileModal] = useState({ isOpen: false });
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [notice, setNotice] = useState({ show: false, type: 'success', text: '' });
  const successAnimRef = useRef(null);

  // Check profile status for patients
  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!user || user.role !== 'patient') {
        return;
      }

      setIsCheckingProfile(true);
      try {
        const response = await getProfileStatus();
        if (response.success) {
          setIsProfileComplete(response.data.isProfileComplete);
        }
      } catch (error) {
        console.error('Error checking profile status:', error);
        // Assume profile is incomplete if error
        setIsProfileComplete(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkProfileStatus();
  }, [user]);

  // Listen for custom event from ProfileGuard
  useEffect(() => {
    const handleOpenProfileModal = () => {
      openProfileModal();
    };

    window.addEventListener('openProfileModal', handleOpenProfileModal);
    
    return () => {
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
    };
  }, []);

  // No effect needed when using onComplete prop

  const openLoginModal = () => {
    setAuthModal({ isOpen: true, mode: 'login' });
  };

  const openRegisterModal = () => {
    setAuthModal({ isOpen: true, mode: 'register' });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const openProfileModal = () => {
    setProfileModal({ isOpen: true });
  };

  const closeProfileModal = () => {
    setProfileModal({ isOpen: false });
  };

  // Function to handle profile click - now handled by AuthButtons with navigation

  const showCenterNotice = (text, type = 'success', durationMs = 1800) => {
    setNotice({ show: true, type, text });
    // For success type, wait for Lottie 'complete' event to close.
    if (type !== 'success') {
      window.setTimeout(() => setNotice({ show: false, type, text: '' }), durationMs);
    }
  };

  const handleSaveProfile = async (profileData) => {
    try {
      const response = await createOrUpdateProfile(profileData);
      if (response.success) {
        console.log('Profile saved successfully:', response.data);
        setIsProfileComplete(true); // Update profile status
        closeProfileModal();
        // Center success notice
        showCenterNotice('Profile saved successfully!', 'success');
        // Trigger ProfileGuard to re-check profile status
        const event = new CustomEvent('profileUpdated');
        window.dispatchEvent(event);
      } else {
        throw new Error(response.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showCenterNotice('Error saving profile. Please try again.', 'error', 2200);
    }
  };

  return (
    <>
      <Header 
        onOpenLogin={openLoginModal} 
        onOpenRegister={openRegisterModal}
      />
      <main className="main">
        <HeroSection />
        <AboutSection />
        <StatsSection />
        <ServicesSection />
        <DoctorsSection />
        <AppointmentSection />
        <ContactSection />
        
        {/* Center notice */}
        {notice.show && (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 2000,
              background: '#fff',
              color: '#111',
              padding: '18px 22px',
              borderRadius: '14px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              fontWeight: 600,
              letterSpacing: 0.2,
              minWidth: 260,
              textAlign: 'center'
            }}
          >
            <div style={{ width: 160, height: 160, margin: '0 auto 8px' }}>
              <Lottie
                lottieRef={successAnimRef}
                animationData={successAnim}
                loop={false}
                autoplay={true}
                onComplete={() => setNotice({ show: false, type: 'success', text: '' })}
              />
            </div>
            <div>{notice.text}</div>
          </div>
        )}
        
        {/* Edit Profile Button removed - user should click on avatar/name in header instead */}
      </main>
      <Footer />
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
      />
        <PatientInfoModal
          isOpen={profileModal.isOpen}
          onClose={closeProfileModal}
          onSave={handleSaveProfile}
        />
    </>
  );
}

export default Home;
