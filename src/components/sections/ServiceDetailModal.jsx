import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './ServiceDetailModal.css';
import thumbnailFallback from '../../assets/thumbnail.jpg'; // Đảm bảo đường dẫn này đúng

const ServiceDetailModal = ({ isOpen, onClose, service }) => {
  const [activeStep, setActiveStep] = useState(1);
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
                <>
                  {/* --- Quy trình mặc định --- */}
                  <div className={`timeline-item ${activeStep === 1 ? 'active' : ''}`} onClick={() => setActiveStep(activeStep === 1 ? null : 1)}>
                    <div className="timeline-content">
                      <div className="timeline-title-wrapper">
                        <h4>Khám và chụp X-quang</h4>
                        <span className="timeline-chevron"></span>
                      </div>
                      <div className="timeline-description-wrapper">
                        <p>Đánh giá vị trí răng khôn. Bác sĩ sẽ kiểm tra sức khỏe răng miệng tổng quát và tư vấn chi tiết về tình trạng của bạn.</p>
                      </div>
                    </div>
                  </div>
                  <div className={`timeline-item ${activeStep === 2 ? 'active' : ''}`} onClick={() => setActiveStep(activeStep === 2 ? null : 2)}>
                    <div className="timeline-content">
                      <div className="timeline-title-wrapper">
                        <h4>Gây tê</h4>
                        <span className="timeline-chevron"></span>
                      </div>
                      <div className="timeline-description-wrapper">
                        <p>Tiến hành gây tê tại chỗ để đảm bảo bạn không cảm thấy đau trong suốt quá trình thực hiện.</p>
                      </div>
                    </div>
                  </div>
                  <div className={`timeline-item ${activeStep === 3 ? 'active' : ''}`} onClick={() => setActiveStep(activeStep === 3 ? null : 3)}>
                    <div className="timeline-content">
                      <div className="timeline-title-wrapper">
                        <h4>Nhổ răng</h4>
                        <span className="timeline-chevron"></span>
                      </div>
                      <div className="timeline-description-wrapper">
                        <p>Thực hiện nhổ răng khôn theo quy trình chuẩn quốc tế, an toàn và nhanh chóng.</p>
                      </div>
                    </div>
                  </div>
                  <div className={`timeline-item ${activeStep === 4 ? 'active' : ''}`} onClick={() => setActiveStep(activeStep === 4 ? null : 4)}>
                    <div className="timeline-content">
                      <div className="timeline-title-wrapper">
                        <h4>Khâu vết thương</h4>
                        <span className="timeline-chevron"></span>
                      </div>
                      <div className="timeline-description-wrapper">
                        <p>Khâu lại vết thương bằng chỉ tự tiêu và hướng dẫn chăm sóc sau điều trị để đảm bảo quá trình lành thương tốt nhất.</p>
                      </div>
                    </div>
                  </div>
                </>
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