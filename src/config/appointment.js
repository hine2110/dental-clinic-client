// Cấu hình cho chức năng đặt lịch hẹn

// ID của bệnh viện hiện tại (vì chỉ có 1 bệnh viện)
// Thay đổi giá trị này theo ID thực tế của bệnh viện trong database
export const CURRENT_LOCATION_ID = '68d21edd35da0285bcf6ba82';

// Tên bệnh viện hiện tại
export const CURRENT_LOCATION_NAME = 'Nha Khoa ABC';

// Khung giờ khả dụng cho đặt lịch
export const AVAILABLE_TIME_SLOTS = [
  { value: '07:00', label: '7h' },
  { value: '08:00', label: '8h' },
  { value: '09:00', label: '9h' },
  { value: '10:00', label: '10h' },
  { value: '11:00', label: '11h' },
  { value: '13:00', label: '13h' },
  { value: '14:00', label: '14h' },
  { value: '15:00', label: '15h' },
  { value: '16:00', label: '16h' }
];

// Cấu hình validation
export const VALIDATION_RULES = {
  MIN_ADVANCE_BOOKING_HOURS: 2, // Tối thiểu 2 giờ trước khi đặt lịch
  MAX_ADVANCE_BOOKING_DAYS: 30, // Tối đa 30 ngày trước khi đặt lịch
  APPOINTMENT_DURATION_MINUTES: 60 // Thời gian mỗi lịch hẹn (phút)
};

// Default messages
export const MESSAGES = {
  SUCCESS: 'Appointment booked successfully! We will contact you soon.',
  ERROR_GENERAL: 'An error occurred. Please try again later.',
  ERROR_VALIDATION: 'Please fill in all required information.',
  ERROR_NETWORK: 'Network error. Please check your internet connection.',
  ERROR_AUTH: 'Please login to book an appointment.',
  ERROR_PROFILE_INCOMPLETE: 'Please complete your profile before booking an appointment.',
  LOADING: 'Processing...',
  NO_DOCTORS_AVAILABLE: 'No doctors available in this time slot.',
  NO_TIME_SLOTS_AVAILABLE: 'No time slots available for this date.',
  PROFILE_REQUIRED: 'Profile completion required',
  PROFILE_INCOMPLETE_MESSAGE: 'You need to complete your profile before booking an appointment. Please go to your profile page and fill in all required information.'
};
