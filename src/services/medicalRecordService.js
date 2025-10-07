import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// ==================== MEDICAL RECORD MANAGEMENT ====================

/**
 * Tạo hồ sơ bệnh án mới
 * @param {object} recordData - Dữ liệu hồ sơ bệnh án
 * @returns {Promise<object>} Kết quả tạo hồ sơ
 */
export const createMedicalRecord = async (recordData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/doctor/medical-records`, recordData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating medical record:', error);
    throw error;
  }
};

/**
 * Lấy danh sách hồ sơ bệnh án của bác sĩ
 * @param {object} filters - Bộ lọc (page, limit, status, patientId, startDate, endDate)
 * @returns {Promise<object>} Danh sách hồ sơ bệnh án
 */
export const getDoctorMedicalRecords = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_BASE_URL}/doctor/medical-records?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting medical records:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết hồ sơ bệnh án
 * @param {string} recordId - ID của hồ sơ bệnh án
 * @returns {Promise<object>} Chi tiết hồ sơ bệnh án
 */
export const getMedicalRecordById = async (recordId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctor/medical-records/${recordId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting medical record:', error);
    throw error;
  }
};

/**
 * Cập nhật hồ sơ bệnh án
 * @param {string} recordId - ID của hồ sơ bệnh án
 * @param {object} updateData - Dữ liệu cập nhật
 * @returns {Promise<object>} Kết quả cập nhật
 */
export const updateMedicalRecord = async (recordId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/doctor/medical-records/${recordId}`, updateData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating medical record:', error);
    throw error;
  }
};

/**
 * Xóa hồ sơ bệnh án
 * @param {string} recordId - ID của hồ sơ bệnh án
 * @returns {Promise<object>} Kết quả xóa
 */
export const deleteMedicalRecord = async (recordId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/doctor/medical-records/${recordId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting medical record:', error);
    throw error;
  }
};

/**
 * Hoàn thành hồ sơ bệnh án
 * @param {string} recordId - ID của hồ sơ bệnh án
 * @returns {Promise<object>} Kết quả hoàn thành
 */
export const completeMedicalRecord = async (recordId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/doctor/medical-records/${recordId}/complete`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error completing medical record:', error);
    throw error;
  }
};

/**
 * Lấy hồ sơ bệnh án của bệnh nhân
 * @param {string} patientId - ID của bệnh nhân
 * @returns {Promise<object>} Danh sách hồ sơ bệnh án của bệnh nhân
 */
export const getPatientMedicalRecords = async (patientId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctor/medical-records/patient/${patientId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting patient medical records:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format date for display
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted date string (DD/MM/YYYY)
 */
export const formatDateForDisplay = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN');
};

/**
 * Format datetime for display
 * @param {Date|string} date - Date object or string
 * @returns {string} Formatted datetime string (DD/MM/YYYY HH:mm)
 */
export const formatDateTimeForDisplay = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

/**
 * Get status color for medical records
 * @param {string} status - Medical record status
 * @returns {string} CSS color class
 */
export const getMedicalRecordStatusColor = (status) => {
  switch (status) {
    case 'draft':
      return 'orange';
    case 'completed':
      return 'green';
    case 'archived':
      return 'gray';
    default:
      return 'default';
  }
};

/**
 * Get status text for medical records
 * @param {string} status - Medical record status
 * @returns {string} Status text in Vietnamese
 */
export const getMedicalRecordStatusText = (status) => {
  switch (status) {
    case 'draft':
      return 'Bản nháp';
    case 'completed':
      return 'Hoàn thành';
    case 'archived':
      return 'Đã lưu trữ';
    default:
      return 'Không xác định';
  }
};

/**
 * Format clinical examination data for display
 * @param {object} examination - Clinical examination data
 * @returns {object} Formatted examination data
 */
export const formatClinicalExamination = (examination) => {
  if (!examination) return {};
  
  return {
    general: {
      appearance: examination.generalAppearance || 'N/A',
      vitalSigns: examination.vitalSigns || {}
    },
    oral: {
      teeth: examination.oralExamination?.teeth || {},
      gums: examination.oralExamination?.gums || {},
      tongue: examination.oralExamination?.tongue || {},
      mucosa: examination.oralExamination?.mucosa || {}
    },
    dental: examination.dentalExamination || {}
  };
};

/**
 * Format diagnosis data for display
 * @param {object} diagnosis - Diagnosis data
 * @returns {object} Formatted diagnosis data
 */
export const formatDiagnosis = (diagnosis) => {
  if (!diagnosis) return {};
  
  return {
    primary: diagnosis.primary || 'Chưa chẩn đoán',
    secondary: diagnosis.secondary || [],
    differential: diagnosis.differential || []
  };
};

/**
 * Format treatment plan for display
 * @param {object} plan - Treatment plan data
 * @returns {object} Formatted treatment plan data
 */
export const formatTreatmentPlan = (plan) => {
  if (!plan) return {};
  
  return {
    immediate: plan.immediate || [],
    shortTerm: plan.shortTerm || [],
    longTerm: plan.longTerm || [],
    followUp: plan.followUp || {}
  };
};

export default {
  // Medical Record Management
  createMedicalRecord,
  getDoctorMedicalRecords,
  getMedicalRecordById,
  updateMedicalRecord,
  deleteMedicalRecord,
  completeMedicalRecord,
  getPatientMedicalRecords,
  
  // Utilities
  formatDateForDisplay,
  formatDateTimeForDisplay,
  getMedicalRecordStatusColor,
  getMedicalRecordStatusText,
  formatClinicalExamination,
  formatDiagnosis,
  formatTreatmentPlan
};
