// components/sections/ServiceCard.jsx

import React from 'react';
import Atropos from 'atropos/react';
import 'atropos/css';
import thumbnailFallback from '../../assets/thumbnail.jpg';

// Import file CSS của bạn
import './ServicesSection.css'; 

const ServiceCard = ({ service, index, onServiceClick }) => {
  const handleImageError = (e) => {
    e.target.src = thumbnailFallback;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const imageUrl = service.thumbnail || thumbnailFallback;

  return (
    <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={`${(index + 1) * 100}`}>
      <div onClick={() => onServiceClick(service)}>
        <Atropos
          className="service-item-glass" 
          shadowScale={0.8}
          highlight={true}
        >
          {/* Lớp ảnh nền: được đẩy vào sâu */}
          <img 
            src={imageUrl} 
            alt={service.name}
            onError={handleImageError}
            className="service-image-background"
            data-atropos-offset="-4" 
          />
          
          {/* Lớp "Kính mờ" chứa nội dung: được đẩy nổi lên trên */}
          <div className="service-content-glass" data-atropos-offset="5">
            <h3>{service.name}</h3>
            <div className="service-price">
              <strong>{formatPrice(service.price)}</strong>
            </div>
            <div className="service-category">
              <span className="badge bg-primary">{service.category}</span>
            </div>
          </div>
        </Atropos>
      </div>
    </div>
  );
};

export default ServiceCard;