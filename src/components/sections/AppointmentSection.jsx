// File: src/components/AppointmentSection.jsx
// Updated: Restored modal logic instead of redirecting to /login

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// KHÔNG CẦN: useNavigate và useLocation đã bị xóa
import AppointmentService from '../../services/appointmentService';
import { getPatientProfile } from '../../services/patientService';
import { useAuth } from '../../context/authContext';
import {
  AVAILABLE_TIME_SLOTS,
  MESSAGES,
  VALIDATION_RULES
} from '../../config/appointment';
import './AppointmentSection.css'; // Import CSS for notifications and errors

// --- Notification Component (Không thay đổi) ---
const Notification = ({ message, type, onDismiss }) => {
    // ... (Giữ nguyên) ...
      useEffect(() => {
    const timer = setTimeout(() => onDismiss(), 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isError = type === 'error';
  const icon = isError ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill';
  const backgroundColor = isError ? '#f8d7da' : '#d1e7dd';
  const color = isError ? '#58151c' : '#0f5132';
  const borderColor = isError ? '#f5c2c7' : '#badbcc';

  return (
    <div className="custom-notification" style={{ backgroundColor, color, borderColor }}>
      <i className={`bi ${icon}`} style={{ marginRight: '10px', fontSize: '1.2rem' }}></i>
      {message}
      <button className="dismiss-button" onClick={onDismiss} style={{ color }}>&times;</button>
      <div className="progress-bar" style={{ backgroundColor: color }}></div>
    </div>
  );
};

// --- TimeSlotModal Component (Không thay đổi) ---
function TimeSlotModal({
  isOpen,
  onClose,
  timeSlots,
  apiTimeSlots,
  onSelectTime,
  selectedValue
}) {
  // ... (Giữ nguyên toàn bộ code của TimeSlotModal) ...
  if (!isOpen) {
    return null;
  }

  const handleTimeSelect = (slot) => {
    const apiSlot = apiTimeSlots.find(ts => ts.time === slot.value);
    const isAvailable = apiSlot ? apiSlot.isAvailable : false;
    if (isAvailable) {
      onSelectTime(slot.value);
      onClose();
    }
  };

  const modalStyles = `
    .modal-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background-color: rgba(0, 0, 0, 0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; padding: 15px;
      backdrop-filter: blur(3px);
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
      display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
       gap: 10px;
    }
    .time-slot-button {
      padding: 10px 8px;
      font-size: 0.9rem;
      border: 1px solid #007bff;
      color: #007bff; background-color: #fff; border-radius: 6px;
      cursor: pointer; transition: all 0.2s ease; font-weight: 500;
      text-align: center;
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
      cursor: not-allowed; text-decoration: line-through;
       opacity: 0.6;
    }
    .no-slots-message {
      grid-column: 1 / -1; text-align: center; color: #6c757d; padding: 20px;
      font-style: italic;
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
            {timeSlots && timeSlots.length > 0 ? (
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

// --- Main AppointmentSection Component ---
function AppointmentSection() {
  const { user } = useAuth();
  // KHÔNG CẦN: Xóa navigate và location
  const [locations, setLocations] = useState([]);

  // ... (Tất cả useState và useEffect khác giữ nguyên) ...
  // ... (Giữ nguyên toàn bộ logic state và effects) ...
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
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
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const staticTimeSlots = AVAILABLE_TIME_SLOTS;
  const [displayableTimeSlots, setDisplayableTimeSlots] = useState(staticTimeSlots);

  useEffect(() => {
    // ... (Giữ nguyên fetchProfileAndPopulateForm) ...
    const fetchProfileAndPopulateForm = async () => {
      setCheckingProfile(true); // Start check
      if (user) {
        setIsLoggedIn(true);
        try {
          const profileData = await getPatientProfile(); // Fetch profile API
          if (profileData && profileData.success && profileData.data) {
            const profile = profileData.data;
            // Autofill form data
            setFormData(prev => ({
              ...prev,
              name: profile.basicInfo?.fullName || '',
              email: profile.contactInfo?.email || user.email || '', // Prioritize profile email
              phone: profile.contactInfo?.phone || ''
            }));
            // Update profile completion status
            setProfileComplete(profile.isProfileComplete || false);
          } else {
            setProfileComplete(false); // Assume incomplete if profile fetch fails partially
          }
        } catch (err) {
          console.error('Error fetching profile for form:', err);
          setProfileComplete(false); // Assume incomplete on error
        }
      } else {
        setIsLoggedIn(false);
        setProfileComplete(false);
        // Reset form on logout
        setFormData({
          name: '', email: '', phone: '', location: '',
          date: '', timeSlot: '', doctor: '', reasonForVisit: ''
        });
      }
      setCheckingProfile(false); // End check
    };

    fetchProfileAndPopulateForm();
  }, [user]);

  useEffect(() => {
    // ... (Giữ nguyên fetchLocations) ...
        const fetchLocations = async () => {
      try {
        const response = await AppointmentService.getLocations();
        if (response.success) {
          setLocations(response.data);
        }
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    // ... (Giữ nguyên logic filter time slots) ...
        const isToday = (someDate) => {
      if (!someDate) return false;
      const today = new Date();
      const dateToCompare = new Date(someDate);
      return today.toDateString() === dateToCompare.toDateString();
    };

    if (formData.date && isToday(formData.date)) {
      const bookingDeadline = new Date(
        Date.now() + (VALIDATION_RULES.MIN_ADVANCE_BOOKING_HOURS || 2) * 60 * 60 * 1000
      );
      const futureSlots = staticTimeSlots.filter(slot => {
        const [hour, minute] = slot.value.split(':');
        const slotDateTime = new Date(formData.date);
        slotDateTime.setHours(parseInt(hour, 10), parseInt(minute, 10), 0, 0);
        return slotDateTime > bookingDeadline;
      });
      setDisplayableTimeSlots(futureSlots);
    } else {
      setDisplayableTimeSlots(staticTimeSlots); // Show all slots if not today
    }
  }, [formData.date, staticTimeSlots]);

  useEffect(() => {
    // ... (Giğữ nguyên handleProfileUpdate) ...
        const handleProfileUpdate = async () => {
       if (user) {
           try {
               const profileData = await getPatientProfile(); // Re-fetch profile
               if (profileData && profileData.success && profileData.data) {
                  setProfileComplete(profileData.data.isProfileComplete || false); // Update status
               }
           } catch(err) { console.error("Error re-checking profile after update", err); }
       }
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  const fetchAvailableTimeSlots = async (date, locationId) => {
    // ... (Giữ nguyên) ...
        if (!date || !locationId) return;
    setError(''); // Clear previous errors
    try {
      const data = await AppointmentService.getAvailableTimeSlots(date, locationId);
      setApiTimeSlots(data.data.timeSlots || []);
    } catch (err) {
      console.error('Error fetching time slots:', err);
      setError(err.message || 'Error connecting to server');
      setApiTimeSlots([]);
    }
  };

  const fetchAvailableDoctors = async (date, time, locationId) => {
    // ... (Giữ nguyên) ...
        if (!date || !time || !locationId) {
      setAvailableDoctors([]);
      return;
    }
    setError(''); // Clear previous errors
    try {
      const data = await AppointmentService.getAvailableDoctors(date, time, locationId);
      setAvailableDoctors(data.data.doctors || []);
    } catch (err) {
      console.error('Error fetching available doctors:', err);
      setError(err.message || 'Error connecting to server');
      setAvailableDoctors([]);
    }
  };

  const handleInputChange = (e) => {
    // ... (Giữ nguyên) ...
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'location') {
      setFormData(prev => ({ ...prev, date: '', timeSlot: '', doctor: '' }));
      setApiTimeSlots([]);
      setAvailableDoctors([]);
      setError('');
    }
    if (name === 'date') {
      if (value && formData.location) {
        fetchAvailableTimeSlots(value, formData.location);
      } else {
         setApiTimeSlots([]);
      }
      setFormData(prev => ({ ...prev, timeSlot: '', doctor: '' }));
      setAvailableDoctors([]);
      setError('');
    }
  };

  const handleSelectTime = (timeValue) => {
    // ... (Giữ nguyên) ...
    setFormData(prev => ({ ...prev, timeSlot: timeValue, doctor: '' })); // Reset doctor
    if (formData.date && formData.location) {
      fetchAvailableDoctors(formData.date, timeValue, formData.location);
    }
    setError(''); // Clear errors on selection
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    // 1. Check login status
    // --- THAY ĐỔI: PHỤC HỒI LOGIC GỐC ---
    if (!isLoggedIn) {
      setNotification({ message: "Please log in to make an appointment.", type: 'error' });
      // Dòng này sẽ gọi modal, giả sử bạn có listener ở App.jsx
      window.dispatchEvent(new CustomEvent('openLoginModal')); 
      return;
    }
    // --- KẾT THÚC THAY ĐỔI ---
    // 2. Profile check already handled by UI rendering
    // 3. Check required fields
    if (!formData.location || !formData.date || !formData.timeSlot || !formData.doctor) {
      setError("Please select location, date, time, and doctor.");
      return;
    }

    setLoading(true); // Start submission loading

    try {
      // ... (Giữ nguyên logic gọi Stripe) ...
      const response = await AppointmentService.createStripeCheckoutSession({
        doctorId: formData.doctor,
        locationId: formData.location,
        date: formData.date,
        time: formData.timeSlot,
        reasonForVisit: formData.reasonForVisit
      });

      if (response.success && response.url) {
        window.location.href = response.url;
        return;
      }

      throw new Error(response.message || 'Could not retrieve payment URL.');

    } catch (err) {
      console.error('Error submitting appointment:', err);
      let message = err.message || "An error occurred. Please try again.";

      if (message.includes("Rất tiếc, giờ hẹn này")) {
        message = "Sorry, this time slot was just booked by someone else. Please select a different time.";
      }
      setError(message); 
      setLoading(false);
    }
  };

  // --- UI Rendering ---
  // ... (Toàn bộ phần return JSX giữ nguyên) ...
  if (checkingProfile) {
    return (
      <section id="appointment" className="appointment section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Make an Appointment</h2>
        </div>
        <div className="container text-center" data-aos="fade-up" data-aos-delay="100">
          <div className="loading-container" style={{padding: '50px 0'}}>
              <div className="loading-spinner"></div>
              <p style={{marginTop: '15px', color: '#6c757d'}}>Checking profile status...</p>
          </div>
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
          <div className="alert alert-warning text-center" role="alert" style={{padding: '20px', borderRadius: '8px'}}>
            <h4>Profile Incomplete</h4>
            <p>Please complete your personal profile before booking an appointment.</p>
            <button
              className="btn btn-primary mt-3"
              onClick={() => window.dispatchEvent(new CustomEvent('openProfileModal'))}
            >
              Complete Profile Now
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification({ message: '', type: '' })}
        />
      )}

      <section id="appointment" className="appointment section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Make an Appointment</h2>
          <p>Book an appointment with our specialist doctors</p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <form onSubmit={handleSubmit} className="appointment-form php-email-form">
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="appointment_name" className="form-label">Name</label>
                <input
                  type="text"
                  id="appointment_name"
                  name="name"
                  className="form-control"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-4">
                 <label htmlFor="appointment_email" className="form-label">Email</label>
                <input
                  type="email"
                  id="appointment_email"
                  className="form-control"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-md-4">
                 <label htmlFor="appointment_phone" className="form-label">Phone</label>
                <input
                  type="tel"
                  id="appointment_phone"
                  className="form-control"
                  name="phone"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-md-4">
                <label htmlFor="appointment_location" className="form-label">Location *</label>
                <select
                  id="appointment_location"
                  name="location"
                  className="form-select"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label htmlFor="appointment_date" className="form-label">Date *</label>
                <input
                  type="date"
                  id="appointment_date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  disabled={!formData.location}
                />
              </div>
              <div className="col-md-4">
                 <label htmlFor="appointment_time" className="form-label">Time Slot *</label>
                <input
                  type="text"
                  id="appointment_time"
                  className="form-control"
                  value={formData.timeSlot ? staticTimeSlots.find(s => s.value === formData.timeSlot)?.label : 'Select Time'}
                  onClick={() => formData.location && formData.date && setIsTimeModalOpen(true)}
                  readOnly
                  placeholder="Select Time"
                  style={{ cursor: (formData.location && formData.date) ? 'pointer' : 'not-allowed' }}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mt-3">
                <div className="col-md-12">
                    <label htmlFor="appointment_doctor" className="form-label">Doctor *</label>
                    <select
                      id="appointment_doctor"
                      name="doctor"
                      className="form-select"
                      value={formData.doctor}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.timeSlot || availableDoctors.length === 0}
                    >
                        <option value="">
                          {formData.timeSlot
                            ? (availableDoctors.length > 0 ? 'Select Doctor' : 'No doctors available for this slot')
                            : 'Select time slot first'}
                        </option>
                        {availableDoctors.map(doctor => (
                            <option key={doctor._id} value={doctor._id}>
                                {doctor.user?.fullName || 'Doctor'} - {doctor.specializations?.join(', ') || 'General Dentistry'}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-md-12">
                <label htmlFor="appointment_message" className="form-label">Message (Optional)</label>
                <textarea
                  id="appointment_message"
                  className="form-control"
                  name="reasonForVisit"
                  rows="4"
                  placeholder="Reason for visit or any specific requests"
                  value={formData.reasonForVisit}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            <div className="mt-4 text-center">
              {error && <div className="error-message mb-3">{error}</div>}

              <button type="submit" className="btn btn-primary" disabled={loading || (isLoggedIn && !profileComplete)}>
                {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      {' Processing...'}
                    </>
                  ) : 'Proceed to Payment'}
              </button>
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