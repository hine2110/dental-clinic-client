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

// ==================== DOCTOR PROFILE ====================

/**
 * Lấy thông tin profile của bác sĩ
 * @returns {Promise<object>} Thông tin bác sĩ
 */
export const getDoctorProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctor/profile`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting doctor profile:', error);
    throw error;
  }
};

/**
 * Cập nhật thông tin profile của bác sĩ
 * @param {object} profileData - Dữ liệu profile cần cập nhật
 * @returns {Promise<object>} Kết quả cập nhật
 */
export const updateDoctorProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/doctor/profile`, profileData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating doctor profile:', error);
    throw error;
  }
};

// ==================== DOCTOR APPOINTMENTS ====================

/**
 * Lấy danh sách lịch hẹn của bác sĩ
 * @param {object} filters - Bộ lọc (status, date, page, limit)
 * @returns {Promise<object>} Danh sách lịch hẹn
 */
export const getDoctorAppointments = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_BASE_URL}/doctor/appointments?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting doctor appointments:', error);
    throw error;
  }
};

/**
 * Xác nhận lịch hẹn
 * @param {string} appointmentId - ID của lịch hẹn
 * @returns {Promise<object>} Kết quả xác nhận
 */
export const confirmAppointment = async (appointmentId) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/doctor/appointments/${appointmentId}/confirm`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming appointment:', error);
    throw error;
  }
};

/**
 * Hủy lịch hẹn
 * @param {string} appointmentId - ID của lịch hẹn
 * @param {string} reason - Lý do hủy (optional)
 * @returns {Promise<object>} Kết quả hủy
 */
export const cancelAppointment = async (appointmentId, reason = '') => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/doctor/appointments/${appointmentId}/cancel`, {
      headers: getAuthHeaders(),
      data: { reason }
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling appointment:', error);
    throw error;
  }
};

// ==================== DOCTOR PATIENTS ====================

/**
 * Lấy danh sách bệnh nhân của bác sĩ
 * @param {object} filters - Bộ lọc (page, limit, search)
 * @returns {Promise<object>} Danh sách bệnh nhân
 */
export const getDoctorPatients = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_BASE_URL}/doctor/patients?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting doctor patients:', error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết bệnh nhân
 * @param {string} patientId - ID của bệnh nhân
 * @returns {Promise<object>} Thông tin chi tiết bệnh nhân
 */
export const getPatientDetails = async (patientId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctor/patients/${patientId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting patient details:', error);
    throw error;
  }
};

// ==================== DOCTOR PRESCRIPTIONS ====================

/**
 * Tạo đơn thuốc
 * @param {object} prescriptionData - Dữ liệu đơn thuốc
 * @returns {Promise<object>} Kết quả tạo đơn thuốc
 */
export const createPrescription = async (prescriptionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/doctor/prescriptions`, prescriptionData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating prescription:', error);
    throw error;
  }
};

/**
 * Lấy danh sách đơn thuốc của bác sĩ
 * @param {object} filters - Bộ lọc (page, limit, status)
 * @returns {Promise<object>} Danh sách đơn thuốc
 */
export const getDoctorPrescriptions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_BASE_URL}/doctor/prescriptions?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting doctor prescriptions:', error);
    throw error;
  }
};

// ==================== DOCTOR SCHEDULE ====================

/**
 * Lấy lịch làm việc của bác sĩ
 * @param {object} filters - Bộ lọc (startDate, endDate)
 * @returns {Promise<object>} Lịch làm việc
 */
export const getDoctorSchedule = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await axios.get(`${API_BASE_URL}/doctor/schedule?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting doctor schedule:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format date for API calls
 * @param {Date} date - Date object
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDateForAPI = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Format time for display
 * @param {string} time - Time string (HH:MM)
 * @returns {string} Formatted time string
 */
export const formatTimeForDisplay = (time) => {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

/**
 * Get status color for appointments
 * @param {string} status - Appointment status
 * @returns {string} CSS color class
 */
export const getAppointmentStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'confirmed':
      return 'green';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

/**
 * Get status text for appointments
 * @param {string} status - Appointment status
 * @returns {string} Status text in Vietnamese
 */
export const getAppointmentStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

export default {
  // Profile
  getDoctorProfile,
  updateDoctorProfile,
  
  // Appointments
  getDoctorAppointments,
  confirmAppointment,
  cancelAppointment,
  
  // Patients
  getDoctorPatients,
  getPatientDetails,
  
  // Prescriptions
  createPrescription,
  getDoctorPrescriptions,
  
  // Schedule
  getDoctorSchedule,
  
  // Utilities
  formatDateForAPI,
  formatTimeForDisplay,
  getAppointmentStatusColor,
  getAppointmentStatusText
};
