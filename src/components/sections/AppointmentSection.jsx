import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AppointmentService from '../../services/appointmentService';
import { 
  CURRENT_LOCATION_ID, 
  AVAILABLE_TIME_SLOTS, 
  MESSAGES,
  VALIDATION_RULES
} from '../../config/appointment';

// --- Bắt đầu Component TimeSlotModal (Tích hợp trực tiếp) ---
function TimeSlotModal({
  isOpen,
  onClose,
  timeSlots,
  apiTimeSlots,
  onSelectTime,
  selectedValue
}) {
  if (!isOpen) {
    return null;
  }

  const handleTimeSelect = (slot) => {
    onSelectTime(slot.value);
    onClose();
  };

  const modalStyles = `
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 15px;
    }
    .modal-content {
      background: white; padding: 25px; border-radius: 12px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
      width: 100%; max-width: 480px;
      animation: fadeIn 0.3s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 20px;
    }
    .modal-header h3 { margin: 0; font-size: 1.25rem; color: #333; }
    .close-button {
      background: none; border: none; font-size: 2rem;
      font-weight: 300; line-height: 1; cursor: pointer; color: #888; padding: 0;
    }
    .close-button:hover { color: #000; }
    .time-slot-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); gap: 15px;
    }
    .time-slot-button {
      padding: 12px 10px; font-size: 1rem; border: 1px solid #007bff;
      color: #007bff; background-color: #fff; border-radius: 8px;
      cursor: pointer; transition: all 0.2s ease; font-weight: 500;
    }
    .time-slot-button:hover:not(:disabled) {
      background-color: #007bff; color: white; transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
    }
    .time-slot-button.selected {
      background-color: #0056b3; color: white; border-color: #0056b3;
    }
    .time-slot-button:disabled {
      background-color: #f8f9fa; color: #adb5bd; border-color: #dee2e6;
      cursor: not-allowed;
    }
    .no-slots-message {
      grid-column: 1 / -1; text-align: center; color: #6c757d; padding: 20px;
    }
  `;

  return createPortal(
    <>
      <style>{modalStyles}</style>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Select a Time Slot</h3>
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>
          <div className="time-slot-grid">
            {timeSlots.length > 0 ? (
              timeSlots.map(slot => {
                const apiSlot = apiTimeSlots.find(ts => ts.time === slot.value);
                const isAvailable = apiSlot ? apiSlot.isAvailable : false;
                const isSelected = selectedValue === slot.value;

                return (
                  <button
                    key={slot.value}
                    className={`time-slot-button ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleTimeSelect(slot)}
                    disabled={!isAvailable}
                  >
                    {slot.label}
                  </button>
                );
              })
            ) : (
              <p className="no-slots-message">No more time slots available for this day.</p>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
// --- Kết thúc Component TimeSlotModal ---


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
  const [apiTimeSlots, setApiTimeSlots] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false); // State cho modal

  const currentLocationId = CURRENT_LOCATION_ID;
  const staticTimeSlots = AVAILABLE_TIME_SLOTS;
  const [displayableTimeSlots, setDisplayableTimeSlots] = useState(staticTimeSlots);

  useEffect(() => {
    checkProfileStatus();
  }, []);
  
  useEffect(() => {
    const isToday = (someDate) => {
      if (!someDate) return false;
      const today = new Date();
      const dateToCompare = new Date(someDate);
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const compareDateStart = new Date(dateToCompare.getFullYear(), dateToCompare.getMonth(), dateToCompare.getDate());
      return todayStart.getTime() === compareDateStart.getTime();
    };

    if (isToday(formData.date)) {
      const bookingDeadline = new Date(
        Date.now() + (VALIDATION_RULES.MIN_ADVANCE_BOOKING_HOURS || 2) * 60 * 60 * 1000
      );

      const futureSlots = staticTimeSlots.filter(slot => {
        const [hour, minute] = slot.value.split(':');
        const slotDateTime = new Date(formData.date);
        slotDateTime.setHours(hour, minute, 0, 0);
        return slotDateTime > bookingDeadline;
      });
      setDisplayableTimeSlots(futureSlots);
    } else {
      setDisplayableTimeSlots(staticTimeSlots);
    }
  }, [formData.date]);

  useEffect(() => {
    const handleProfileUpdate = async () => {
      await checkProfileStatus();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const checkProfileStatus = async () => {
    setCheckingProfile(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setProfileComplete(false);
        return;
      }
      setIsLoggedIn(true);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/patient/profile/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (data.success) {
        setProfileComplete(data.data.isProfileComplete || false);
      } else {
        setProfileComplete(false);
      }
    } catch (err) {
      console.error('Error checking profile status:', err);
      setProfileComplete(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  const fetchAvailableTimeSlots = async (date) => {
    try {
      const data = await AppointmentService.getAvailableTimeSlots(date, currentLocationId);
      setApiTimeSlots(data.data.timeSlots || []);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError(err.message || 'Lỗi kết nối server');
      setApiTimeSlots([]);
    }
  };

  const fetchAvailableDoctors = async (date, time) => {
    try {
      const data = await AppointmentService.getAvailableDoctors(date, time, currentLocationId);
      setAvailableDoctors(data.data.doctors || []);
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
      setFormData(prev => ({ ...prev, date: value, timeSlot: '', doctor: '' }));
      setAvailableDoctors([]);
    }
  };
  
  // Hàm mới để xử lý việc chọn giờ từ Modal
  const handleSelectTime = (timeValue) => {
    setFormData(prev => ({ ...prev, timeSlot: timeValue, doctor: '' })); // Reset doctor
    if (formData.date) {
      fetchAvailableDoctors(formData.date, timeValue);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setError("Vui lòng đăng nhập để đặt lịch hẹn.");
      window.dispatchEvent(new CustomEvent('openLoginModal'));
      return;
    }

    if (!profileComplete) {
      setError("Vui lòng hoàn thành hồ sơ của bạn trước khi đặt lịch.");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      if (!formData.date || !formData.timeSlot || !formData.doctor) {
        throw new Error("Vui lòng điền đầy đủ thông tin ngày, giờ và bác sĩ.");
      }

      const response = await AppointmentService.createStripeCheckoutSession({
        doctorId: formData.doctor,
        date: formData.date,
        time: formData.timeSlot,
        reasonForVisit: formData.reasonForVisit
      });

      if (response.success && response.url) {
        window.location.href = response.url;
        return; 
      }

      throw new Error(response.message || 'Không nhận được URL thanh toán');

    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      setLoading(false);
    }
  };

  if (checkingProfile) {
    return (
      <section id="appointment" className="appointment section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Make an Appointment</h2>
        </div>
        <div className="container text-center" data-aos="fade-up" data-aos-delay="100">
          <div className="loading">{MESSAGES.LOADING}</div>
        </div>
      </section>
    );
  }

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
              onClick={() => window.dispatchEvent(new CustomEvent('openProfileModal'))}
            >
              Complete Profile
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="appointment" className="appointment section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Make an Appointment</h2>
          <p>Book an appointment with our specialist doctors</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <form onSubmit={handleSubmit} className="php-email-form">
            <div className="row">
              <div className="col-md-4 form-group">
                <input type="text" name="name" className="form-control" placeholder="Your Name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="col-md-4 form-group mt-3 mt-md-0">
                <input type="email" className="form-control" name="email" placeholder="Your Email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="col-md-4 form-group mt-3 mt-md-0">
                <input type="tel" className="form-control" name="phone" placeholder="Your Phone" value={formData.phone} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 form-group mt-3">
                <input type="date" name="date" className="form-control" placeholder="Select Date" value={formData.date} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="col-md-4 form-group mt-3">
                <div 
                  className="form-control" 
                  onClick={() => formData.date && setIsTimeModalOpen(true)}
                  style={{ cursor: formData.date ? 'pointer' : 'not-allowed', color: formData.timeSlot ? '#333' : '#6c757d' }}
                >
                  {formData.timeSlot ? staticTimeSlots.find(s => s.value === formData.timeSlot)?.label : 'Select Time Slot'}
                </div>
              </div>
              <div className="col-md-4 form-group mt-3">
                <select name="doctor" className="form-select" value={formData.doctor} onChange={handleInputChange} required disabled={!formData.timeSlot}>
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
              <textarea className="form-control" name="reasonForVisit" rows="5" placeholder="Message (Optional)" value={formData.reasonForVisit} onChange={handleInputChange}></textarea>
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

      <TimeSlotModal
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        timeSlots={displayableTimeSlots}
        apiTimeSlots={apiTimeSlots}
        onSelectTime={handleSelectTime}
        selectedValue={formData.timeSlot}
      />
    </>
  );
}

export default AppointmentSection;

