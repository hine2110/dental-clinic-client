import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import DoctorLayout from './DoctorLayout';
import DoctorDashboard from './DoctorDashboard';
import Appointments from './Appointments';
import Patients from './Patients';
import Prescriptions from './Prescriptions';
import Schedule from './Schedule';
import Profile from './Profile';

const DoctorRoute = () => {
  return (
    <ProtectedRoute roles={['doctor']}>
      <DoctorLayout />
      <Routes>
        <Route path="/" element={<DoctorDashboard />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="patients" element={<Patients />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
    </ProtectedRoute>
  );
};

export default DoctorRoute;


