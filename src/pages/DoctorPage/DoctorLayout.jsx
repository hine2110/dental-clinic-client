import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './DoctorLayout.css';

const DoctorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="doctor-app">
      <aside className="doctor-sidebar">
        <div className="brand">Clinic Doctor</div>
        <nav className="nav">
          <NavLink to="/doctor" end className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/doctor/appointments" className={({ isActive }) => isActive ? 'active' : ''}>Appointments</NavLink>
          <NavLink to="/doctor/patients" className={({ isActive }) => isActive ? 'active' : ''}>Patients</NavLink>
          <NavLink to="/doctor/prescriptions" className={({ isActive }) => isActive ? 'active' : ''}>Prescriptions</NavLink>
          <NavLink to="/doctor/schedule" className={({ isActive }) => isActive ? 'active' : ''}>Schedule</NavLink>
          <NavLink to="/doctor/profile" className={({ isActive }) => isActive ? 'active' : ''}>Profile</NavLink>
        </nav>
      </aside>
      <main className="doctor-main">
        <header className="doctor-header" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
          <h1 style={{margin:0}}>Doctor Portal</h1>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            {user?.fullName && (
              <span style={{color:'#555'}}>Hi, {user.fullName}</span>
            )}
            <button
              className="btn btn-danger"
              onClick={() => { logout(); navigate('/'); }}
            >
              Logout
            </button>
          </div>
        </header>
        <section className="doctor-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DoctorLayout;


