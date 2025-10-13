// Service để quản lý các API liên quan đến lịch hẹn
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AppointmentService {
  /**
   * Lấy danh sách các khung giờ có thể đặt lịch trong một ngày cụ thể.
   * @param {string} date - Ngày theo định dạng YYYY-MM-DD
   * @param {string} locationId - ID của cơ sở
   * @returns {Promise<object>} Dữ liệu trả về từ API
   */
  static async getAvailableTimeSlots(date, locationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/patient/appointments/available-times?date=${date}&locationId=${locationId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách giờ khả dụng');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách bác sĩ rảnh trong một khung giờ cụ thể.
   * @param {string} date - Ngày theo định dạng YYYY-MM-DD
   * @param {string} time - Giờ theo định dạng HH:MM
   * @param {string} locationId - ID của cơ sở
   * @returns {Promise<object>} Dữ liệu trả về từ API
   */
  static async getAvailableDoctors(date, time, locationId) {
    try {
      const response = await fetch(`${API_BASE_URL}/patient/appointments/available-doctors?date=${date}&time=${time}&locationId=${locationId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách bác sĩ');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      throw error;
    }
  }

  /**
   * Tạo phiên thanh toán Stripe Checkout và trả về URL để redirect
   */
  static async createStripeCheckoutSession(appointmentData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để đặt lịch hẹn');
      }

      const response = await fetch(`${API_BASE_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tạo phiên thanh toán');
      }
      return data;
    } catch (error) {
      console.error('Error creating Stripe Checkout session:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả lịch hẹn của bệnh nhân đã đăng nhập.
   * @param {object} filters - Các bộ lọc tùy chọn (ví dụ: { status: 'confirmed' })
   * @returns {Promise<object>} Dữ liệu trả về từ API
   */
  static async getPatientAppointments(filters = {}) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`${API_BASE_URL}/patient/appointments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy danh sách lịch hẹn');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  }

  /**
   * Gửi yêu cầu hủy một lịch hẹn.
   * @param {string} appointmentId - ID của lịch hẹn cần hủy
   * @returns {Promise<object>} Dữ liệu trả về từ API
   */
  static async cancelAppointment(appointmentId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const response = await fetch(`${API_BASE_URL}/patient/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi hủy lịch hẹn');
      }
      
      return data;
    } catch (error) {
      console.error('Error canceling appointment:', error);
      throw error;
    }
  }

  static async getDoctorAvailableSlots(doctorId, date) {
    try {
      const response = await fetch(`${API_BASE_URL}/reschedule/available-slots?doctorId=${doctorId}&date=${date}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi lấy giờ trống của bác sĩ.');
      }
      return data;
    } catch (error) {
      console.error('Error fetching doctor available slots:', error);
      throw error;
    }
  }
  // Thêm hàm mới này vào file services/appointmentService.js

  /**
   * Yêu cầu backend tạo token để đổi lịch hẹn.
   * @param {string} appointmentId - ID của lịch hẹn cần tạo link
   * @returns {Promise<object>} Dữ liệu trả về từ API, chứa token
   */
  static async generateRescheduleLink(appointmentId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const response = await fetch(`${API_BASE_URL}/staff/receptionist/appointments/${appointmentId}/generate-reschedule-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi tạo link đổi lịch');
      }
      
      return data;
    } catch (error) {
      console.error('Error generating reschedule link:', error);
      throw error;
    }
  }
  static async verifyRescheduleToken(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/reschedule/verify?token=${token}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Token không hợp lệ hoặc đã hết hạn.');
      }
      return data;
    } catch (error) {
      console.error('Error verifying reschedule token:', error);
      throw error;
    }
  }
    static async updateRescheduledAppointment(token, newDate, newTime) {
    try {
      const response = await fetch(`${API_BASE_URL}/reschedule/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newDate, newTime })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi cập nhật lịch hẹn.');
      }
      return data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  }

}

export default AppointmentService;