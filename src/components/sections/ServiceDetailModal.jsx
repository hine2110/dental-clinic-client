import React from 'react';
import { createPortal } from 'react-dom';
import './ServiceDetailModal.css';

const ServiceDetailModal = ({ isOpen, onClose, service }) => {
  if (!isOpen || !service) return null;

  // Function to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Function to get category icon
  const getCategoryIcon = (category) => {
    const iconMap = {
      'Examination': 'fas fa-stethoscope',
      'Hygiene': 'fas fa-tooth',
      'Cosmetic': 'fas fa-gem',
      'Treatment': 'fas fa-medkit',
      'Restoration': 'fas fa-tools',
      'Orthodontics': 'fas fa-align-center',
      'Surgery': 'fas fa-cut'
    };
    return iconMap[category] || 'fas fa-tooth';
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content service-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="service-title-section">
            <div className="service-icon">
              <i className={getCategoryIcon(service.category)}></i>
            </div>
            <div className="service-title-info">
              <h2>{service.name}</h2>
              <div className="service-category">
                <span className="badge bg-primary">{service.category}</span>
              </div>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="service-price-section">
            <div className="price-label">Service Price:</div>
            <div className="price-value">{formatPrice(service.price)}</div>
          </div>

          <div className="service-description-section">
            <h3>Service Description</h3>
            <div className="description-content">
              {service.description}
            </div>
          </div>

          <div className="service-process-section">
            <h3>Treatment Process</h3>
            <div className="process-steps">
              {service.process && service.process.length > 0 ? (
                service.process
                  .sort((a, b) => a.step - b.step)
                  .map((processStep) => (
                    <div key={processStep.step} className="process-step">
                      <div className="step-number">{processStep.step}</div>
                      <div className="step-content">
                        <h4>{processStep.title}</h4>
                        <p>{processStep.description}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="default-process">
                  <div className="process-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Consultation & Examination</h4>
                      <p>Our dentist will examine your oral health and provide detailed consultation about your dental condition</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Treatment Planning</h4>
                      <p>Develop a personalized treatment plan that suits your needs and dental condition</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Treatment Execution</h4>
                      <p>Perform the treatment following international standard procedures</p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Follow-up & Care</h4>
                      <p>Provide post-treatment care instructions and monitor treatment results</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">
            <i className="fas fa-calendar-plus me-2"></i>
            Book Appointment
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ServiceDetailModal;
