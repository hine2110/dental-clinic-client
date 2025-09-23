import React, { useState } from "react";
import { useAuth } from "../context/authContext.jsx";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import HeroSection from "../components/sections/HeroSection";
import AboutSection from "../components/sections/AboutSection";
import StatsSection from "../components/sections/StatsSection";
import ServicesSection from "../components/sections/ServicesSection";
import AppointmentSection from "../components/sections/AppointmentSection";
import ContactSection from "../components/sections/ContactSection";
import AuthModal from "../components/AuthModal";

function Home() {
  const { user } = useAuth();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const openLoginModal = () => {
    setAuthModal({ isOpen: true, mode: 'login' });
  };

  const openRegisterModal = () => {
    setAuthModal({ isOpen: true, mode: 'register' });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  return (
    <>
      <Header onOpenLogin={openLoginModal} onOpenRegister={openRegisterModal} />
      <main className="main">
        <HeroSection />
        <AboutSection />
        <StatsSection />
        <ServicesSection />
        <AppointmentSection />
        <ContactSection />
      </main>
      <Footer />
      <AuthModal 
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        initialMode={authModal.mode}
      />
    </>
  );
}

export default Home;
