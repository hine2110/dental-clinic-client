// File: src/components/PatientAppointmentList.jsx
// Updated: Added location display

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './PatientAppointmentList.css';
import RescheduleWarningModal from './RescheduleWarningModal'; // Ensure modal is imported

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Helper to format date (adjust locale if needed)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  // Using 'en-GB' for DD/MM/YYYY format, change as needed
  return new Date(dateString).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

function PatientAppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for the warning modal
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);

  // Fetch appointments effect
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('You need to be logged in to view appointments.');
        }
        const response = await fetch(`${API_BASE}/patient/appointments`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to load appointment history.');
        }
        // Assuming backend returns hasBeenRescheduled and schedule.location.name
        const sortedData = data.data.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        setAppointments(sortedData);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  // Function to generate link and navigate (remains the same)
  const handleReschedule = async () => {
    if (!selectedAppointmentId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/patient/appointments/${selectedAppointmentId}/generate-reschedule-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error generating reschedule link.');
      }
      navigate(`/reschedule?token=${data.token}`);
    } catch (err) {
      alert(`Error: ${err.message}`); // Alert if API call fails
    } finally {
      setIsWarningModalOpen(false); // Close modal regardless of success/failure
      setSelectedAppointmentId(null);
    }
  };

  // Modal handler functions (remain the same)
  const handleOpenWarningModal = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setIsWarningModalOpen(true);
  };
  const handleCloseWarningModal = () => {
    setIsWarningModalOpen(false);
    setSelectedAppointmentId(null);
  };
  const handleConfirmReschedule = () => {
    handleReschedule(); // Call the link generation function
  };

  // Helper to render status badges
  const renderStatusBadge = (status) => {
    let className = 'status-badge';
    let text = status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '); // Capitalize and replace hyphen
    switch (status) {
      case 'confirmed': className += ' confirmed'; text = 'Confirmed'; break;
      case 'pending': className += ' pending'; text = 'Pending'; break;
      case 'completed': className += ' completed'; text = 'Completed'; break;
      case 'cancelled': className += ' cancelled'; text = 'Cancelled'; break;
      case 'checked-in': className += ' checked-in'; text = 'Checked In'; break; // Add other statuses if needed
      // Add more cases for your other statuses
      default: className += ' default'; text = status;
    }
    return <span className={className}>{text}</span>;
  };

  return (
    <div className="appointment-list-container">
      {/* Loading, error, empty state rendering */}
      {loading && (
        <p className="loading-text">Loading appointment history...</p>
      )}
      {error && (
        <div className="appointment-list-error">
          {error}
        </div>
      )}
      {!loading && !error && appointments.length === 0 && (
        <p className="empty-text">You don't have any appointments yet.</p>
      )}

      {/* Render appointment list */}
      {!loading && !error && appointments.length > 0 && (
        <div className="appointment-list">
          {appointments.map(apt => (
            <div key={apt._id} className="appointment-card">
              <div className="appointment-info">
                <h4>{formatDate(apt.appointmentDate)}</h4>
                <p><strong>Time:</strong> {apt.startTime}</p>
                <p><strong>Doctor:</strong> {apt.doctor?.user?.fullName || 'N/A'}</p>
                {/* === START ADDED LINE === */}
                {/* Display location name, using optional chaining (?.) */}
                <p><strong>Location:</strong> {apt.location?.name || 'N/A'}</p>
                {/* === END ADDED LINE === */}
                <p><strong>Status:</strong> {renderStatusBadge(apt.status)}</p>
              </div>
              <div className="appointment-actions">
                {/* Reschedule button logic (remains the same) */}
                {apt.status === 'confirmed' && !apt.hasBeenRescheduled && (
                  <button
                    onClick={() => handleOpenWarningModal(apt._id)}
                    className="btn-reschedule"
                  >
                    Reschedule
                  </button>
                )}
                {apt.status === 'confirmed' && apt.hasBeenRescheduled && (
                  <span className="rescheduled-text">Rescheduled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Render the warning modal */}
      <RescheduleWarningModal
        isOpen={isWarningModalOpen}
        onClose={handleCloseWarningModal}
        onConfirm={handleConfirmReschedule}
      />
    </div>
  );
}

export default PatientAppointmentList;