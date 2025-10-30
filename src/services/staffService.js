const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class StaffService {

// === THÊM HÀM MỚI 1: TÌM CCCD ===
  static async findPatientByIdCard(idCard) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Yêu cầu đăng nhập (Lễ tân)');

      const response = await fetch(`${API_BASE_URL}/staff/receptionist/patients/find-by-idcard/${idCard}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
         // Ném lỗi với message từ server (ví dụ: "Không tìm thấy")
         const error = new Error(data.message || `Lỗi ${response.status}`);
         error.data = data; 
         throw error;
      }
      return data; // { success: true, action: '...', data: ... }
      
    } catch (error) {
      console.error('Error finding patient by ID card:', error);
      throw error;
    }
  }

// === THÊM HÀM MỚI 2: XẾP HÀNG TỰ ĐỘNG ===
  static async queueWalkInPatient(payload) {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Yêu cầu đăng nhập (Lễ tân)');

      const response = await fetch(`${API_BASE_URL}/staff/receptionist/queue-walk-in-patient`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
         const error = new Error(data.message || `Lỗi ${response.status}`);
         error.data = data; 
         throw error;
      }
      return data;
      
    } catch (error) {
      console.error('Error queuing walk-in patient:', error);
      throw error;
    }
  }

  static async getAvailableDoctors(locationId, date, time) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Yêu cầu đăng nhập (Lễ tân)');
      }
      
      const params = new URLSearchParams({ locationId, date, time });
      const response = await fetch(`${API_BASE_URL}/staff/receptionist/available-doctors?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
         const error = new Error(data.message || `Lỗi ${response.status}`);
         error.data = data; 
         throw error;
      }
      return data;
      
    } catch (error) {
      console.error('Error getting available doctors:', error);
      throw error;
    }
  }
  
}

export default StaffService;