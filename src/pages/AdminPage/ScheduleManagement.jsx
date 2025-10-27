import React, { useState, useEffect } from 'react';
import {
  Card,
  Calendar,
  Badge,
  Spin,
  Empty,
  Row,
  Col,
  Select,
  Typography,
  Tag,
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ApartmentOutlined,
  CalendarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
// import 'dayjs/locale/vi'; // Không cần import tiếng Việt nữa
import './ScheduleManagement.css'; // Import file CSS

// --- Dịch vụ API ---
import { adminService } from '../../services/adminService'; 

// dayjs.locale('vi'); // Bỏ dòng này, dayjs sẽ mặc định là tiếng Anh

const { Title, Text } = Typography;
const { Option } = Select;

const ScheduleManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState(dayjs()); // Tháng/Năm đang xem
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Ngày đang chọn
  const [selectedDateSchedules, setSelectedDateSchedules] = useState([]);

  // State cho bộ lọc
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [branchMap, setBranchMap] = useState(new Map());
  const [filters, setFilters] = useState({
    employeeId: 'all',
    role: 'all',
    branchId: 'all',
  });

  // 1. Tải dữ liệu cho bộ lọc (nhân viên, chi nhánh) khi component mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [userRes, branchRes] = await Promise.all([
          adminService.getAllUsers(), 
          adminService.getAllLocations(), 
        ]);

        const validUsers = userRes.data.users.filter(u => 
          ['staff', 'doctor', 'management'].includes(u.role)
        );
        setEmployees(validUsers || []);
        
        const branchData = branchRes.data.locations || []; 
        setBranches(branchData);

        const bMap = new Map();
        branchData.forEach((b) => bMap.set(b._id, b.name));
        setBranchMap(bMap);

      } catch (error) {
        console.error('Error fetching filter data:', error);
        message.error('Failed to load filter data');
      }
    };
    fetchFilterData();
  }, []); 

  // 2. Tải lịch làm việc khi tháng/năm xem hoặc bộ lọc thay đổi
  useEffect(() => {
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const params = {
          year: currentViewDate.year(),
          month: currentViewDate.month() + 1,
          employeeId: filters.employeeId,
          role: filters.role,
          branchId: filters.branchId,
        };

        const res = await adminService.getSchedules(params);
        setSchedules(res.data.data || []);
      } catch (error)
      {
        console.error('Error fetching schedules:', error);
        if (error.response?.status !== 404) {
           message.error('Failed to load schedules');
        }
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [currentViewDate, filters]);

  // 3. Lọc danh sách lịch theo ngày được chọn (để hiển thị ở sidebar)
  useEffect(() => {
    const filtered = schedules.filter((schedule) =>
      dayjs(schedule.date).isSame(selectedDate, 'day')
    );
    filtered.sort((a, b) => 
      (a.employee?.fullName || '').localeCompare(b.employee?.fullName || '')
    );
    setSelectedDateSchedules(filtered);
  }, [schedules, selectedDate]);

  // Xử lý sự kiện thay đổi bộ lọc
  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  // Xử lý sự kiện thay đổi tháng/năm trên lịch
  const onCalendarPanelChange = (date) => {
    setCurrentViewDate(date);
  };

  // Xử lý sự kiện chọn một ngày
  const onDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Hàm render nội dung cho từng ô ngày trong lịch
  const dateCellRender = (value) => {
    const daySchedules = schedules.filter((sch) =>
      dayjs(sch.date).isSame(value, 'day')
    );
    
    if (daySchedules.length === 0) return null;

    return (
      <ul className="admin-events">
        {daySchedules.map((item) => (
          <li key={item._id}>
            <Badge
              status={item.isAvailable ? 'success' : 'processing'}
              text={
                <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                  <Text 
                    strong 
                    style={{ fontSize: '11px', color: '#333' }}
                  >
                    {item.employee?.fullName || 'Unknown Employee'}
                  </Text>
                  <div style={{ color: '#555' }}>
                    {item.startTime} - {item.endTime}
                  </div>
                </div>
              }
            />
          </li>
        ))}
      </ul>
    );
  };

  // Hàm lấy màu Tag theo vai trò
  const getRoleTag = (role) => {
    switch (role) {
      case 'doctor': return <Tag color="blue">Doctor</Tag>;
      case 'staff': return <Tag color="green">Staff</Tag>;
      case 'management': return <Tag color="purple">Management</Tag>;
      default: return <Tag>{role}</Tag>;
    }
  };

  return (
    <div className="schedule-management-container">
      <Title level={2} style={{ marginBottom: '24px' }}>
        <CalendarOutlined style={{ marginRight: '10px' }}/> 
        Schedule Management
      </Title>

      {/* Bộ lọc */}
      <Card className="filter-card">
        <Row gutter={[16, 16]} align="bottom">
          <Col xs={24} md={8}>
            <Text strong><TeamOutlined style={{ marginRight: '6px' }} /> Role</Text>
            <Select
              style={{ width: '100%', marginTop: '4px' }}
              value={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
            >
              <Option value="all">All Roles</Option>
              <Option value="doctor">Doctor</Option>
              <Option value="staff">Staff</Option>
              <Option value="management">Management</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text strong><UserOutlined style={{ marginRight: '6px' }} /> Employee</Text>
            <Select
              showSearch
              style={{ width: '100%', marginTop: '4px' }}
              placeholder="Select employee"
              value={filters.employeeId}
              onChange={(value) => handleFilterChange('employeeId', value)}
              filterOption={(input, option) =>
                (option.children[0]?.toLowerCase() ?? '').includes(input.toLowerCase())
              }
            >
              <Option value="all">All Employees</Option>
              {employees.map((emp) => (
                <Option key={emp._id} value={emp._id}>
                  {emp.fullName} {getRoleTag(emp.role)}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Text strong><ApartmentOutlined style={{ marginRight: '6px' }} /> Branch</Text>
            <Select
              style={{ width: '100%', marginTop: '4px' }}
              value={filters.branchId}
              onChange={(value) => handleFilterChange('branchId', value)}
            >
              <Option value="all">All Branches</Option>
              {branches.map((branch) => (
                <Option key={branch._id} value={branch._id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Nội dung chính: Lịch và Sidebar */}
      <Spin spinning={loading} tip="Loading schedules...">
        <Row gutter={[24, 24]}>
          {/* Lịch */}
          <Col xs={24} lg={17} xl={18}>
            <Card className="calendar-card-admin">
              <Calendar
                cellRender={(current, info) => {
                  if (info.type === 'date') {
                    return dateCellRender(current);
                  }
                  return info.originNode;
                }}
                onPanelChange={onCalendarPanelChange} 
                onSelect={onDateSelect} 
                value={selectedDate} 
              />
            </Card>
          </Col>

          {/* Sidebar thông tin chi tiết */}
          <Col xs={24} lg={7} xl={6}>
            <Card
              className="daily-schedule-card-admin"
              title={
                <Title level={4}>
                  Schedule for: {selectedDate.format('DD/MM/YYYY')}
                </Title>
              }
            >
              {selectedDateSchedules.length > 0 ? (
                <div>
                  {selectedDateSchedules.map((schedule) => (
                    <div key={schedule._id} className="schedule-item-admin">
                      <div className="schedule-item-header">
                        <Text strong>
                          <UserOutlined style={{ marginRight: '6px' }} /> 
                          {schedule.employee?.fullName}
                        </Text>
                        {getRoleTag(schedule.employee?.role)}
                      </div>
                      <div className="schedule-item-body">
                        <div>
                          <ClockCircleOutlined />
                          <Text> {schedule.startTime} - {schedule.endTime}</Text>
                        </div>
                        <div>
                          <EnvironmentOutlined />
                          <Text> {branchMap.get(schedule.location) || 'Unknown'}</Text>
                        </div>
                         <div>
                          <Tag color={schedule.isAvailable ? 'success' : 'error'}>
                            {schedule.isAvailable ? 'Available' : 'Booked'}
                          </Tag>
                        </div>
                        {schedule.shiftType && (
                           <div>
                            💬
                            <Text type="secondary"> {schedule.shiftType}</Text>
                           </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty description="No work schedule on this day" />
              )}
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default ScheduleManagement;