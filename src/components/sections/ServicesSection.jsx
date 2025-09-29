import React, { useState, useEffect } from 'react';
import { getServices } from '../../services/patientService';
import ServiceCard from './ServiceCard';
import ServiceDetailModal from './ServiceDetailModal';
import './ServicesSection.css';

function ServicesSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [displayedServices, setDisplayedServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      if (showAll) {
        setDisplayedServices(services);
      } else {
        setDisplayedServices(services.slice(0, 3));
      }
    }
  }, [services, showAll]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getServices({ limit: 20 }); // Lấy nhiều services để có thể show more
      
      if (response.success) {
        setServices(response.data);
      } else {
        setError(response.message || 'Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const handleServiceClick = (service) => {
    console.log('Service clicked:', service);
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <section id="services" className="services section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Services</h2>
          <p>Dedicated – Professional – Effective: High-quality dental care for all ages.</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading services...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="services" className="services section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Services</h2>
          <p>Dedicated – Professional – Effective: High-quality dental care for all ages.</p>
        </div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 text-center">
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
                <button className="btn btn-sm btn-outline-primary ms-3" onClick={fetchServices}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Our Services</h2>
        <p>Dedicated – Professional – Effective: High-quality dental care for all ages.</p>
      </div>
      <div className="container">
        <div className="row gy-4">
          {displayedServices.map((service, index) => (
            <ServiceCard 
              key={service._id} 
              service={service} 
              index={index} 
              onServiceClick={handleServiceClick}
            />
          ))}
        </div>
        
        {/* View More/Less Button */}
        {services.length > 3 && (
          <div className="text-center mt-4" data-aos="fade-up" data-aos-delay="400">
            <button 
              className="btn btn-outline-primary"
              onClick={toggleShowAll}
            >
              {showAll ? (
                <>
                  <i className="fas fa-chevron-up me-2"></i>
                  Show Less
                </>
              ) : (
                <>
                  <i className="fas fa-chevron-down me-2"></i>
                  View More Services
                </>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Service Detail Modal */}
      <ServiceDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        service={selectedService}
      />
    </section>
  );
}

export default ServicesSection;
