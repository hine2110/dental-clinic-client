// File: src/pages/patient/ReschedulePage.jsx
// ĐÃ CẬP NHẬT: Thêm logic "Back" (quay lại 1 bước)

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './ReschedulePage.css'; // Import the new CSS file

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function ReschedulePage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    // State for the process steps
    const [step, setStep] = useState(1); // 1: Location, 2: Date, 3: Time, 4: Doctor
    const [oldAppointment, setOldAppointment] = useState(null);

    // State to store data from API
    const [locations, setLocations] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [availableDoctors, setAvailableDoctors] = useState([]);

    // State to store user selections
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    // State to manage UI (loading, error)
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Helper function to fetch API (Giữ nguyên)
    const apiFetch = async (url) => {
        // ... (code giữ nguyên)
        const patientToken = localStorage.getItem('token'); 
        const headers = { 'Content-Type': 'application/json' };
        if (patientToken) {
            headers['Authorization'] = `Bearer ${patientToken}`;
        }
        const res = await fetch(`${API_BASE}${url}`, { headers });
        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.message || 'API request failed');
        }
        return data.data;
    };

    // Step 1: Verify token and load locations (Giữ nguyên)
    useEffect(() => {
        if (!token) {
            // ... (code giữ nguyên)
            setError("Invalid reschedule token. Please check the link.");
            setIsLoading(false);
            return;
        }
        const initialize = async () => {
            try {
                // ... (code giữ nguyên)
                const verifyRes = await fetch(`${API_BASE}/patient/reschedule/verify?token=${token}`);
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok || !verifyData.success) {
                    throw new Error(verifyData.message);
                }
                setOldAppointment(verifyData.data);

                const locsData = await apiFetch('/patient/locations');
                setLocations(locsData);
                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };
        initialize();
    }, [token]);

    // Step 2: Load available times (Giữ nguyên)
    useEffect(() => {
        if (selectedLocation && selectedDate) {
            // ... (code giữ nguyên)
            const fetchTimes = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const timesData = await apiFetch(
                        `/patient/appointments/available-times?locationId=${selectedLocation._id}&date=${selectedDate}`
                    );
                    setAvailableTimes(timesData.timeSlots.filter(slot => slot.isAvailable));
                } catch (err) {
                    setError('Could not load available times. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTimes();
        }
    }, [selectedLocation, selectedDate]);

    // Step 3: Load available doctors (Giữ nguyên)
    useEffect(() => {
        if (selectedLocation && selectedDate && selectedTime) {
            // ... (code giữ nguyên)
            const fetchDoctors = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const doctorsData = await apiFetch(
                        `/patient/appointments/available-doctors?locationId=${selectedLocation._id}&date=${selectedDate}&time=${selectedTime}`
                    );
                    setAvailableDoctors(doctorsData.doctors);
                } catch (err) {
                    setError('Could not load available doctors. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDoctors();
        }
    }, [selectedLocation, selectedDate, selectedTime]);


    // === THÊM MỚI HÀM NÀY ===
    // Hàm mới để quay lại 1 bước
    const handleBack = () => {
        // Đơn giản là lùi lại 1 step.
        // Các hàm onChange/onClick của các bước trước đã xử lý việc
        // reset các state con khi giá trị thay đổi.
        setStep(prev => prev - 1);
        setError(''); // Xóa lỗi (nếu có) khi quay lại
    };
    // === KẾT THÚC PHẦN MỚI ===


    // Final Submit handler (Giữ nguyên)
    const handleSubmit = async () => {
        if (!selectedLocation || !selectedDate || !selectedTime || !selectedDoctor || !token) {
            // ... (code giữ nguyên)
            setError("Please complete all selection steps.");
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            // ... (code call API giữ nguyên)
            const res = await fetch(`${API_BASE}/patient/reschedule/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    locationId: selectedLocation._id,
                    doctorId: selectedDoctor._id,
                    date: selectedDate,
                    time: selectedTime
                })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message);
            }
            setSuccessMessage(`Reschedule successful! Your new appointment is at ${selectedTime} on ${new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} with Dr. ${selectedDoctor.user.fullName}.`);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Functions for each step (Giữ nguyên) ---

    // renderOldAppointmentInfo (Giữ nguyên)
    const renderOldAppointmentInfo = () => oldAppointment && (
        <div className="old-appointment-info">
            {/* ... (code giữ nguyên) ... */}
            <p>Your current appointment:</p>
            <span><strong>Doctor:</strong> {oldAppointment.doctor?.user?.fullName}</span>
            <span><strong>Date:</strong> {new Date(oldAppointment.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span><strong>Time:</strong> {oldAppointment.startTime}</span>
            <span><strong>Location:</strong> {oldAppointment.location?.name}</span>
        </div>
    );

    // renderStepContent (Giữ nguyên)
    const renderStepContent = () => {
        switch(step) {
            case 1: // Select Location
                return (
                    <div className="step-content">
                        <h4>Step 1: Choose a new location</h4>
                        <div className="selection-grid">
                            {locations.map(loc => (
                                <button
                                    key={loc._id}
                                    className={`selection-card ${selectedLocation?._id === loc._id ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedLocation(loc);
                                        setStep(2); // Move to step 2
                                    }}
                                >
                                    {/* ... (code giữ nguyên) ... */}
                                    <h5>{loc.name}</h5>
                                    <p>{loc.address?.street}, {loc.address?.city}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 2: // Select Date
                return (
                    <div className="step-content">
                        <h4>Step 2: Choose a new date</h4>
                        <input
                            type="date"
                            className="date-input"
                            value={selectedDate}
                            min={new Date().toISOString().split('T')[0]} 
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setSelectedTime(''); // Reset subsequent steps
                                setSelectedDoctor(null);
                                setAvailableDoctors([]);
                                setAvailableTimes([]);
                                setStep(3); // Move to step 3
                            }}
                        />
                    </div>
                );

            case 3: // Select Time
                return (
                    <div className="step-content">
                        <h4>Step 3: Choose a new time (for {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})</h4>
                        {isLoading && <p>Loading available times...</p>}
                        <div className="selection-grid time-grid">
                            {availableTimes.length > 0 ? availableTimes.map(slot => (
                                <button
                                    key={slot.time}
                                    className={`selection-card time-slot ${selectedTime === slot.time ? 'selected' : ''}`}
                                    onClick={() => {
                                        setSelectedTime(slot.time);
                                        setSelectedDoctor(null); // Reset next step
                                        setStep(4); // Move to step 4
                                    }}
                                >
                                    {slot.time} 
                                </button>
                            )) : !isLoading && <p>No available times for this date. Please select another date.</p>}
                        </div>
                    </div>
                );

            case 4: // Select Doctor
                return (
                    <div className="step-content">
                        <h4>Step 4: Choose a doctor (for {selectedTime} on {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})</h4>
                        {isLoading && <p>Loading available doctors...</p>}
                        <div className="selection-grid">
                            {availableDoctors.length > 0 ? availableDoctors.map(doc => (
                                <button
                                    key={doc._id}
                                    className={`selection-card doctor-card ${selectedDoctor?._id === doc._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedDoctor(doc)}
                                >
                                    {/* ... (code giữ nguyên) ... */}
                                    <div
                                        className="doctor-avatar"
                                        style={{backgroundImage: `url(${doc.user?.avatar || 'https://via.placeholder.com/60'})`}}
                                    ></div>
                                    <div className="doctor-info">
                                        <h5>{doc.user?.fullName || 'N/A'}</h5>
                                        <p>{doc.specializations?.join(', ') || 'General Dentist'}</p>
                                    </div>
                                </button>
                            )) : !isLoading && <p>No available doctors for this time slot. Please select another time.</p>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // --- Main Render ---

    // (Tất cả các phần render "if (isLoading...", "if (successMessage...", "if (error..." đều giữ nguyên)
    if (isLoading && !oldAppointment) {
         return <div className="reschedule-container"><p>Verifying token...</p></div>;
    }
    if (successMessage) {
        return (
            <div className="reschedule-container">
                <div className="success-message">
                    <h2> Reschedule Successful!</h2>
                    <p>{successMessage}</p>
                    <Link to="/profile" className="btn-primary">Back to Profile</Link>
                </div>
            </div>
        );
    }
    if (error && !oldAppointment) {
        return (
            <div className="reschedule-container">
                <div className="error-message">
                    <h2>Verification Error</h2>
                    <p>{error}</p>
                    <Link to="/" className="btn-secondary">Back to Home</Link>
                </div>
            </div>
        );
    }

    // Main rescheduling form
    return (
        <div className="reschedule-container">
            <h1>Reschedule Appointment</h1>
            {renderOldAppointmentInfo()}

            <div className="reschedule-form">
                <h2>Select New Appointment</h2>

                {error && <div className="error-message"><p>{error}</p></div>}

                {/* Render steps 1, 2, 3, 4 */}
                {step >= 1 && renderStepContent()}

                {/* === THAY ĐỔI LOGIC NÚT NÀY === */}
                {/* Display reset/back button */}
                {step > 1 && (
                    <button
                        className="btn-link"
                        // Sửa onClick: Thay vì reset, gọi hàm handleBack
                        onClick={handleBack} 
                    >
                        Back {/* Sửa Text: "Start Over" -> "Back" */}
                    </button>
                )}
                {/* === KẾT THÚC THAY ĐỔI === */}


                {/* Display final confirmation section (Giữ nguyên) */}
                {selectedDoctor && step === 4 && (
                    <div className="confirmation-section">
                        <h4>Confirm Selection:</h4>
                        <p><strong>Location:</strong> {selectedLocation.name}</p>
                        <p><strong>Doctor:</strong> {selectedDoctor.user.fullName}</p>
                        <p><strong>Time:</strong> {selectedTime} - {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        <button
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Confirm Reschedule'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ReschedulePage;