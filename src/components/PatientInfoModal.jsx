import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './PatientInfoModal.css';

const PatientInfoModal = ({ isOpen, onClose, onSave }) => {
  // State để lưu dữ liệu form
  const [formData, setFormData] = useState({
    basicInfo: {
      fullName: '',           
      dateOfBirth: '',        
      gender: '',            
      idCard: {
        idNumber: ''        
      }
    },
    contactInfo: {
      phone: '',              
      email: '',            
      address: {
        street: '',           
        city: '',            
        state: '',            
        zipCode: ''          
      }
    },
    medicalHistory: [],       
    allergies: [],           
    emergencyContact: {       
      name: '',
      relationship: '',      
      phone: ''
    },
    insuranceInfo: ''         
  });

  // State để lưu lỗi validation
  const [errors, setErrors] = useState({});
  // State để hiển thị trạng thái đang submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm xử lý thay đổi input thông thường
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Hàm xử lý thay đổi input lồng nhau (như basicInfo.fullName)
  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Hàm xử lý thay đổi địa chỉ
  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        address: {
          ...prev.contactInfo.address,
          [field]: value
        }
      }
    }));
  };

  // Hàm xử lý thay đổi số CCCD
  const handleIdCardChange = (value) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        idCard: {
          idNumber: value
        }
      }
    }));
  };

  // Hàm validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate thông tin cơ bản
    if (!formData.basicInfo.fullName.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }
    if (!formData.basicInfo.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    }
    if (!formData.basicInfo.gender) {
      newErrors.gender = 'Giới tính là bắt buộc';
    }
    if (!formData.basicInfo.idCard.idNumber.trim()) {
      newErrors.idNumber = 'Số CCCD là bắt buộc';
    }

    // Validate thông tin liên hệ
    if (!formData.contactInfo.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    }
    if (!formData.contactInfo.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    }
    if (!formData.contactInfo.address.street.trim()) {
      newErrors.street = 'Địa chỉ đường là bắt buộc';
    }
    if (!formData.contactInfo.address.city.trim()) {
      newErrors.city = 'Thành phố là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Hàm xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra validation trước khi submit
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Gọi hàm onSave từ props để lưu dữ liệu
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Lỗi khi lưu profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nếu modal không mở thì không render gì
  if (!isOpen) return null;

  return createPortal(
    <div className="patient-modal-overlay">
      <div className="patient-modal">
        {/* Header của modal */}
        <div className="patient-modal-header">
          <h2>Hoàn thiện thông tin cá nhân</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="patient-modal-form">
          {/* Phần thông tin cơ bản */}
          <div className="form-section">
            <h3>Thông tin cơ bản</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Họ và tên *</label>
                <input
                  type="text"
                  value={formData.basicInfo.fullName}
                  onChange={(e) => handleNestedInputChange('basicInfo', 'fullName', e.target.value)}
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>
              
              <div className="form-group">
                <label>Ngày sinh *</label>
                <input
                  type="date"
                  value={formData.basicInfo.dateOfBirth}
                  onChange={(e) => handleNestedInputChange('basicInfo', 'dateOfBirth', e.target.value)}
                  className={errors.dateOfBirth ? 'error' : ''}
                />
                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Giới tính *</label>
                <select
                  value={formData.basicInfo.gender}
                  onChange={(e) => handleNestedInputChange('basicInfo', 'gender', e.target.value)}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>
              
              <div className="form-group">
                <label>Số CCCD *</label>
                <input
                  type="text"
                  value={formData.basicInfo.idCard.idNumber}
                  onChange={(e) => handleIdCardChange(e.target.value)}
                  className={errors.idNumber ? 'error' : ''}
                  placeholder="Nhập số CCCD của bạn"
                />
                {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
              </div>
            </div>
          </div>

          {/* Phần thông tin liên hệ */}
          <div className="form-section">
            <h3>Thông tin liên hệ</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Số điện thoại *</label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Địa chỉ đường *</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className={errors.street ? 'error' : ''}
                />
                {errors.street && <span className="error-text">{errors.street}</span>}
              </div>
              
              <div className="form-group">
                <label>Thành phố *</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tỉnh/Thành phố</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Mã bưu điện</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Phần liên hệ khẩn cấp */}
          <div className="form-section">
            <h3>Liên hệ khẩn cấp (Tùy chọn)</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tên người liên hệ khẩn cấp</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Mối quan hệ</label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Số điện thoại liên hệ khẩn cấp</label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
              />
            </div>
          </div>

          {/* Phần thông tin y tế */}
          <div className="form-section">
            <h3>Thông tin y tế (Tùy chọn)</h3>
            <div className="form-group">
              <label>Lịch sử bệnh án</label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                placeholder="Mô tả các tình trạng sức khỏe hoặc lịch sử bệnh án"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Dị ứng</label>
              <textarea
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="Liệt kê các dị ứng hoặc phản ứng bất lợi"
                rows="3"
              />
            </div>
          </div>

          {/* Nút hành động */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PatientInfoModal;