// File: dental-clinic-client/src/components/ProfileEditModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createOrUpdateProfile } from '../services/patientService';
import './ProfileEditModal.css';

const ProfileEditModal = ({ isOpen, onClose, onSave, initialData = null }) => {
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
    medicalHistory: '',
    allergies: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    insuranceInfo: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo form data từ initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        basicInfo: {
          fullName: initialData.basicInfo?.fullName || '',
          dateOfBirth: initialData.basicInfo?.dateOfBirth ? 
            new Date(initialData.basicInfo.dateOfBirth).toISOString().split('T')[0] : '',
          gender: initialData.basicInfo?.gender || '',
          idCard: {
            idNumber: initialData.basicInfo?.idCard?.idNumber || ''
          }
        },
        contactInfo: {
          phone: initialData.contactInfo?.phone || '',
          email: initialData.contactInfo?.email || '',
          address: {
            street: initialData.contactInfo?.address?.street || '',
            city: initialData.contactInfo?.address?.city || '',
            state: initialData.contactInfo?.address?.state || '',
            zipCode: initialData.contactInfo?.address?.zipCode || ''
          }
        },
        medicalHistory: initialData.medicalHistory?.length > 0 ? 
          initialData.medicalHistory[0]?.condition || '' : '',
        allergies: initialData.allergies?.length > 0 ? 
          initialData.allergies[0]?.allergen || '' : '',
        emergencyContact: {
          name: initialData.emergencyContact?.name || '',
          relationship: initialData.emergencyContact?.relationship || '',
          phone: initialData.emergencyContact?.phone || ''
        },
        insuranceInfo: initialData.insuranceInfo || ''
      });
    }
  }, [initialData]);

  // Xử lý thay đổi input
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

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

  // Xử lý submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createOrUpdateProfile(formData);
      if (response.success) {
        onSave(response.data);
      } else {
        console.error('Error saving profile:', response.message);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="profile-edit-modal-overlay">
      <div className="profile-edit-modal">
        <div className="profile-edit-modal-header">
          <h2>{initialData ? 'Edit Information' : 'Create Personal Information'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="profile-edit-modal-form">
          {/* Thông tin cơ bản */}
          <div className="form-section">
            <h3>Basic Information</h3>
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

          {/* Thông tin liên hệ */}
          <div className="form-section">
            <h3>Contact Information</h3>
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
                  onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
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
                <label>District *</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className={errors.state ? 'error' : ''}
                />
              </div>
              
              <div className="form-group">
                <label>Ward *</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  className={errors.zipCode ? 'error' : ''}
                />
              </div>
            </div>
          </div>

          {/* Liên hệ khẩn cấp */}
          <div className="form-section">
            <h3>Emergency Contact (Optional)</h3>
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

          {/* Thông tin y tế */}
          <div className="form-section">
            <h3>Medical Information (Optional)</h3>
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

export default ProfileEditModal;
