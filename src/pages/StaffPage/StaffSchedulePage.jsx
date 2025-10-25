import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext'; // Import auth context
import { Spin, Alert, Typography, Empty } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import advancedFormat from 'dayjs/plugin/advancedFormat';

// CSS: Import file CSS của ScheduleCreator để dùng chung giao diện lịch
import '../../components/management/ScheduleCreator.css'; 

// Cấu hình dayjs
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(advancedFormat);
dayjs.locale('vi'); 

const { Title } = Typography;

const StaffSchedulePage = () => {
  const { user, staff, loading: authLoading } = useAuth(); 
  
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // (QUAN TRỌNG) Lấy staffType từ cả hai nơi, giống như StaffLayout
  const staffType = staff?.staffType || user?.staffType;

  useEffect(() => {
    if (authLoading) {
      return; 
    }

    // <-- THAY ĐỔI 1: Kiểm tra biến 'staffType' đã lấy ở trên
    if (!staffType) {
      setError("Không thể xác định loại nhân viên. Vui lòng đăng nhập lại.");
      return;
    }

    // Nếu đã qua, reset lỗi
    setError(null);

    // staffType đã được định nghĩa ở trên
    const apiSuffix = staffType === 'storeKepper' ? 'store' : 'receptionist';
    
    // <-- THAY ĐỔI 2: Sửa API_BASE_URL để bao gồm /api
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const firstDayFetch = dayjs(firstDayOfMonth).startOf('week').format('YYYY-MM-DD');
    const lastDayFetch = dayjs(lastDayOfMonth).endOf('week').format('YYYY-MM-DD');

    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          // URL bây giờ sẽ là: http://localhost:5000/api/staff/store/schedules/self...
          `${API_BASE_URL}/staff/${apiSuffix}/schedules/self?startDate=${firstDayFetch}&endDate=${lastDayFetch}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const result = await response.json();
        if (!result.success) throw new Error(result.message);

        setSchedules(result.data || []); 

      } catch (err) {
        setError(err.message || "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  // <-- THAY ĐỔI 3: Dùng 'staffType' làm dependency (hoặc cả user và staff)
  }, [currentDate, staff, user, authLoading, staffType]); 

  // ... (Các hàm goToPreviousMonth, goToNextMonth, generateCalendarDays giữ nguyên) ...
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const generateCalendarDays = (date, schedulesToDisplay) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStringForFilter = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; 
      const daySchedules = schedulesToDisplay.filter(s => s.date && s.date.startsWith(dateStringForFilter));
      days.push({
        day: day,
        isCurrentMonth: true,
        date: new Date(year, month, day),
        schedules: daySchedules
      });
    }
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    return days;
  };

  // Hàm lấy màu
  const getScheduleColor = (schedule) => {
    // <-- THAY ĐỔI 4: Dùng biến 'staffType' đã lấy ở trên
    // const staffType = staff?.staffType; (Dòng cũ)
    const day = dayjs(schedule.date).date(); 
    
    if (staffType === 'receptionist' && day % 2 === 1) { 
      return '#3b82f6'; // Xanh
    }
    if (staffType === 'storeKepper' && day % 2 === 0) { 
      return '#ffff00'; // Vàng
    }
    return '#6b7280'; // Xám
  };

  const getTextColor = (schedule) => {
    const color = getScheduleColor(schedule);
    return (color === '#ffff00' || color === '#3b82f6') ? '#000000' : '#000000';
  };

  const calendarDays = generateCalendarDays(currentDate, schedules);

  const renderContent = () => {
    if (authLoading) {
      return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }
    if (error) {
      return <Alert message="Lỗi tải lịch" description={error} type="error" />;
    }
    if (loading) {
      return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    }
    
    // (Thêm kiểm tra không có lịch)
    if (schedules.length === 0) {
      return <Empty description="Bạn không có lịch làm việc trong tháng này." />;
    }
    
    return (
        <div className="calendar-grid">
          {calendarDays.map((dayData, index) => (
            <div 
              key={`${dayData.date.toISOString()}-${index}`} 
              className={`calendar-day ${!dayData.isCurrentMonth ? 'not-current-month' : ''}`}
            >
              <div className="day-number">{dayData.day}</div>
              <div className="day-schedules">
                {/* ... (code .map) ... */}
                {dayData.schedules?.map((schedule, sIndex) => (
                  <div
                    key={sIndex}
                    className="schedule-item"
                    style={{ 
                      backgroundColor: getScheduleColor(schedule), 
                      color: getTextColor(schedule),
                      cursor: 'default' 
                    }}
                    
                    // ✅ SỬA LỖI 1 (TRONG 'title'):
                    title={`${schedule.location?.name || 'Không rõ cơ sở'}: ${schedule.startTime} - ${schedule.endTime}`}
                  >
                    <div className="schedule-person-name" style={{fontWeight: 'bold'}}>
                      
                      {/* ✅ SỬA LỖI 2 (TRONG 'div'): */}
                      {schedule.location?.name || 'N/A'} 
                      
                    </div>
                    <div className="schedule-timeframe">{schedule.startTime} - {schedule.endTime}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    };

  return (
    
      
      <div className="schedule-creator" style={{ display: 'block', width: '100%' }}>
        <div className="calendar-section" style={{ width: '100%' }}>
          
          <div className="calendar-navigation">
            <button onClick={goToPreviousMonth} className="nav-button">‹</button>
            <h2>
              {`Tháng ${currentDate.getMonth() + 1}, ${currentDate.getFullYear()}`}
            </h2>
            <button onClick={goToNextMonth} className="nav-button">›</button>
          </div>

          <div className="calendar-weekdays">
            {daysOfWeek.map(day => <div key={day} className="weekday">{day}</div>)}
          </div>

          {renderContent()}

        </div>
      </div>
    
  );
};

export default StaffSchedulePage;