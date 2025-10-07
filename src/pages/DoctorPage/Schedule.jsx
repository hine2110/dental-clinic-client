import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Calendar, 
  Badge, 
  List, 
  Tag, 
  Button, 
  DatePicker, 
  message,
  Spin,
  Empty
} from 'antd';
import { 
  ClockCircleOutlined, 
  EnvironmentOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDoctorSchedule } from '../../services/doctorService';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
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
      setSchedules(response.data.schedules);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      message.error('Lỗi khi tải lịch làm việc');
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
                <div style={{ fontSize: '12px' }}>
                  <div>{item.content}</div>
                  <div style={{ color: '#8c8c8c' }}>{item.location}</div>
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

  const getStatusColor = (isAvailable) => {
    return isAvailable ? 'green' : 'red';
  };

  const getStatusText = (isAvailable) => {
    return isAvailable ? 'Có lịch' : 'Nghỉ';
  };

  return (
    <div>
      <Card title="Lịch làm việc">
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Calendar */}
          <div style={{ flex: 2 }}>
            <Calendar
              dateCellRender={dateCellRender}
              onSelect={onDateChange}
              value={selectedDate}
            />
          </div>

          {/* Selected Date Details */}
          <div style={{ flex: 1 }}>
            <Card 
              title={`Chi tiết ngày ${selectedDate.format('DD/MM/YYYY')}`}
              size="small"
            >
              {selectedDateSchedules.length > 0 ? (
                <List
                  dataSource={selectedDateSchedules}
                  renderItem={(schedule) => (
                    <List.Item>
                      <div style={{ width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 500 }}>
                              <ClockCircleOutlined /> {schedule.startTime} - {schedule.endTime}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                              <EnvironmentOutlined /> {schedule.location?.name || 'Chưa xác định'}
                            </div>
                          </div>
                          <Tag color={getStatusColor(schedule.isAvailable)}>
                            {getStatusText(schedule.isAvailable)}
                          </Tag>
                        </div>
                        {schedule.notes && (
                          <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                            Ghi chú: {schedule.notes}
                          </div>
                        )}
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="Không có lịch làm việc trong ngày này"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </Card>

            {/* Work Schedule Info */}
            <Card 
              title="Lịch làm việc định kỳ" 
              size="small"
              style={{ marginTop: '16px' }}
            >
              <div style={{ fontSize: '12px' }}>
                <p><strong>Thứ 2:</strong> 08:00 - 17:00</p>
                <p><strong>Thứ 3:</strong> 08:00 - 17:00</p>
                <p><strong>Thứ 4:</strong> 08:00 - 17:00</p>
                <p><strong>Thứ 5:</strong> 08:00 - 17:00</p>
                <p><strong>Thứ 6:</strong> 08:00 - 17:00</p>
                <p><strong>Thứ 7:</strong> 08:00 - 12:00</p>
                <p><strong>Chủ nhật:</strong> Nghỉ</p>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Schedule;
