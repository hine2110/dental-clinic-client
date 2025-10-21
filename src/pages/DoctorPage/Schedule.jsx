import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Calendar, 
  Badge, 
  Tag, 
  message,
  Spin,
  Empty,
  Row,
  Col
} from 'antd';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDoctorSchedule } from '../../services/doctorService';
import './Schedule.css';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [workSchedule, setWorkSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedDateSchedules, setSelectedDateSchedules] = useState([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    filterSchedulesByDate();
  }, [schedules, selectedDate]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const startDate = dayjs().startOf('month').format('YYYY-MM-DD');
      const endDate = dayjs().endOf('month').format('YYYY-MM-DD');
      
      const response = await getDoctorSchedule({
        startDate,
        endDate
      });
      setSchedules(response.data.schedules || []);
      setWorkSchedule(response.data.doctor?.workSchedule || null);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      if (error.response?.status !== 404) {
        message.error('Lỗi khi tải lịch làm việc');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterSchedulesByDate = () => {
    const filtered = schedules.filter(schedule => 
      dayjs(schedule.date).isSame(selectedDate, 'day')
    );
    setSelectedDateSchedules(filtered);
  };

  const getListData = (value) => {
    const daySchedules = schedules.filter(schedule => 
      dayjs(schedule.date).isSame(value, 'day')
    );
    
    return daySchedules.map(schedule => ({
      type: schedule.isAvailable ? 'success' : 'error',
      content: `${schedule.startTime} - ${schedule.endTime}`,
      location: schedule.location?.name || 'Chưa xác định',
      schedule
    }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge 
              status={item.type} 
              text={
                <div style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 500 }}>{item.content}</div>
                </div>
              } 
            />
          </li>
        ))}
      </ul>
    );
  };

  const onDateChange = (date) => {
    setSelectedDate(date);
  };

  const getDayName = (day) => {
    const names = {
      monday: 'Thứ Hai',
      tuesday: 'Thứ Ba',
      wednesday: 'Thứ Tư',
      thursday: 'Thứ Năm',
      friday: 'Thứ Sáu',
      saturday: 'Thứ Bảy',
      sunday: 'Chủ Nhật'
    };
    return names[day] || day;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="Đang tải lịch làm việc..." />
      </div>
    );
  }

  return (
    <div className="schedule-container">
      {/* Header */}
      <div className="schedule-header">
        <h1><CalendarOutlined /> Lịch làm việc</h1>
        <p>Xem lịch làm việc và ca trực của bạn</p>
      </div>

      {/* Main Content */}
      <div className="schedule-content">
        {/* Calendar Section */}
        <div className="calendar-section">
          <Calendar
            cellRender={(current, info) => {
              if (info.type === 'date') {
                return dateCellRender(current);
              }
              return info.originNode;
            }}
            onSelect={onDateChange}
            value={selectedDate}
          />
        </div>

        {/* Sidebar Section */}
        <div className="sidebar-section">
          {/* Work Schedule Card */}
          <div className="work-schedule-card">
            <h3>
              <ClockCircleOutlined /> Lịch làm việc định kỳ
            </h3>
            <Tag 
              color="orange" 
              style={{ 
                marginBottom: '16px', 
                fontSize: '11px',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              Do Admin/Staff quản lý
            </Tag>
            
            {workSchedule ? (
              <div>
                {Object.entries(workSchedule).map(([day, schedule]) => (
                  <div key={day} className={`schedule-day ${!schedule?.isWorking ? 'off' : ''}`}>
                    <span className="schedule-day-name">{getDayName(day)}</span>
                    <span className="schedule-day-time">
                      {schedule?.isWorking ? (
                        `${schedule.startTime} - ${schedule.endTime}`
                      ) : (
                        <Tag color="red" style={{ margin: 0, fontSize: '11px' }}>Nghỉ</Tag>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Empty 
                description={
                  <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Chưa có lịch làm việc định kỳ
                  </span>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>

          {/* Daily Schedule Card */}
          <div className="daily-schedule-card">
            <h3>
              <CalendarOutlined /> {selectedDate.format('DD/MM/YYYY')}
            </h3>
            
            {selectedDateSchedules.length > 0 ? (
              <div>
                {selectedDateSchedules.map((schedule, index) => (
                  <div key={index} className="schedule-item">
                    <div className="schedule-item-header">
                      <div className="schedule-item-time">
                        <ClockCircleOutlined />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                      {schedule.isAvailable ? (
                        <span className="status-available">
                          <CheckCircleOutlined /> Sẵn sàng
                        </span>
                      ) : (
                        <span className="status-unavailable">Bận</span>
                      )}
                    </div>
                    <div className="schedule-item-location">
                      <EnvironmentOutlined />
                      {schedule.location?.name || 'Chưa xác định địa điểm'}
                    </div>
                    {schedule.notes && (
                      <div className="schedule-item-notes">
                        💬 {schedule.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-schedule">
                <p>📅 Không có lịch làm việc trong ngày này</p>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="stats-card">
            <p>Tổng số ca làm việc tháng này</p>
            <h2>{schedules.length}</h2>
            <p>ca làm việc</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;