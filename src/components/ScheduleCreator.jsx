import React, { useState, useEffect } from 'react';
import './ScheduleCreator.css';

function ScheduleCreator({ scheduleType, onScheduleCreated }) {
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

  // Fetch persons, locations and existing schedules
  useEffect(() => {
    fetchPersons();
    fetchLocations();
    fetchSchedules();
  }, [scheduleType]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPersons = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      let apiUrl = '';
      
      if (scheduleType === 'doctor') {
        apiUrl = `${API_BASE_URL}/management/doctors`;
      } else {
        apiUrl = `${API_BASE_URL}/management/staff`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPersons(data.data || []);
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
        apiUrl = `${API_BASE_URL}/management/schedules/staff`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSchedules(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      let apiUrl = '';
      
      if (scheduleType === 'doctor') {
        apiUrl = `${API_BASE_URL}/management/schedules/doctors`;
      } else {
        apiUrl = `${API_BASE_URL}/management/schedules/staff/receptionist`;
      }

      const scheduleData = {
        [scheduleType === 'doctor' ? 'doctorId' : 'staffId']: formData.personId,
        locationId: formData.locationId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        notes: formData.notes
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          personId: '',
          locationId: '',
          date: '',
          startTime: '',
          endTime: '',
          notes: ''
        });
        
        // Refresh schedules
        await fetchSchedules();
        
        if (onScheduleCreated) {
          onScheduleCreated(result.data);
        }
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.message || 'Có lỗi xảy ra khi tạo lịch làm việc');
      }
    } catch (err) {
      console.error('Error creating schedule:', err);
      setError('Có lỗi xảy ra khi tạo lịch làm việc');
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

  // Get color for schedule based on day and type
  const getScheduleColor = (date, isFulltime) => {
    const day = new Date(date).getDate();
    const dayGroup = Math.floor((day - 1) / 2) % 2; // 0 or 1
    
    if (dayGroup === 0) {
      // Group 1: Orange/Pink
      return isFulltime ? '#ff8c00' : '#ff69b4'; // Orange/Pink
    } else {
      // Group 2: Dark Blue/Light Blue
      return isFulltime ? '#1e3a8a' : '#3b82f6'; // Dark Blue/Light Blue
    }
  };

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Find schedules for this day
      const daySchedules = schedules.filter(schedule => 
        schedule.date && schedule.date.split('T')[0] === dateString
      );
      
      days.push({
        day,
        date: dateString,
        schedules: daySchedules
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="schedule-creator">
      <div className="creator-header">
        <h2>Tạo lịch làm việc {scheduleType === 'staff' ? 'Nhân viên' : 'Bác sĩ'}</h2>
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
                    {person.user?.fullName || person.doctorId || person.staffId}
                    {person.specializations && ` - ${person.specializations.join(', ')}`}
                    {person.staffType && ` (${person.staffType})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="locationId">Cơ sở *</label>
              <select
                id="locationId"
                name="locationId"
                value={formData.locationId}
                onChange={handleInputChange}
                required
                className="form-select"
              >
                <option value="">Chọn cơ sở</option>
                {locations.map(location => (
                  <option key={location._id} value={location._id}>
                    {location.name} - {location.address}
                  </option>
                ))}
              </select>
            </div>

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

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setFormData({
                  personId: '',
                  locationId: '',
                  date: '',
                  startTime: '',
                  endTime: '',
                  notes: ''
                })}
                className="btn btn-secondary"
                disabled={loading}
              >
                <i className="fas fa-undo"></i>
                Làm mới
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i>
                    Tạo lịch làm việc
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right side - Calendar */}
        <div className="calendar-section">
          <div className="calendar-header">
            <h3>Thời khóa biểu</h3>
            <div className="legend">
              <div className="legend-item">
                <div className="legend-color orange"></div>
                <span>Fulltime (Nhóm 1)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color pink"></div>
                <span>Part-time (Nhóm 1)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color dark-blue"></div>
                <span>Fulltime (Nhóm 2)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color light-blue"></div>
                <span>Part-time (Nhóm 2)</span>
              </div>
            </div>
          </div>

          <div className="calendar-grid">
            {calendarDays.map(({ day, date, schedules }) => (
              <div key={day} className="calendar-day">
                <div className="day-number">{day}</div>
                <div className="day-schedules">
                  {schedules.map((schedule, index) => {
                    const isFull = isFulltime(schedule.startTime, schedule.endTime);
                    const color = getScheduleColor(date, isFull);
                    return (
                      <div
                        key={index}
                        className="schedule-item"
                        style={{ backgroundColor: color }}
                        title={`${schedule.startTime} - ${schedule.endTime}${isFull ? ' (Fulltime)' : ' (Part-time)'}`}
                      >
                        <div className="schedule-time">
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <div className="schedule-type">
                          {isFull ? 'Fulltime' : 'Part-time'}
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
