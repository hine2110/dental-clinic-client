import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, DatePicker, Select, Spin, message } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { 
  getDoctorAppointments, 
  getDoctorProfile,
  formatDateForAPI,
  getAppointmentStatusColor,
  getAppointmentStatusText
} from '../../services/doctorService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    checkedInAppointments: 0,
    onHoldAppointments: 0,
    inProgressAppointments: 0,
    completedAppointments: 0,
    noShowAppointments: 0,
    cancelledAppointments: 0
  });
  const [dateFilter, setDateFilter] = useState('today');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctor profile
      const profileResponse = await getDoctorProfile();
      setDoctorProfile(profileResponse.data);

      // Calculate date range based on filter
      let startDate, endDate;
      const today = dayjs();
      
      switch (dateFilter) {
        case 'today':
          startDate = today.format('YYYY-MM-DD');
          endDate = today.format('YYYY-MM-DD');
          break;
        case 'week':
          startDate = today.startOf('week').format('YYYY-MM-DD');
          endDate = today.endOf('week').format('YYYY-MM-DD');
          break;
        case 'month':
          startDate = today.startOf('month').format('YYYY-MM-DD');
          endDate = today.endOf('month').format('YYYY-MM-DD');
          break;
        default:
          startDate = today.format('YYYY-MM-DD');
          endDate = today.format('YYYY-MM-DD');
      }

      // Fetch appointments - lấy tất cả appointments để tính thống kê
      const appointmentsResponse = await getDoctorAppointments({
        limit: 1000 // Lấy nhiều appointments để tính thống kê chính xác
      });
      
      setAppointments(appointmentsResponse.data.appointments);

      // Calculate stats
      const allAppointments = appointmentsResponse.data.appointments;
      const stats = {
        totalAppointments: allAppointments.length,
        checkedInAppointments: allAppointments.filter(apt => apt.status === 'checked-in').length,
        onHoldAppointments: allAppointments.filter(apt => apt.status === 'on-hold').length,
        inProgressAppointments: allAppointments.filter(apt => apt.status === 'in-progress').length,
        completedAppointments: allAppointments.filter(apt => apt.status === 'completed').length,
        noShowAppointments: allAppointments.filter(apt => apt.status === 'no-show').length,
        cancelledAppointments: allAppointments.filter(apt => apt.status === 'cancelled').length
      };
      setStats(stats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      message.error('Lỗi khi tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    try {
      const { getDoctorAppointments } = await import('../../services/doctorService');
      await getDoctorAppointments.confirmAppointment(appointmentId);
      message.success('Xác nhận lịch hẹn thành công');
      fetchDashboardData();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      message.error('Lỗi khi xác nhận lịch hẹn');
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const { getDoctorAppointments } = await import('../../services/doctorService');
      await getDoctorAppointments.cancelAppointment(appointmentId);
      message.success('Hủy lịch hẹn thành công');
      fetchDashboardData();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      message.error('Lỗi khi hủy lịch hẹn');
    }
  };

  const appointmentColumns = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'user', 'fullName'],
      key: 'patientName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.patient?.contactInfo?.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày giờ',
      key: 'datetime',
      render: (_, record) => (
        <div>
          <div>{dayjs(record.appointmentDate).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.startTime} - {record.endTime}
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getAppointmentStatusColor(status)}>
          {getAppointmentStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reasonForVisit',
      key: 'reasonForVisit',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirmAppointment(record._id)}
              >
                Xác nhận
              </Button>
              <Button 
                danger 
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancelAppointment(record._id)}
              >
                Hủy
              </Button>
            </>
          )}
          {record.status === 'confirmed' && (
            <Button 
              danger 
              size="small"
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelAppointment(record._id)}
            >
              Hủy
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1>Dashboard Bác sĩ</h1>
        <p>Chào mừng, {user?.fullName}! Đây là tổng quan về hoạt động của bạn.</p>
      </div>

      {/* Date Filter */}
      <div style={{ marginBottom: '24px' }}>
        <Select
          value={dateFilter}
          onChange={setDateFilter}
          style={{ width: 200 }}
        >
          <Option value="today">Hôm nay</Option>
          <Option value="week">Tuần này</Option>
          <Option value="month">Tháng này</Option>
        </Select>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng lịch hẹn"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã check-in"
              value={stats.checkedInAppointments}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tạm hoãn"
              value={stats.onHoldAppointments}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang khám"
              value={stats.inProgressAppointments}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hoàn thành"
              value={stats.completedAppointments}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Không đến"
              value={stats.noShowAppointments}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelledAppointments}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card 
            hoverable
            onClick={() => navigate('/doctor/appointments')}
            style={{ textAlign: 'center' }}
          >
            <CalendarOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '16px' }} />
            <h3>Quản lý lịch hẹn</h3>
            <p>Xem và quản lý tất cả lịch hẹn</p>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card 
            hoverable
            onClick={() => navigate('/doctor/patients')}
            style={{ textAlign: 'center' }}
          >
            <UserOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
            <h3>Bệnh nhân</h3>
            <p>Xem danh sách bệnh nhân</p>
          </Card>
        </Col>
      </Row>

      {/* Recent Appointments */}
      <Card title="Lịch hẹn gần đây" extra={
        <Button type="link" onClick={() => navigate('/doctor/appointments')}>
          Xem tất cả
        </Button>
      }>
        <Table
          columns={appointmentColumns}
          dataSource={appointments}
          rowKey="_id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default DoctorDashboard;
