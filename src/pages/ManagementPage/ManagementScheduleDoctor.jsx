import React from 'react';
import ScheduleCreator from '../../components/ScheduleCreator';
import './management.css';

function ManagementScheduleDoctor() {
  const handleScheduleCreated = (scheduleData) => {
    console.log('Doctor schedule created:', scheduleData);
    // Có thể thêm logic để refresh calendar hoặc hiển thị thông báo
  };

  return (
    <ScheduleCreator 
      scheduleType="doctor" 
      onScheduleCreated={handleScheduleCreated}
    />
  );
}

export default ManagementScheduleDoctor;
