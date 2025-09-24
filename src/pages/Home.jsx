import React, { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import { getProfileStatus } from "../services/patientService";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import StatsSection from "../components/sections/StatsSection";
import ServicesSection from "../components/sections/ServicesSection";
import AppointmentSection from "../components/sections/AppointmentSection";
import ContactSection from "../components/sections/ContactSection";
import AuthModal from "../components/AuthModal";
import PatientInfoModal from "../components/PatientInfoModal";
import { createOrUpdateProfile } from "../services/patientService";
import "./Home.css";

function Home() {
  const { user } = useAuth();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [profileModal, setProfileModal] = useState({ isOpen: false });
  const [isProfileComplete, setIsProfileComplete] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

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

  const handleSaveProfile = async (profileData) => {
    try {
      const response = await createOrUpdateProfile(profileData);
      if (response.success) {
        console.log('Profile saved successfully:', response.data);
        setIsProfileComplete(true); // Update profile status
        closeProfileModal();
        
        // Show success message
        alert('Profile saved successfully!');
        
        // Trigger ProfileGuard to re-check profile status
        const event = new CustomEvent('profileUpdated');
        window.dispatchEvent(event);
      } else {
        throw new Error(response.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
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
        <AppointmentSection />
        <ContactSection />
        
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
