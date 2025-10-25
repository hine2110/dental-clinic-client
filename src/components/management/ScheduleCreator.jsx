import React, { useState, useEffect, useMemo } from 'react';
import './ScheduleCreator.css';

function ScheduleCreator({ scheduleType, scheduleSubType, onScheduleCreated, locationId }) {
  const [formData, setFormData] = useState({
    personId: '',
    locationId: '', 
    date: '',
    startTime: '',
    endTime: '',
    notes: ''
  });
  
  const [persons, setPersons] = useState([]);
  const [locations, setLocations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (locationId) {
      setFormData(prev => ({ ...prev, locationId: locationId }));
    }
  }, [locationId]);

  useEffect(() => {
    // Chỉ fetch khi có locationId để tránh gọi API không cần thiết
    if (locationId) {
      fetchPersons(); 
      fetchLocations();
      fetchSchedules();
    }
  }, [scheduleType, scheduleSubType, locationId, currentDate]);

  

  const fetchPersons = async () => {
    console.log(`[DEBUG] fetchPersons được gọi với scheduleType = "${scheduleType}"`); 
  
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      let apiUrl = '';
      
      if (scheduleType === 'doctor') {
        apiUrl = `${API_BASE_URL}/management/doctors`;
      } else if (scheduleType === 'staff') {
        apiUrl = `${API_BASE_URL}/management/staff`;
      } else {
        // Nếu scheduleType là một giá trị lạ, dừng lại và báo lỗi
        console.error(`Giá trị scheduleType không hợp lệ: "${scheduleType}"`);
        return; 
      }

      console.log('Fetching persons from:', apiUrl);
      console.log('Schedule type:', scheduleType);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        let filteredPersons = data.data || [];
        
        // Filter staff by type if needed
        if (scheduleType === 'staff' && scheduleSubType) {
          if (scheduleSubType === 'receptionist') {
            filteredPersons = filteredPersons.filter(person => person.staffType === 'receptionist');
          } else if (scheduleSubType === 'storekeeper') {
            filteredPersons = filteredPersons.filter(person => person.staffType === 'storeKepper');
          }
          // For fulltime/parttime, we show all staff types but filter by schedule type
        }
        
        console.log('Filtered persons:', filteredPersons);
        setPersons(filteredPersons);
      } else {
        console.error('API response not ok:', response.status, response.statusText);
        const errorData = await response.json();
        console.error('Error data:', errorData);
      }
    } catch (err) {
      console.error('Error fetching persons:', err);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/management/locations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      let apiUrl = '';
      
      if (scheduleType === 'doctor') {
        apiUrl = `${API_BASE_URL}/management/schedules/doctors`;
      } else {
        if (scheduleSubType === 'receptionist') {
          apiUrl = `${API_BASE_URL}/management/schedules/staff/receptionist`;
        } else if (scheduleSubType === 'storekepper') {
          apiUrl = `${API_BASE_URL}/management/schedules/staff/store-kepper`;
        } else if (scheduleSubType === 'fulltime' || scheduleSubType === 'parttime' || scheduleSubType === null) {
          apiUrl = `${API_BASE_URL}/management/schedules/staff`; // use generic staff endpoint
        } else {
          apiUrl = `${API_BASE_URL}/management/schedules/staff/receptionist`; // default
        }
      }

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const cacheBuster = `&_=${new Date().getTime()}`;
      
      const response = await fetch(`${apiUrl}?locationId=${locationId}${cacheBuster}`,{
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        
        let schedulesData = data.data || [];
        if (scheduleType === 'doctor') {
          // Chỉ giữ lại những lịch trình có thông tin 'doctor'
          schedulesData = schedulesData.filter(schedule => schedule.doctor);
        } else { 
          // Chỉ giữ lại những lịch trình có thông tin 'staff'
          schedulesData = schedulesData.filter(schedule => schedule.staff);
        }
        setSchedules(schedulesData);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const handleSelectSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      personId: schedule.staff?._id || schedule.doctor?._id,
      locationId: schedule.location?._id,
      date: schedule.date.split('T')[0], // Định dạng lại ngày
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      notes: schedule.notes || ''
    });
    setIsEditing(true); // Chuyển sang chế độ sửa
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFormAndState = () => {
    setFormData({
      personId: '',
      locationId: locationId, // Giữ lại locationId
      date: '',
      startTime: '',
      endTime: '',
      notes: ''
    });
    setIsEditing(false);
    setSelectedSchedule(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
  
    const scheduleData = {
      [scheduleType === 'doctor' ? 'doctorId' : 'staffId']: formData.personId,
      locationId: locationId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      notes: formData.notes
    };
  
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      
      let apiUrl = '';
      let method = 'POST'; // Mặc định là phương thức POST để tạo mới
  
      if (isEditing) {
        // **TRƯỜNG HỢP 1: ĐANG SỬA LỊCH**
        method = 'PUT'; // Đổi phương thức thành PUT để cập nhật
        
        if (scheduleType === 'doctor') {
          apiUrl = `${API_BASE_URL}/management/schedules/doctors/${selectedSchedule._id}`;
        } else { // scheduleType === 'staff'
          apiUrl = `${API_BASE_URL}/management/schedules/staff/${selectedSchedule._id}`;
        }
  
      } else {
        // **TRƯỜNG HỢP 2: ĐANG TẠO LỊCH MỚI (Logic cũ của bạn)**
        if (scheduleType === 'doctor') {
          apiUrl = `${API_BASE_URL}/management/schedules/doctors`;
        } else { // scheduleType === 'staff'
          const selectedPerson = persons.find(p => p._id === formData.personId);
          if (!selectedPerson) throw new Error("Không tìm thấy thông tin nhân viên đã chọn.");
          
          const staffType = selectedPerson.staffType.toLowerCase();
          if (staffType === 'receptionist') {
            apiUrl = `${API_BASE_URL}/management/schedules/staff/receptionist`;
          } else if (staffType === 'storekepper') {
            apiUrl = `${API_BASE_URL}/management/schedules/staff/store-kepper`;
          } else {
            throw new Error(`Loại nhân viên không hợp lệ: ${selectedPerson.staffType}`);
          }
        }
      }
  
      const response = await fetch(apiUrl, {
        method: method, // Sử dụng phương thức đã được xác định (POST hoặc PUT)
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        const actionText = isEditing ? 'Cập nhật' : 'Tạo';
        setSuccess(`${actionText} lịch thành công!`); // Thông báo động
  
        await fetchSchedules(); // Tải lại danh sách lịch để thấy thay đổi
        resetFormAndState(); // Dọn dẹp form và thoát chế độ sửa
  
        if (onScheduleCreated) {
          onScheduleCreated(result.data);
        }
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorMessage = result.errors ? result.errors.join(', ') : (result.message || 'Có lỗi xảy ra');
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error submitting schedule:', err);
      setError(err.message || 'Có lỗi xảy ra khi xử lý lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Determine if schedule is fulltime or part-time
  const isFulltime = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    const diffHours = (end - start) / (1000 * 60 * 60);
    return diffHours >= 8;
  };

  const extractDayFromDate = (dateString) => {
    if (!dateString) {
      return 1; // Mặc định là ngày lẻ nếu không có dữ liệu
    }
    
    try {
      // Tạo Date object, nó sẽ tự động chuyển sang múi giờ local
      const dateObj = new Date(dateString); 
      
      // Lấy ngày (1-31) của giờ local
      const day = dateObj.getDate(); 
      
      return isNaN(day) ? 1 : day;
    } catch (e) {
      return 1; // Mặc định là ngày lẻ nếu có lỗi
    }
  };

  // Get color for schedule based on person type and schedule type
  const getScheduleColor = (schedule) => {
    const isFull = isFulltime(schedule.startTime, schedule.endTime);
    
    // Lấy ngày local (đã sửa)
    const day = extractDayFromDate(schedule.date);
    const isOddDay = day % 2 === 1; // true nếu là ngày lẻ

    if (scheduleType === 'doctor') {
      // ---- LOGIC BÁC SĨ ----
      // Ngày lẻ = Xanh nhạt, Ngày chẵn = Vàng nhạt
      return isOddDay ? '#3b82f6' : '#ffff00'; 
    
    } else {
      // ---- LOGIC NHÂN VIÊN ----
      const staffType = schedule.staff?.staffType;

      if (staffType === 'receptionist' && isOddDay) {
        // Receptionist VÀ ngày lẻ = Xanh nhạt
        return '#3b82f6';
      } 
      
      if (staffType === 'storeKepper' && !isOddDay) {
        // StoreKepper VÀ ngày chẵn = Vàng nhạt
        return '#ffff00';
      }
      
      // TẤT CẢ CÁC TRƯỜNG HỢP CÒN LẠI CỦA NHÂN VIÊN:
      // (Receptionist ngày chẵn, StoreKepper ngày lẻ, các loại staff khác)
      // Dùng màu xám mặc định
      return isFull ? '#6b7280' : '#9ca3af'; // Gray
    }
  };

  const getTextColor = (schedule) => {
    
    return '#000000'; 
  };
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  

  // Generate calendar days for current month
  const generateCalendarDays = (date, schedulesToDisplay) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    const days = [];

    // Lấy ngày của tháng trước để lấp đầy các ô trống đầu tiên
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }

    // Lấy ngày của tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      const monthString = String(month + 1).padStart(2, '0');
      const dayString = String(day).padStart(2, '0');
      const dateStringForFilter = `${year}-${monthString}-${dayString}`; 
      const daySchedules = schedulesToDisplay.filter(s => s.date && s.date.startsWith(dateStringForFilter));
    
      days.push({
        day: day,
        isCurrentMonth: true,
        date: new Date(year, month, day), // Vẫn giữ Date object cho các mục đích khác
        schedules: daySchedules
      });
    }

    // Lấy ngày của tháng sau để lấp đầy các ô trống cuối cùng
    const remainingCells = 42 - days.length; // Luôn hiển thị 6 tuần (6x7=42 ô)
    for (let i = 1; i <= remainingCells; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  const handleDeleteSchedule = async (scheduleToDelete) => {
    // Hỏi xác nhận người dùng
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lịch của ${scheduleToDelete.doctor?.user?.fullName || scheduleToDelete.staff?.user?.fullName}?`)) {
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      let apiUrl = '';
      
      // Xác định đúng API endpoint dựa trên loại lịch
      if (scheduleToDelete.doctor) {
        apiUrl = `${API_BASE_URL}/management/schedules/doctors/${scheduleToDelete._id}`;
      } else if (scheduleToDelete.staff) {
        // Giả sử bạn có endpoint chung để xóa lịch nhân viên bằng ID
        apiUrl = `${API_BASE_URL}/management/schedules/staff/${scheduleToDelete._id}`;
      } else {
        throw new Error("Không thể xác định loại lịch để xóa.");
      }
  
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        // Xóa lịch khỏi state để UI cập nhật ngay lập tức
        setSchedules(prevSchedules => prevSchedules.filter(s => s._id !== scheduleToDelete._id));
        alert('Xóa lịch thành công!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Xóa lịch thất bại.');
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
      setError(err.message);
    }
  };

  const filteredSchedules = useMemo(() => {
    if (scheduleSubType === 'fulltime') {
      return schedules.filter(s => isFulltime(s.startTime, s.endTime));
    }
    if (scheduleSubType === 'parttime') {
      return schedules.filter(s => !isFulltime(s.startTime, s.endTime));
    }
    return schedules; // Nếu không có subType, hiển thị tất cả
  }, [schedules, scheduleSubType]);
  const calendarDays = generateCalendarDays(currentDate, filteredSchedules);
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="schedule-creator">
      <div className="creator-header">
        <h2>Tạo lịch làm việc {scheduleType === 'staff' ? 'Nhân viên' : 'Bác sĩ'} {scheduleSubType ? `(${scheduleSubType})` : '(Tất cả loại)'}</h2>
        <p>Quản lý và tạo lịch làm việc cho {scheduleType === 'staff' ? 'nhân viên' : 'bác sĩ'}</p>
      </div>

      <div className="creator-content">
        {/* Left side - Form */}
        <div className="form-section">
          {success && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              Tạo lịch làm việc thành công!
            </div>
          )}

          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="schedule-form">
          

          {/* === BỔ SUNG CÁC TRƯỜNG CÒN THIẾU === */}

          {/* Dropdown chọn Nhân viên / Bác sĩ */}
          <div className="form-group">
            <label htmlFor="personId">
              {scheduleType === 'doctor' ? 'Bác sĩ' : 'Nhân viên'} *
            </label>
            <select
              id="personId"
              name="personId"
              value={formData.personId}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Chọn {scheduleType === 'doctor' ? 'bác sĩ' : 'nhân viên'}</option>
              {persons.map(person => (
                <option key={person._id} value={person._id}>
                  {person.user?.fullName || 'N/A'}
                  {person.staffType && ` (${person.staffType})`}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Ngày làm việc */}
          <div className="form-group">
            <label htmlFor="date">Ngày làm việc *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={getTodayDate()}
              required
              className="form-input"
            />
          </div>

          {/* Chọn Giờ bắt đầu và kết thúc */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Giờ bắt đầu *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">Giờ kết thúc *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="form-group">
            <label htmlFor="notes">Ghi chú</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Nhập ghi chú (tùy chọn)"
              className="form-textarea"
              rows="3"
            />
          </div>

          {/* Nút bấm hành động */}
          <div className="form-actions">
              <button
                type="button"
                onClick={resetFormAndState} // Nút này giờ là Hủy (khi sửa) hoặc Làm mới
                className="btn btn-secondary"
                disabled={loading}
              >
                {isEditing ? 'Hủy' : 'Làm mới'}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading 
                  ? (isEditing ? 'Đang cập nhật...' : 'Đang tạo...') 
                  : (isEditing ? 'Cập nhật lịch' : 'Tạo lịch')
                }
              </button>
          </div>

          </form>
        </div>

        {/* Right side - Calendar */}
        <div className="calendar-section">
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

          <div className="calendar-grid">
              {calendarDays.map((dayData, index) => (
                <div 
                  key={`${dayData.date.toISOString()}-${index}`} 
                  className={`calendar-day ${!dayData.isCurrentMonth ? 'not-current-month' : ''}`}
                >
                  <div className="day-number">{dayData.day}</div>
                  <div className="day-schedules">
                    {dayData.schedules?.map((schedule, sIndex) => {
                      const personName = schedule.doctor?.user?.fullName || schedule.staff?.user?.fullName || 'N/A';
                      return (
                        <div
                          key={sIndex}
                          className="schedule-item"
                          onClick={() => handleSelectSchedule(schedule)}
                          style={{ backgroundColor: getScheduleColor(schedule), color: getTextColor(schedule) }}
                          title={`${personName}: ${schedule.startTime} - ${schedule.endTime}`}
                        >
                          <div className="schedule-person-name">{personName}</div>
                          <div className="schedule-timeframe">{schedule.startTime} - {schedule.endTime}</div>
                          <div className="schedule-overlay">
                            <button 
                              className="schedule-action-btn" 
                              title="Sửa lịch"
                              onClick={(e) => {
                                e.stopPropagation(); // Ngăn sự kiện click vào thẻ cha
                                handleSelectSchedule(schedule);
                              }}
                            >
                              <i className="fas fa-pencil-alt"></i>
                            </button>
                            <button 
                              className="schedule-action-btn" 
                              title="Xóa lịch"
                              onClick={(e) => {
                                e.stopPropagation(); // Ngăn sự kiện click vào thẻ cha
                                handleDeleteSchedule(schedule);
                              }}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleCreator;
