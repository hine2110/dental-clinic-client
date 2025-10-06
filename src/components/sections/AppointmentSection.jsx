import React, { useState, useEffect, useRef } from 'react';
import AppointmentService from '../../services/appointmentService';
import { 
  CURRENT_LOCATION_ID, 
  AVAILABLE_TIME_SLOTS, 
  MESSAGES 
} from '../../config/appointment';
import './AppointmentSection.css';

function AppointmentSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    timeSlot: '',
    doctor: '',
    reasonForVisit: ''
  });

  const [isLoggedIn, setIsLoggedIn] = useState(true); // Giả định đã đăng nhập để test
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // <<<< SỬA LỖI: Thêm dòng này
  const [profileComplete, setProfileComplete] = useState(true); // Giả định đã hoàn thành profile để test
  const [checkingProfile, setCheckingProfile] = useState(false); // Tạm thời tắt check

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const timePickerRef = useRef(null);
  
  const currentLocationId = CURRENT_LOCATION_ID;
  const timeSlots = AVAILABLE_TIME_SLOTS;

  // Xử lý đóng popup khi click ra bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
        setIsTimePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [timePickerRef]);

  const fetchAvailableTimeSlots = async (date) => {
    try {
      const data = await AppointmentService.getAvailableTimeSlots(date, currentLocationId);
      setAvailableTimeSlots(data.data.timeSlots);
    } catch (err) {
      setError(err.message || 'Lỗi kết nối server');
    }
  };

  const fetchAvailableDoctors = async (date, time) => {
    try {
      const data = await AppointmentService.getAvailableDoctors(date, time, currentLocationId);
      setAvailableDoctors(data.data.doctors);
    } catch (err) {
      setError(err.message || 'Lỗi kết nối server');
      setAvailableDoctors([]);
    }
  };

  const handleInputChange = (e) => { 
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (error) setError('');

    if (name === 'date' && value) {
      fetchAvailableTimeSlots(value);
      setFormData(prev => ({ ...prev, timeSlot: '', doctor: '' }));
      setAvailableDoctors([]);
      setIsTimePickerOpen(true); // Tự động mở popup khi chọn ngày
    }
  };

  const handleTimeSlotSelect = (time) => {
    setFormData(prev => ({ ...prev, timeSlot: time, doctor: '' }));
    if (formData.date) {
      fetchAvailableDoctors(formData.date, time);
    }
    setIsTimePickerOpen(false); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!isLoggedIn) {
        setError("Vui lòng đăng nhập để đặt lịch hẹn.");
        window.dispatchEvent(new CustomEvent('openLoginModal'));
        setLoading(false);
        return;
      }
      if (!profileComplete) {
        setError("Vui lòng hoàn thành hồ sơ của bạn trước khi đặt lịch.");
        setLoading(false);
        return;
      }
      if (!formData.date || !formData.timeSlot || !formData.doctor) {
        setError("Vui lòng điền đầy đủ thông tin ngày, giờ và bác sĩ.");
        setLoading(false);
        return;
      }
      const response = await AppointmentService.createStripeCheckoutSession({
        doctorId: formData.doctor,
        date: formData.date,
        time: formData.timeSlot,
        reasonForVisit: formData.reasonForVisit
      });

      if (response.success && response.url) {
        // Có thể setSuccess ở đây nhưng người dùng sẽ được chuyển trang ngay lập tức
        // setSuccess('Đang chuyển hướng đến trang thanh toán...');
        window.location.href = response.url;
      } else {
        throw new Error(response.message || 'Không nhận được URL thanh toán');
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false);
    }
  };

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
            <div className="col-md-4 form-group mt-3 ">
              <div className="custom-select-wrapper" ref={timePickerRef}>
                <button 
                  type="button"
                  className={`form-control time-select-trigger ${isTimePickerOpen ? 'open' : ''}`}
                  onClick={() => setIsTimePickerOpen(!isTimePickerOpen)}
                  disabled={!formData.date}
                >
                  {formData.timeSlot ? `${formData.timeSlot.slice(0, 5)}` : <span className="placeholder">Select Time Slot</span>}
                </button>
                {isTimePickerOpen && (
                  <div className="time-picker-popup">
                    <div className="time-slot-grid">
                      {timeSlots.map(slot => {
                        const timeSlotInfo = availableTimeSlots.find(ts => ts.time === slot.value);
                        const isAvailable = timeSlotInfo && timeSlotInfo.isAvailable;
                        const isSelected = formData.timeSlot === slot.value;
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            className={`time-slot-button ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleTimeSlotSelect(slot.value)}
                            disabled={!isAvailable}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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
          <div className="my-3">
            {loading && <div className="loading">{MESSAGES.LOADING}</div>}
            {error && <div className="error-message">{error}</div>}
            {success && <div className="sent-message">{success}</div>}
          </div>
          <div className="text-center">
            <button type="submit" disabled={loading}>
              {loading ? MESSAGES.LOADING : 'Make an Appointment'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
export default AppointmentSection;