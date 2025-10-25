import React from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Thêm useParams
import ScheduleCreator from '../../components/management/ScheduleCreator';
import './management.css';

function ManagementScheduleDoctor() {
  const location = useLocation();
  const { locationId } = useParams(); // Lấy locationId từ URL
  
  const isFulltime = location.pathname.includes('/fulltime');
  const isParttime = location.pathname.includes('/parttime');
  
  const handleScheduleCreated = (scheduleData) => {
    console.log('Doctor schedule created:', scheduleData); 
  };

  const getDoctorScheduleType = () => {
    if (isFulltime) return 'fulltime';
    if (isParttime) return 'parttime';
    return null;
  };

  return (
    <ScheduleCreator 
      scheduleType="doctor" 
      scheduleSubType={getDoctorScheduleType()}
      onScheduleCreated={handleScheduleCreated}
      locationId={locationId} // <-- TRUYỀN locationId XUỐNG
    />
  );
}

export default ManagementScheduleDoctor;