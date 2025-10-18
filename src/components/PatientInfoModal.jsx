import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/authContext';
import { 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  CalendarOutlined, 
  IdcardOutlined,
  HomeOutlined,
  HeartOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import './PatientInfoModal.css';

const PatientInfoModal = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  // State to store form data
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

  // State to store validation errors
  const [errors, setErrors] = useState({});
  // State to show submitting status
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          email: user?.email || ''
        }
      }));
    }
  }, [isOpen, user]);

  // Function to handle regular input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to handle nested input changes (like basicInfo.fullName)
  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Function to handle address changes
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

  // Function to handle ID card changes
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

  // Function to validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate basic information
    if (!formData.basicInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.basicInfo.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.basicInfo.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.basicInfo.idCard.idNumber.trim()) {
      newErrors.idNumber = 'ID number is required';
    }

    // Validate contact information
    if (!formData.contactInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.contactInfo.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.contactInfo.address.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!formData.contactInfo.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check validation before submitting
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Call onSave function from props to save data
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return createPortal(
    <div className="patient-modal-overlay">
      <div className="patient-modal">
        {/* Modal header */}
        <div className="patient-modal-header">
          <div className="header-content">
            <div className="header-icon">
              <UserOutlined />
            </div>
            <div>
              <h2>Thông tin cá nhân</h2>
              <p>Vui lòng hoàn thiện thông tin cá nhân của bạn</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="patient-modal-form">
          {/* Phần thông tin cơ bản */}
          <div className="form-section">
            <div className="section-header">
              <UserOutlined className="section-icon" />
              <h3>Thông tin cá nhân</h3>
            </div>
            <div className="form-row">
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
              
              <div className="form-group">
                <label>ID Number *</label>
                <input
                  type="text"
                  value={formData.basicInfo.idCard.idNumber}
                  onChange={(e) => handleIdCardChange(e.target.value)}
                  className={errors.idNumber ? 'error' : ''}
                  placeholder="Enter your ID number"
                />
                {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
              </div>
            </div>
          </div>

          {/* Phần thông tin liên hệ */}
          <div className="form-section">
            <div className="section-header">
              <PhoneOutlined className="section-icon" />
              <h3>Thông tin liên hệ</h3>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
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
                  readOnly 
                  disabled
                  className="disabled-input"
                />
                {/* Bạn không cần hiển thị lỗi ở đây nữa vì người dùng không thể nhập */}
              </div>
            </div>

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
                <label>Province/State</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Postal Code</label>
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
            <div className="section-header">
              <ExclamationCircleOutlined className="section-icon" />
              <h3>Liên hệ khẩn cấp (Tùy chọn)</h3>
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

          {/* Phần thông tin y tế */}
          <div className="form-section">
            <div className="section-header">
              <HeartOutlined className="section-icon" />
              <h3>Thông tin y tế (Tùy chọn)</h3>
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

          {/* Nút hành động */}
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