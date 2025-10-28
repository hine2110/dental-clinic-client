import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/authContext';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  // ... (các icon khác)
  HeartOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import './PatientInfoModal.css';

const PatientInfoModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  // ... (state formData giữ nguyên)
  const [formData, setFormData] = useState({
    basicInfo: { fullName: '', dateOfBirth: '', gender: '', idCard: { idNumber: '' }},
    contactInfo: { phone: '', email: '', address: { street: '', city: '', state: '', zipCode: '' }},
    medicalHistory: [], allergies: [], emergencyContact: { name: '', relationship: '', phone: ''},
    insuranceInfo: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ... (Giữ nguyên)
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, email: user?.email || '' }
      }));
    }
  }, [isOpen, user]);

  // ... (Giữ nguyên các hàm handleInputChange, handleNestedInputChange, handleAddressChange, handleIdCardChange)
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [field]: value } }));
  };
  const handleAddressChange = (field, value) => {
    setFormData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, address: { ...prev.contactInfo.address, [field]: value }}}));
  };
  const handleIdCardChange = (value) => {
    setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, idCard: { idNumber: value }}}));
  };

  // === BẮT ĐẦU CẬP NHẬT VALIDATION ===

  // Tách logic validate cho từng trường để tái sử dụng
  const validateField = (name, value) => {
    const digitOnlyRegex = /^[0-9]+$/;
    let errorMsg = '';

    switch (name) {
      case 'idNumber':
        const personId = value.trim();
        if (!personId) errorMsg = 'PersonID is required';
        else if (!digitOnlyRegex.test(personId)) errorMsg = 'PersonID must contain only digits';
        else if (personId.length !== 12) errorMsg = 'PersonID must be exactly 12 digits';
        break;
      
      case 'phone':
        const phone = value.trim();
        if (!phone) errorMsg = 'Phone number is required';
        else if (!digitOnlyRegex.test(phone)) errorMsg = 'Phone number must contain only digits';
        else if (phone.length !== 10) errorMsg = 'Phone number must be exactly 10 digits';
        break;
      
      // (Bạn có thể thêm các trường khác ở đây nếu muốn)
      
      default:
        break;
    }
    return errorMsg;
  };

  // Cập nhật hàm validateForm để dùng logic mới
  const validateForm = () => {
    const newErrors = {};
    
    // Validate basic info
    if (!formData.basicInfo.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.basicInfo.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.basicInfo.gender) newErrors.gender = 'Gender is required';

    // Validate PersonID
    const idError = validateField('idNumber', formData.basicInfo.idCard.idNumber);
    if (idError) newErrors.idNumber = idError;

    // Validate contact info
    const phoneError = validateField('phone', formData.contactInfo.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    if (!formData.contactInfo.email.trim()) newErrors.email = 'Email is required';
    if (!formData.contactInfo.address.street.trim()) newErrors.street = 'Street address is required';
    if (!formData.contactInfo.address.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // THÊM MỚI: Hàm xử lý onBlur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    // Chỉ validate các trường 'idNumber' và 'phone' khi blur
    if (name === 'idNumber' || name === 'phone') {
      const errorMsg = validateField(name, value);
      
      if (errorMsg) {
        // Nếu có lỗi, cập nhật state lỗi
        setErrors(prevErrors => ({
          ...prevErrors,
          [name]: errorMsg
        }));
      } else {
        // Nếu hết lỗi, xóa lỗi cũ (nếu có)
        setErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };
  // === KẾT THÚC CẬP NHẬT VALIDATION ===


  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Dừng lại nếu form không hợp lệ
    }
    setIsSubmitting(true);
    // ... (code submit giữ nguyên)
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="patient-modal-overlay">
      <div className="patient-modal">
        {/* ... (Modal header giữ nguyên) ... */}
        <div className="patient-modal-header">
          <div className="header-content">
            <div className="header-icon"><UserOutlined /></div>
            <div>
              <h2>Personal Information</h2>
              <p>Please complete your personal information</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="patient-modal-form">
          {/* ... (Phần thông tin Full Name, Date of Birth, Gender giữ nguyên) ... */}
          <div className="form-section">
            <div className="section-header">
              <UserOutlined className="section-icon" />
              <h3>Personal Information</h3>
            </div>
            <div className="form-row">
              {/* Full Name */}
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.basicInfo.fullName}
                  onChange={(e) => handleNestedInputChange('basicInfo', 'fullName', e.target.value)}
                  className={errors.fullName ? 'error' : ''}
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>
              {/* Date of Birth */}
              <div className="form-group">
                <label>Date of Birth *</label>
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
              {/* Gender */}
              <div className="form-group">
                <label>Gender *</label>
                <select
                  value={formData.basicInfo.gender}
                  onChange={(e) => handleNestedInputChange('basicInfo', 'gender', e.target.value)}
                  className={errors.gender ? 'error' : ''}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className="error-text">{errors.gender}</span>}
              </div>
              
              {/* === CẬP NHẬT TRƯỜNG PERSONID === */}
              <div className="form-group">
                <label>PersonID *</label>
                <input
                  type="text"
                  value={formData.basicInfo.idCard.idNumber}
                  onChange={(e) => handleIdCardChange(e.target.value)}
                  // THÊM MỚI 2 DÒNG DƯỚI
                  name="idNumber"  // Thêm 'name' để 'handleBlur' nhận diện
                  onBlur={handleBlur} // Thêm sự kiện 'onBlur'
                  //
                  className={errors.idNumber ? 'error' : ''}
                  placeholder="Enter your 12-digit PersonID"
                />
                {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
              </div>
            </div>
          </div>

          {/* Phần thông tin liên hệ */}
          <div className="form-section">
            <div className="section-header">
              <PhoneOutlined className="section-icon" />
              <h3>Contact Information</h3>
            </div>
            <div className="form-row">
              {/* === CẬP NHẬT TRƯỜNG SĐT === */}
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)}
                  // THÊM MỚI 2 DÒNG DƯỚI
                  name="phone" // Thêm 'name' để 'handleBlur' nhận diện
                  onBlur={handleBlur} // Thêm sự kiện 'onBlur'
                  //
                  className={errors.phone ? 'error' : ''}
                  placeholder="Enter your 10-digit phone"
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              
              {/* ... (Trường Email giữ nguyên) ... */}
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  readOnly 
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>

            {/* ... (Các trường địa chỉ, liên hệ khẩn cấp, y tế giữ nguyên) ... */}
            <div className="form-row">
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  className={errors.street ? 'error' : ''}
                />
                {errors.street && <span className="error-text">{errors.street}</span>}
              </div>
              <div className="form-group">
                <label>City *</label>
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
                <label>District *</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Ward *</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="form-section">
            <div className="section-header">
              <ExclamationCircleOutlined className="section-icon" />
              <h3>Emergency Contact (Optional)</h3>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => handleNestedInputChange('emergencyContact', 'relationship', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Emergency Contact Phone</label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) => handleNestedInputChange('emergencyContact', 'phone', e.target.value)}
              />
            </div>
          </div>
          <div className="form-section">
            <div className="section-header">
              <HeartOutlined className="section-icon" />
              <h3>Medical Information (Optional)</h3>
            </div>
            <div className="form-group">
              <label>Medical History</label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                placeholder="Describe health conditions or medical history"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Allergies</label>
              <textarea
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="List allergies or adverse reactions"
                rows="3"
              />
            </div>
          </div>

          {/* Nút hành động (Giữ nguyên) */}
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Information'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PatientInfoModal;