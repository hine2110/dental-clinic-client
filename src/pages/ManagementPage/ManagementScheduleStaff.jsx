import React from 'react';
import ScheduleCreator from '../../components/ScheduleCreator';
import './management.css';

function ManagementScheduleStaff() {
  const handleScheduleCreated = (scheduleData) => {
    console.log('Staff schedule created:', scheduleData);
    // Có thể thêm logic để refresh calendar hoặc hiển thị thông báo
  };

  return (
    <ScheduleCreator 
      scheduleType="staff" 
      onScheduleCreated={handleScheduleCreated}
    />
  );
}

export default ManagementScheduleStaff;
