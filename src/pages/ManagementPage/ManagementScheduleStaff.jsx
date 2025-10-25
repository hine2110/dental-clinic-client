import React from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Thêm useParams
import ScheduleCreator from '../../components/management/ScheduleCreator';
import './management.css';

function ManagementScheduleStaff() {
  const location = useLocation();
  const { locationId } = useParams(); // Lấy locationId từ URL
  
  const isFulltime = location.pathname.includes('/fulltime');
  const isParttime = location.pathname.includes('/parttime');
  
  const handleScheduleCreated = (scheduleData) => {
    console.log('Staff schedule created:', scheduleData);
  };

  const getStaffType = () => {
    if (isFulltime) return 'fulltime';
    if (isParttime) return 'parttime';
    return null;
  };

  return (
    <ScheduleCreator 
      scheduleType="staff" 
      scheduleSubType={getStaffType()}
      onScheduleCreated={handleScheduleCreated}
      locationId={locationId} // <-- TRUYỀN locationId XUỐNG
    />
  );
}

export default ManagementScheduleStaff;