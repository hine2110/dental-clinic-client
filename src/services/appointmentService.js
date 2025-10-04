// Service để quản lý API đặt lịch hẹn
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AppointmentService {
  // Lấy danh sách giờ khả dụng
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

  // Lấy danh sách bác sĩ khả dụng
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

  // Đặt lịch hẹn
  static async createAppointment(appointmentData) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập để đặt lịch hẹn');
      }

      const response = await fetch(`${API_BASE_URL}/patient/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Lỗi khi đặt lịch hẹn');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  // Lấy danh sách lịch hẹn của bệnh nhân
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

  // Hủy lịch hẹn
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
}

export default AppointmentService;
