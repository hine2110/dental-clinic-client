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
 * @param {object|FormData} profileData - Dữ liệu profile cần cập nhật (có thể là FormData nếu có avatar)
 * @returns {Promise<object>} Kết quả cập nhật
 */
export const updateDoctorProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    
    // Nếu không phải FormData, set Content-Type là JSON
    if (!(profileData instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    // Nếu là FormData, không set Content-Type để browser tự động set với boundary
    
    const response = await axios.put(`${API_BASE_URL}/doctor/profile`, profileData, {
      headers
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
export const completeAppointment = async (appointmentId) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/doctor/appointments/${appointmentId}/complete`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error completing appointment:', error);
    throw error;
  }
};

/**
 * Đánh dấu bệnh nhân không đến
 * @param {string} appointmentId - ID của lịch hẹn
 * @param {string} reason - Lý do không đến (optional)
 * @returns {Promise<object>} Kết quả đánh dấu
 */
export const markNoShow = async (appointmentId, reason = '') => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/doctor/appointments/${appointmentId}/no-show`, {
      reason
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking no-show:', error);
    throw error;
  }
};

/**
 * Tạm hoãn khám bệnh
 * @param {string} appointmentId - ID của lịch hẹn
 * @param {string} reason - Lý do tạm hoãn (optional)
 * @returns {Promise<object>} Kết quả tạm hoãn
 */
export const putOnHold = async (appointmentId, reason = '') => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/doctor/appointments/${appointmentId}/on-hold`, {
      reason
    }, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error putting on hold:', error);
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
      return 'blue';
    case 'checked-in':
      return 'green';
    case 'on-hold':
      return 'orange';
    case 'in-progress':
      return 'cyan';
    case 'waiting-for-results':
      return 'gold';
    case 'in-treatment':
      return 'blue';
    case 'completed':
      return 'purple';
    case 'no-show':
      return 'gray';
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
    case 'checked-in':
      return 'Đã check-in';
    case 'on-hold':
      return 'Tạm hoãn';
    case 'in-progress':
      return 'Đang khám';
    case 'waiting-for-results':
      return 'Chờ kết quả xét nghiệm';
    case 'in-treatment':
      return 'Đang điều trị';
    case 'completed':
      return 'Đã hoàn thành';
    case 'no-show':
      return 'Không đến';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return 'Không xác định';
  }
};

// ==================== MEDICAL RECORDS ====================

/**
 * Lấy chi tiết lịch hẹn cho hồ sơ bệnh án
 * @param {string} appointmentId - ID của lịch hẹn
 * @returns {Promise<object>} Chi tiết lịch hẹn
 */
export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/doctor/appointments/${appointmentId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting appointment details:', error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái lịch hẹn và thông tin khám bệnh
 * @param {string} appointmentId - ID của lịch hẹn
 * @param {object} updateData - Dữ liệu cập nhật
 * @returns {Promise<object>} Kết quả cập nhật
 */
export const updateAppointmentStatus = async (appointmentId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/doctor/appointments/${appointmentId}`, updateData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

/**
 * Lấy danh sách thuốc theo location
 * @param {string} locationId - ID của location (bắt buộc)
 * @returns {Promise<object>} Danh sách thuốc
 */
export const getMedicines = async (locationId) => {
  try {
    if (!locationId) {
      throw new Error('locationId is required');
    }
    const response = await axios.get(`${API_BASE_URL}/doctor/medicines?locationId=${locationId}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting medicines:', error);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ nha khoa
 * @param {object} filters - Bộ lọc (category, search, page, limit)
 * @returns {Promise<object>} Danh sách dịch vụ
 */
export const getServices = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams({ ...filters, limit: 'all', isActive: true }).toString();
    const response = await axios.get(`${API_BASE_URL}/patient/services?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ xét nghiệm/chẩn đoán
 * @param {object} filters - Bộ lọc (isActive, search)
 * @returns {Promise<object>} Danh sách dịch vụ xét nghiệm
 */
export const getServiceDoctors = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams({ ...filters, limit: 'all', isActive: true }).toString();
    const response = await axios.get(`${API_BASE_URL}/doctor/service-doctors?${queryParams}`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting service doctors:', error);
    throw error;
  }
};

export default {
  // Profile
  getDoctorProfile,
  updateDoctorProfile,
  
  // Appointments
  getDoctorAppointments,
  completeAppointment,
  markNoShow,
  putOnHold,
  getAppointmentDetails,
  updateAppointmentStatus,
  
  // Patients
  getDoctorPatients,
  getPatientDetails,
  
  // Medical Records
  getMedicines,
  getServices,
  getServiceDoctors,
  
  // Schedule
  getDoctorSchedule,
  
  // Utilities
  formatDateForAPI,
  formatTimeForDisplay,
  getAppointmentStatusColor,
  getAppointmentStatusText
};
