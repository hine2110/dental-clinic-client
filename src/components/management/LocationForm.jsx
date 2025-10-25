// src/pages/management/CreateLocation.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/authContext';
import './LocationForm.css'; // We will create this CSS file next


function LocationForm({onLocationCreated, initialData, onSave, onCancel} ) {
  const [formData, setFormData] = useState({
    name: '',
    address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Việt Nam', 
      },
    phone: '',
    email: '',
    isActive: true,
  });

  const isEditMode = Boolean(initialData);

  useEffect(() => {
    if (isEditMode) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || { street: '', city: '', state: '', zipCode: '', country: 'Việt Nam' },
        phone: initialData.phone || '',
        email: initialData.email || '',
        isActive: initialData.isActive === true,
      });
    }
  }, [initialData, isEditMode]);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      // Nếu là checkbox, dùng 'checked'. Nếu không, dùng 'value'.
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode 
        ? `${API_BASE_URL}/management/locations/${initialData._id}` 
        : `${API_BASE_URL}/management/locations`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save location.');
      
      // Gọi hàm onSave từ component cha để cập nhật UI
      onSave(data.data);

    } catch (err) {
      setError(err.message);
      console.error('Error saving location:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-card create-location-container">
      <h2>{isEditMode ? 'Chỉnh Sửa Cơ Sở' : 'Tạo Cơ Sở Mới'}</h2>
      
      {error && <div className="form-message error-message">{error}</div>}
      {success && <div className="form-message success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="create-location-form">
        <div className="form-section">
          <h3>Thông tin cơ bản</h3>
          <div className="form-group">
            <label htmlFor="name">Tên Cơ Sở *</label>
            <input 
              name="name" 
              type="text" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="Ví dụ: Beauty Smile Quận 1"
            />
          </div>
          {isEditMode && (
            <div className="form-group-checkbox">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <label htmlFor="isActive">Đang hoạt động</label>
            </div>
          )}
        </div>

        {/* 5. Cập nhật các input cho địa chỉ */}
        <div className="form-section">
          <h3>Địa chỉ và Liên hệ</h3>
          <div className="form-group">
            <label htmlFor="street">Số nhà, Tên đường</label>
            <input 
              name="street" 
              type="text" 
              value={formData.address.street} 
              onChange={handleAddressChange} 
              placeholder="123 Nguyễn Huệ"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Thành phố / Tỉnh</label>
              <input 
                name="city" 
                type="text" 
                value={formData.address.city} 
                onChange={handleAddressChange} 
                placeholder="TP. Hồ Chí Minh"
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">Quận / Huyện</label>
              <input 
                name="state" 
                type="text" 
                value={formData.address.state} 
                onChange={handleAddressChange} 
                placeholder="Quận 1"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="zipCode">Mã bưu chính (Zip Code)</label>
              <input 
                name="zipCode" 
                type="text" 
                value={formData.address.zipCode} 
                onChange={handleAddressChange} 
                placeholder="700000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="country">Quốc gia</label>
              <input 
                name="country" 
                type="text" 
                value={formData.address.country} 
                onChange={handleAddressChange}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Số Điện Thoại</label>
              <input 
                name="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleChange} 
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
              />
            </div>
          </div>
        </div>
        
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Đang lưu...' : 'Tạo Cơ Sở'}
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
                Hủy
            </button>

        

      </form>
    </div>
  );
}

export default LocationForm;