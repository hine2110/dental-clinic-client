import React, { useState, useEffect } from 'react';
import AppointmentService from '../../services/appointmentService';
import { 
  CURRENT_LOCATION_ID, 
  AVAILABLE_TIME_SLOTS, 
  MESSAGES 
} from '../../config/appointment';

function AppointmentSection() {
  // State management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    timeSlot: '',
    doctor: '',
    reasonForVisit: ''
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Sử dụng config từ file cấu hình
  const currentLocationId = CURRENT_LOCATION_ID;
  const timeSlots = AVAILABLE_TIME_SLOTS;

  // Kiểm tra profile status khi component mount
  useEffect(() => {
    checkProfileStatus();
  }, []);

  // Lắng nghe sự kiện profile được cập nhật
  useEffect(() => {
    const handleProfileUpdate = async () => {
      // Re-check profile status when profile is updated
      await checkProfileStatus();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Kiểm tra profile có hoàn thành chưa
  const checkProfileStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, setting profile incomplete');
        setProfileComplete(false);
        setCheckingProfile(false);
        return;
      }
      setIsLoggedIn(true);

      console.log('Checking profile status...');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/patient/profile/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Profile status response:', data);
      
      if (data.success) {
        const isComplete = data.data.isProfileComplete || false;
        console.log('Profile complete status:', isComplete);
        setProfileComplete(isComplete);
      } else {
        console.log('Profile status check failed:', data.message);
        setProfileComplete(false);
      }
    } catch (err) {
      console.error('Error checking profile status:', err);
      setProfileComplete(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  // Lấy danh sách giờ khả dụng khi chọn ngày
  const fetchAvailableTimeSlots = async (date) => {
    try {
      console.log('Fetching available time slots for date:', date, 'location:', currentLocationId);
      const data = await AppointmentService.getAvailableTimeSlots(date, currentLocationId);
      console.log('Available time slots response:', data);
      setAvailableTimeSlots(data.data.timeSlots);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError(err.message || 'Lỗi kết nối server');
    }
  };

  // Lấy danh sách bác sĩ khi chọn giờ
  const fetchAvailableDoctors = async (date, time) => {
    try {
      const data = await AppointmentService.getAvailableDoctors(date, time, currentLocationId);
      setAvailableDoctors(data.data.doctors);
    } catch (err) {
      setError(err.message || 'Lỗi kết nối server');
      setAvailableDoctors([]);
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset error khi user thay đổi input
    if (error) setError('');

    // Khi chọn ngày, lấy danh sách giờ khả dụng
    if (name === 'date' && value) {
      fetchAvailableTimeSlots(value);
      // Reset các field phụ thuộc
      setFormData(prev => ({
        ...prev,
        timeSlot: '',
        doctor: ''
      }));
      setAvailableDoctors([]);
    }

    // Khi chọn giờ, lấy danh sách bác sĩ
    if (name === 'timeSlot' && value && formData.date) {
      fetchAvailableDoctors(formData.date, value);
      // Reset doctor selection
      setFormData(prev => ({
        ...prev,
        doctor: ''
      }));
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
  e.preventDefault();

  // Kiểm tra đăng nhập trước
  if (!isLoggedIn) {
    setError("Vui lòng đăng nhập để đặt lịch hẹn.");
    window.dispatchEvent(new CustomEvent('openLoginModal'));
    return;
  }

  setLoading(true);
  setError('');

  try {
    // Kiểm tra đã hoàn thành hồ sơ chưa
    if (!profileComplete) {
      setError("Vui lòng hoàn thành hồ sơ của bạn trước khi đặt lịch.");
      setLoading(false);
      return;
    }

    // Kiểm tra thông tin form
    if (!formData.date || !formData.timeSlot || !formData.doctor) {
      setError("Vui lòng điền đầy đủ thông tin ngày, giờ và bác sĩ.");
      setLoading(false);
      return;
    }

    // Tạo Stripe Checkout Session và redirect
    const response = await AppointmentService.createStripeCheckoutSession({
      doctorId: formData.doctor,
      date: formData.date,
      time: formData.timeSlot,
      reasonForVisit: formData.reasonForVisit
    });

    if (response.success && response.url) {
      window.location.href = response.url;
      return; // redirecting
    }

    throw new Error(response.message || 'Không nhận được URL thanh toán');

  } catch (err) {
    setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    setLoading(false); // Chỉ setLoading(false) khi có lỗi
  }
};

  // Show loading while checking profile
  if (checkingProfile) {
    return (
      <section id="appointment" className="appointment section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Make an Appointment</h2>
          <p>Book an appointment with our specialist doctors</p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="text-center">
            <div className="loading">{MESSAGES.LOADING}</div>
          </div>
        </div>
      </section>
    );
  }

  // Show profile incomplete message
  if (isLoggedIn && !profileComplete) {
    return (
      <section id="appointment" className="appointment section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Make an Appointment</h2>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="alert alert-warning text-center">
            <h4>{MESSAGES.PROFILE_REQUIRED}</h4>
            <p>{MESSAGES.PROFILE_INCOMPLETE_MESSAGE}</p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                const event = new CustomEvent('openProfileModal');
                window.dispatchEvent(event);
              }}
            >
              Complete Profile
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="appointment" className="appointment section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Make an Appointment</h2>
        <p>Book an appointment with our specialist doctors</p>
      </div>

      <div className="container" data-aos="fade-up" data-aos-delay="100">
        <form onSubmit={handleSubmit} className="php-email-form">
          <div className="row">
            <div className="col-md-4 form-group">
              <input 
                type="text" 
                name="name" 
                className="form-control" 
                id="name" 
                placeholder="Your Name" 
                value={formData.name}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="col-md-4 form-group mt-3 mt-md-0">
              <input 
                type="email" 
                className="form-control" 
                name="email" 
                id="email" 
                placeholder="Your Email" 
                value={formData.email}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="col-md-4 form-group mt-3 mt-md-0">
              <input 
                type="tel" 
                className="form-control" 
                name="phone" 
                id="phone" 
                placeholder="Your Phone" 
                value={formData.phone}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-4 form-group mt-3">
              <input 
                type="date" 
                name="date" 
                className="form-control" 
                id="date" 
                placeholder="Select Date" 
                value={formData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]} // Prevent selecting past dates
                required 
              />
            </div>
            <div className="col-md-4 form-group mt-3">
              <select 
                name="timeSlot" 
                id="timeSlot" 
                className="form-select" 
                value={formData.timeSlot}
                onChange={handleInputChange}
                required
                disabled={!formData.date}
              >
                <option value="">Select Time Slot</option>
                {timeSlots.map(slot => {
                  const isAvailable = availableTimeSlots.find(ts => ts.time === slot.value)?.isAvailable;
                  return (
                    <option 
                      key={slot.value} 
                      value={slot.value}
                      disabled={!isAvailable}
                    >
                      {slot.label} {!isAvailable ? '(Not Available)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-md-4 form-group mt-3">
              <select 
                name="doctor" 
                id="doctor" 
                className="form-select" 
                value={formData.doctor}
                onChange={handleInputChange}
                required
                disabled={!formData.timeSlot}
              >
                <option value="">Select Doctor</option>
                {availableDoctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.user?.fullName || 'Doctor'} - {doctor.specializations?.join(', ') || 'General Dentistry'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group mt-3">
            <textarea 
              className="form-control" 
              name="reasonForVisit" 
              rows="5" 
              placeholder="Message (Optional)"
              value={formData.reasonForVisit}
              onChange={handleInputChange}
            ></textarea>
          </div>
          <div className="mt-3">
            {loading && <div className="loading">{MESSAGES.LOADING}</div>}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="sent-message">{MESSAGES.SUCCESS}</div>}
            <div className="text-center">
              <button type="submit" disabled={loading}>
                {loading ? MESSAGES.LOADING : 'Make an Appointment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default AppointmentSection;
