import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './ServiceDetailModal.css';
import thumbnailFallback from '../../assets/thumbnail.jpg'; // Đảm bảo đường dẫn này đúng

const ServiceDetailModal = ({ isOpen, onClose, service }) => {
  const [activeStep, setActiveStep] = useState(
    service?.process?.[0]?.step || null
  );

  // --- SỬA LỖI ESLINT ---
  // Di chuyển Hook lên đây, trước lệnh return có điều kiện
  React.useEffect(() => {
    // Chỉ cập nhật state nếu 'service' tồn tại
    if (service?.process?.[0]) {
      setActiveStep(service.process[0].step);
    } else {
      setActiveStep(null); // Không có quy trình thì không mở step nào
    }
  }, [service]); // Chạy lại khi 'service' prop thay đổi
  // --- KẾT THÚC SỬA LỖI ---

  // Lệnh return sớm phải nằm SAU khi tất cả các Hook đã được gọi
  if (!isOpen || !service) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const imageUrl = service.thumbnail || thumbnailFallback;

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="service-detail-modal" onClick={(e) => e.stopPropagation()}>
        
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="modal-body">
          {/* --- Panel thông tin chính --- */}
          <div className="service-main-info">
            <div className="service-thumbnail-container">
              <img src={imageUrl} alt={service.name} className="service-thumbnail-image" />
            </div>
            <div className="service-details-container">
              <span className="badge service-category-badge">{service.category || 'Phẫu thuật'}</span>
              <h2 className="service-main-title">{service.name}</h2>
              <p className="service-short-description">{service.description}</p>
              <div className="service-main-price">{formatPrice(service.price)}</div>
            </div>
          </div>

          {/* --- Panel quy trình Accordion --- */}
          <div className="service-process-section">
            <h3>Treatment Process</h3>
            <div className="process-timeline">
              {service.process && service.process.length > 0 ? (
                service.process.map((step) => (
                  <div 
                    key={step._id || step.step} 
                    className={`timeline-item ${activeStep === step.step ? 'active' : ''}`} 
                    onClick={() => setActiveStep(activeStep === step.step ? null : step.step)}
                  >
                    <div className="timeline-content">
                      <div className="timeline-title-wrapper">
                        <h4>{step.title}</h4> 
                        <span className="timeline-chevron"></span>
                      </div>
                      <div className="timeline-description-wrapper">
                        <p>{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No treatment process available for this service.</p>
              )}
            </div>
          </div>

          {/* --- Panel Footer --- */}
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <a 
              href="#appointment" 
              className="btn btn-primary" 
              onClick={onClose}
            >
              Book Appointment
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ServiceDetailModal;