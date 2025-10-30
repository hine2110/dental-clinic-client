// File: dental-clinic-client/src/components/ProfileEditModal.jsx
// (ĐÃ CẬP NHẬT: Validate "on-blur" và xóa bỏ alert)

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

  // Khởi tạo form data từ initialData (Giữ nguyên)
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
        medicalHistory: initialData.medicalHistory?.map(item => item.condition).join(', ') || '',
        allergies: initialData.allergies?.map(item => item.allergen).join(', ') || '',
        emergencyContact: {
          name: initialData.emergencyContact?.name || '',
          relationship: initialData.emergencyContact?.relationship || '',
          phone: initialData.emergencyContact?.phone || ''
        },
        insuranceInfo: initialData.insuranceInfo || ''
      });
    }
  }, [initialData]);

  // Xử lý thay đổi input (Giữ nguyên)
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        address: { ...prev.contactInfo.address, [field]: value }
      }
    }));
  };

  const handleIdCardChange = (value) => {
    setFormData(prev => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        idCard: { idNumber: value }
      }
    }));
  };

  // ==========================================================
  // === BẮT ĐẦU CẬP NHẬT: LOGIC VALIDATE MỚI ===
  // ==========================================================

  /**
   * (MỚI) Hàm kiểm tra logic cho một trường duy nhất
   * Trả về 'null' nếu hợp lệ, hoặc 'string' (thông báo lỗi) nếu không hợp lệ
   */
  const validateField = (fieldName, value) => {
    const idRegex = /^\d{12}$/; // 12 số
    const phoneRegex = /^0\d{9}$/; // 10 số, bắt đầu bằng 0

    switch (fieldName) {
      case 'fullName':
        return value.trim() ? null : 'Full name is required';
      case 'dateOfBirth':
        return value ? null : 'Date of birth is required';
      case 'gender':
        return value ? null : 'Gender is required';
      case 'idNumber':
        if (!value.trim()) return 'ID number is required';
        if (!idRegex.test(value)) return 'ID number must be exactly 12 digits';
        return null; // Hợp lệ
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value)) return 'Phone must be 10 digits and start with 0';
        return null; // Hợp lệ
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
        return null; // Hợp lệ
      case 'street':
        return value.trim() ? null : 'Street address is required';
      case 'city':
        return value.trim() ? null : 'City is required';
      default:
        return null;
    }
  };

  /**
   * (MỚI) Hàm xử lý khi người dùng rời khỏi một ô input (onBlur)
   */
  const handleBlur = (fieldName, value) => {
    const errorMessage = validateField(fieldName, value);
    // Cập nhật lỗi cho trường cụ thể đó
    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: errorMessage
    }));
  };

  /**
   * (CẬP NHẬT) Hàm validate này giờ sẽ chạy tất cả các hàm validateField
   * để kiểm tra toàn bộ form trước khi submit
   */
  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = {
      fullName: formData.basicInfo.fullName,
      dateOfBirth: formData.basicInfo.dateOfBirth,
      gender: formData.basicInfo.gender,
      idNumber: formData.basicInfo.idCard.idNumber,
      phone: formData.contactInfo.phone,
      email: formData.contactInfo.email,
      street: formData.contactInfo.address.street,
      city: formData.contactInfo.address.city,
    };

    let isValid = true;
    for (const [field, value] of Object.entries(fieldsToValidate)) {
      const errorMessage = validateField(field, value);
      if (errorMessage) {
        newErrors[field] = errorMessage;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  /**
   * (CẬP NHẬT) Xóa bỏ `alert()`
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // `validateForm()` sẽ chạy, cập nhật tất cả lỗi và trả về true/false
    if (!validateForm()) {
      // (ĐÃ XÓA ALERT)
      // Người dùng sẽ tự thấy các ô màu đỏ
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend = {
        ...formData,
        medicalHistory: formData.medicalHistory ? [{ condition: formData.medicalHistory, recordedAt: new Date() }] : [],
        allergies: formData.allergies ? [{ allergen: formData.allergies, reaction: 'N/A', recordedAt: new Date() }] : []
      };

      const response = await createOrUpdateProfile(dataToSend);
      
      if (response.success) {
        onSave(response.data);
        onClose();
      } else {
        alert(`Error saving profile: ${response.message || 'Unknown error'}`);
        console.error('Error saving profile:', response.message);
      }
    } catch (error) {
      alert(`Error saving profile: ${error.message || 'Unknown error'}`);
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================================
  // === KẾT THÚC CẬP NHẬT: LOGIC VALIDATE MỚI ===
  // ==========================================================

  if (!isOpen) return null;

  return createPortal(
    <div className="profile-edit-modal-overlay">
      <div className="profile-edit-modal">
        <div className="profile-edit-modal-header">
          <h2>{initialData ? 'Edit Information' : 'Create Personal Information'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {/* (Thêm noValidate để tắt validate mặc định của trình duyệt) */}
        <form onSubmit={handleSubmit} className="profile-edit-modal-form" noValidate>
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
                  // (THÊM MỚI onBlur)
                  onBlur={(e) => handleBlur('fullName', e.target.value)}
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
                  // (THÊM MỚI onBlur)
                  onBlur={(e) => handleBlur('dateOfBirth', e.target.value)}
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
                  // (THÊM MỚI onBlur)
                  onBlur={(e) => handleBlur('gender', e.target.value)}
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
                <label>ID Number (12 digits) *</label>
                <input
                  type="text"
                  value={formData.basicInfo.idCard.idNumber}
                  onChange={(e) => handleIdCardChange(e.target.value)}
                  // (THÊM MỚI onBlur)
                  onBlur={(e) => handleBlur('idNumber', e.target.value)}
                  className={errors.idNumber ? 'error' : ''}
                  placeholder="Enter your 12-digit ID"
                  maxLength={12}
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
                <label>Phone (10 digits, start with 0) *</label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleNestedInputChange('contactInfo', 'phone', e.target.value)}
                  // (THÊM MỚI onBlur)
                  onBlur={(e) => handleBlur('phone', e.target.value)}
                  className={errors.phone ? 'error' : ''}
                  placeholder="0xxxxxxxxx"
                  maxLength={10}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleNestedInputChange('contactInfo', 'email', e.target.value)}
                  // (THÊM MỚI onBlur)
                  onBlur={(e) => handleBlur('email', e.target.value)}
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
                  // (THÊM MỚI onBlur)
                  onBlur={(e) => handleBlur('street', e.target.value)}
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
                  // (THÊM MỚI onBlur)
                  onBlur={(e) => handleBlur('city', e.target.value)}
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-text">{errors.city}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>District</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className={errors.state ? 'error' : ''}
                  placeholder="(Optional)"
                />
              </div>
              
              <div className="form-group">
                <label>Ward</label>
                <input
                  type="text"
                  value={formData.contactInfo.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  className={errors.zipCode ? 'error' : ''}
                  placeholder="(Optional)"
                />
              </div>
            </div>
          </div>

          {/* Liên hệ khẩn cấp (Giữ nguyên) */}
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

          {/* Thông tin y tế (Giữ nguyên) */}
          <div className="form-section">
            <h3>Medical Information (Optional)</h3>
            <div className="form-group">
              <label>Medical History</label>
              <textarea
                value={formData.medicalHistory}
                onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                placeholder="Describe health conditions (e.g., Diabetes, Hypertension)"
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label>Allergies</label>
              <textarea
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="List allergies (e.g., Penicillin, Peanuts)"
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

export default ProfileEditModal;