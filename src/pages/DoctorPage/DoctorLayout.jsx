import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './DoctorLayout.css';

const DoctorLayout = () => {
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
        <header className="doctor-header">
          <h1>Doctor Portal</h1>
        </header>
        <section className="doctor-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DoctorLayout;


