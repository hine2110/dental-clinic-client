// File: src/pages/patient/ReschedulePage.jsx
// (Rewritten completely to support the 4-step process and translated to English)

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

    // Helper function to fetch API (you can put this in a service file)
    const apiFetch = async (url) => {
        // Patient token might be needed for some authenticated endpoints like fetching locations
        const patientToken = localStorage.getItem('token'); 
        const headers = {
            'Content-Type': 'application/json',
        };
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

    // Step 1: Verify token and load locations
    useEffect(() => {
        if (!token) {
            setError("Invalid reschedule token. Please check the link."); // Translate error
            setIsLoading(false);
            return;
        }

        const initialize = async () => {
            try {
                // 1. Call the new verify API
                const verifyRes = await fetch(`${API_BASE}/patient/reschedule/verify?token=${token}`);
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok || !verifyData.success) {
                    throw new Error(verifyData.message);
                }
                setOldAppointment(verifyData.data);

                // 2. Load the list of Locations (clinics)
                const locsData = await apiFetch('/patient/locations'); // Use helper
                setLocations(locsData);

                setIsLoading(false);
            } catch (err) {
                setError(err.message);
                setIsLoading(false);
            }
        };

        initialize();
    }, [token]);

    // Step 2: Load available times when Date & Location are selected
    useEffect(() => {
        if (selectedLocation && selectedDate) {
            const fetchTimes = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const timesData = await apiFetch( // Use helper
                        `/patient/appointments/available-times?locationId=${selectedLocation._id}&date=${selectedDate}`
                    );
                    setAvailableTimes(timesData.timeSlots.filter(slot => slot.isAvailable));
                } catch (err) {
                    setError('Could not load available times. Please try again.'); // Translate error
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTimes();
        }
    }, [selectedLocation, selectedDate]);

    // Step 3: Load available doctors when Date, Location & Time are selected
    useEffect(() => {
        if (selectedLocation && selectedDate && selectedTime) {
            const fetchDoctors = async () => {
                setIsLoading(true);
                setError('');
                try {
                    const doctorsData = await apiFetch( // Use helper
                        `/patient/appointments/available-doctors?locationId=${selectedLocation._id}&date=${selectedDate}&time=${selectedTime}`
                    );
                    setAvailableDoctors(doctorsData.doctors);
                } catch (err) {
                    setError('Could not load available doctors. Please try again.'); // Translate error
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDoctors();
        }
    }, [selectedLocation, selectedDate, selectedTime]);


    // Final Submit handler
    const handleSubmit = async () => {
        if (!selectedLocation || !selectedDate || !selectedTime || !selectedDoctor || !token) {
            setError("Please complete all selection steps."); // Translate error
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
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
            
            // Translate success message
            setSuccessMessage(`Reschedule successful! Your new appointment is at ${selectedTime} on ${new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} with Dr. ${selectedDoctor.user.fullName}.`);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Render Functions for each step ---

    // Renders the details of the original appointment
    const renderOldAppointmentInfo = () => oldAppointment && (
        <div className="old-appointment-info">
            <p>Your current appointment:</p> {/* Translate */}
            <span>
                <strong>Doctor:</strong> {oldAppointment.doctor?.user?.fullName}
            </span>
            <span>
                <strong>Date:</strong> {new Date(oldAppointment.appointmentDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} {/* Format date */}
            </span>
            <span>
                <strong>Time:</strong> {oldAppointment.startTime}
            </span>
            <span>
                <strong>Location:</strong> {oldAppointment.location?.name}
            </span>
        </div>
    );

    // Renders the content based on the current step
    const renderStepContent = () => {
        switch(step) {
            case 1: // Select Location
                return (
                    <div className="step-content">
                        <h4>Step 1: Choose a new location</h4> {/* Translate */}
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
                                    <h5>{loc.name}</h5>
                                    {/* Display address fields */}
                                    <p>{loc.address?.street}, {loc.address?.city}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 2: // Select Date
                return (
                    <div className="step-content">
                        <h4>Step 2: Choose a new date</h4> {/* Translate */}
                        <input
                            type="date"
                            className="date-input"
                            value={selectedDate}
                            min={new Date().toISOString().split('T')[0]} // Prevent past dates
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
                         {/* Translate date format */}
                        <h4>Step 3: Choose a new time (for {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})</h4>
                        {isLoading && <p>Loading available times...</p>} {/* Translate */}
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
                                    {/* Format time if needed, e.g., 8h -> 08:00 AM */}
                                    {slot.time} 
                                </button>
                             // Translate message
                            )) : !isLoading && <p>No available times for this date. Please select another date.</p>}
                        </div>
                    </div>
                );

            case 4: // Select Doctor
                return (
                    <div className="step-content">
                        {/* Translate */}
                        <h4>Step 4: Choose a doctor (for {selectedTime} on {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })})</h4>
                        {isLoading && <p>Loading available doctors...</p>} {/* Translate */}
                        <div className="selection-grid">
                            {availableDoctors.length > 0 ? availableDoctors.map(doc => (
                                <button
                                    key={doc._id}
                                    className={`selection-card doctor-card ${selectedDoctor?._id === doc._id ? 'selected' : ''}`}
                                    onClick={() => setSelectedDoctor(doc)}
                                >
                                    {/* Use div for avatar to handle potential null URL */}
                                    <div
                                        className="doctor-avatar"
                                        style={{backgroundImage: `url(${doc.user?.avatar || 'https://via.placeholder.com/60'})`}}
                                    ></div>
                                    <div className="doctor-info">
                                        <h5>{doc.user?.fullName || 'N/A'}</h5>
                                        <p>{doc.specializations?.join(', ') || 'General Dentist'}</p>
                                    </div>
                                </button>
                            // Translate message
                            )) : !isLoading && <p>No available doctors for this time slot. Please select another time.</p>}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    // --- Main Render ---

    // Initial loading state while verifying token
    if (isLoading && !oldAppointment) {
         // Translate
        return <div className="reschedule-container"><p>Verifying token...</p></div>;
    }

    // Success state after confirmation
    if (successMessage) {
        return (
            <div className="reschedule-container">
                <div className="success-message">
                    <h2> Reschedule Successful!</h2> {/* Translate */}
                    <p>{successMessage}</p>
                    {/* Translate button */}
                    <Link to="/profile" className="btn-primary">Back to Profile</Link>
                </div>
            </div>
        );
    }

    // Critical error state (e.g., invalid token)
    if (error && !oldAppointment) {
        return (
            <div className="reschedule-container">
                <div className="error-message">
                    <h2>Verification Error</h2> {/* Translate */}
                    <p>{error}</p>
                     {/* Translate button */}
                    <Link to="/" className="btn-secondary">Back to Home</Link>
                </div>
            </div>
        );
    }

    // Main rescheduling form
    return (
        <div className="reschedule-container">
            <h1>Reschedule Appointment</h1> {/* Translate */}
            {renderOldAppointmentInfo()}

            <div className="reschedule-form">
                <h2>Select New Appointment</h2> {/* Translate */}

                {/* Display specific errors during selection */}
                {error && <div className="error-message"><p>{error}</p></div>}

                {/* Render steps 1, 2, 3, 4 */}
                {step >= 1 && renderStepContent()}

                {/* Display reset/back button */}
                {step > 1 && (
                    <button
                        className="btn-link"
                        onClick={() => {
                            setStep(1); // Reset to step 1
                            setSelectedLocation(null);
                            setSelectedDate('');
                            setSelectedTime('');
                            setSelectedDoctor(null);
                            setAvailableTimes([]);
                            setAvailableDoctors([]);
                            setError(''); // Clear errors on reset
                        }}
                    >
                        Start Over {/* Translate */}
                    </button>
                )}

                {/* Display final confirmation section */}
                {selectedDoctor && step === 4 && (
                    <div className="confirmation-section">
                        <h4>Confirm Selection:</h4> {/* Translate */}
                        <p><strong>Location:</strong> {selectedLocation.name}</p>
                        <p><strong>Doctor:</strong> {selectedDoctor.user.fullName}</p>
                        {/* Translate format */}
                        <p><strong>Time:</strong> {selectedTime} - {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                        <button
                            className="btn-primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {/* Translate button text */}
                            {isSubmitting ? 'Processing...' : 'Confirm Reschedule'}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ReschedulePage;