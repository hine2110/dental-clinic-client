import React from 'react';
import thumbnailFallback from '../../assets/thumbnail.jpg';

const ServiceCard = ({ service, index, onServiceClick }) => {
  // Hàm xử lý lỗi nếu URL ảnh bị hỏng
  const handleImageError = (e) => {
    e.target.src = thumbnailFallback;
  };

  // Hàm format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // SỬA LẠI: Lấy ảnh trực tiếp từ service.thumbnail, nếu không có thì mới dùng ảnh fallback
  const imageUrl = service.thumbnail || thumbnailFallback;

  return (
    <div className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={`${(index + 1) * 100}`}>
      <div className="service-item position-relative">
        <div className="service-thumbnail">
          <img 
            src={imageUrl} 
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