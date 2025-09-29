import React from 'react';
import './DoctorDashboard.css';
import { useAuth } from '../../context/authContext';

const DoctorDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="doctor-dashboard">
      <div className="doctor-header">
        <h2>Doctor Dashboard</h2>
        <div className="doctor-info">
          <span className="doctor-name">{user?.fullName || 'Doctor'}</span>
          <span className="doctor-email">{user?.email}</span>
        </div>
      </div>

      <div className="doctor-grid">
        <div className="card">
          <h3>Today's Appointments</h3>
          <p>View and manage your schedule.</p>
        </div>
        <div className="card">
          <h3>Patients</h3>
          <p>Access patient records and histories.</p>
        </div>
        <div className="card">
          <h3>Prescriptions</h3>
          <p>Create and review prescriptions.</p>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;


