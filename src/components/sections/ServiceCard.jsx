import React from 'react';
import thumbnailFallback from '../../assets/thumbnail.jpg';

const ServiceCard = ({ service, index, onServiceClick }) => {
  // Function to get thumbnail or fallback
  const getThumbnail = (thumbnail) => {
    if (thumbnail && thumbnail !== '') {
      return thumbnail;
    }
    // Fallback to imported thumbnail from assets
    return thumbnailFallback;
  };

  // Function to handle image error
  const handleImageError = (e) => {
    e.target.src = thumbnailFallback;
  };

  // Function to format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={`${(index + 1) * 100}`}>
      <div className="service-item position-relative">
        <div className="service-thumbnail">
          <img 
            src={getThumbnail(service.thumbnail)} 
            alt={service.name}
            onError={handleImageError}
            className="service-image"
          />
        </div>
        <div className="service-content">
          <div className="service-clickable" onClick={() => onServiceClick(service)}>
            <h3>{service.name}</h3>
            <div className="service-price">
              <strong>{formatPrice(service.price)}</strong>
            </div>
            <div className="service-category">
              <span className="badge bg-primary">{service.category}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
