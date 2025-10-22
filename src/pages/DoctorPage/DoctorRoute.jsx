import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import DoctorLayout from './DoctorLayout';
import DoctorDashboard from './DoctorDashboard';
import Appointments from './Appointments';
import Patients from './Patients';
import MedicalRecords from './MedicalRecords';
import MedicalRecord from './MedicalRecord';
import Schedule from './Schedule';
import Profile from './Profile';

const DoctorRoute = () => {
  return (
    <ProtectedRoute roles={['doctor']}>
      <DoctorLayout>
        <Routes>
          <Route path="/" element={<DoctorDashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="patients" element={<Patients />} />
          <Route path="medical-records" element={<MedicalRecords />} />
          <Route path="medical-records/examination/:appointmentId" element={<MedicalRecord />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </DoctorLayout>
    </ProtectedRoute>
  );
};

export default DoctorRoute;
