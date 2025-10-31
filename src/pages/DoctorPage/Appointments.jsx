import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Tag, 
  Select, 
  DatePicker, 
  Input, 
  Space, 
  Modal, 
  message,
  Spin,
  Tooltip
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  PlayCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  getDoctorAppointments, 
  completeAppointment,
  markNoShow,
  putOnHold,
  getAppointmentStatusColor,
  getAppointmentStatusText
} from '../../services/doctorService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    search: ''
  });
  const [noShowModalVisible, setNoShowModalVisible] = useState(false);
  const [onHoldModalVisible, setOnHoldModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [noShowReason, setNoShowReason] = useState('');
  const [onHoldReason, setOnHoldReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await getDoctorAppointments(params);
      setAppointments(response.data.appointments);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalItems
      }));
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Lỗi khi tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (appointmentId) => {
    try {
      await completeAppointment(appointmentId);
      message.success('Hoàn thành khám bệnh thành công');
      fetchAppointments();
    } catch (error) {
      console.error('Error completing appointment:', error);
      message.error('Lỗi khi hoàn thành khám bệnh');
    }
  };

  const handleNoShow = (appointment) => {
    setSelectedAppointment(appointment);
    setNoShowModalVisible(true);
  };

  const handleNoShowConfirm = async () => {
    try {
      await markNoShow(selectedAppointment._id, noShowReason);
      message.success('Đánh dấu không đến thành công');
      setNoShowModalVisible(false);
      setNoShowReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error marking no-show:', error);
      message.error('Lỗi khi đánh dấu không đến');
    }
  };

  const handleStartExamination = async (appointment) => {
    try {
      // Update status to in-progress
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/appointments/${appointment._id}/start-examination`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        message.success('Bắt đầu khám bệnh thành công');
        // Navigate to medical record page
        navigate(`/doctor/medical-records/examination/${appointment._id}`, { 
          state: { 
            appointmentId: appointment._id,
            appointment: appointment 
          } 
        });
      } else {
        message.error('Lỗi khi bắt đầu khám bệnh');
      }
    } catch (error) {
      console.error('Error starting examination:', error);
      message.error('Lỗi khi bắt đầu khám bệnh');
    }
  };

  // For in-progress appointments (already has test results)
  const handleContinueInProgress = async (appointment) => {
    try {
      // Fetch fresh appointment data to determine the next step
      const appointmentResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/appointments/${appointment._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      let appointmentData = appointment;
      if (appointmentResponse.ok) {
        const data = await appointmentResponse.json();
        appointmentData = data.data;
      }
      
      // Determine which step to navigate to based on completed data
      let targetStep = 0; // Default to Step 1
      
      // Check Step 1: Clinical Examination
      if (appointmentData.chiefComplaint || appointmentData.medicalHistory || appointmentData.physicalExamination?.oralExamination) {
        targetStep = 1; // Move to Step 2
        
        // Check Step 2: Paraclinical Tests
        if (appointmentData.imagingTests?.length > 0 || appointmentData.labTests?.length > 0) {
          targetStep = 2; // Move to Step 3
          
          // Check Step 3: Diagnosis
          if (appointmentData.finalDiagnosis) {
            targetStep = 3; // Move to Step 4
            
            // Check Step 4: Treatment & Services
            if (appointmentData.selectedServices?.length > 0) {
              targetStep = 4; // Move to Step 5
            }
          }
        }
      }
      
      // Navigate to the first incomplete step
      navigate(`/doctor/medical-records/examination/${appointment._id}`, { 
        state: { 
          appointmentId: appointment._id,
          appointment: appointmentData,
          currentStep: targetStep
        } 
      });
    } catch (error) {
      console.error('Error continuing in-progress examination:', error);
      message.error('Lỗi khi tiếp tục khám bệnh');
    }
  };

  // For waiting-for-results appointments (needs to fetch fresh data)
  const handleContinueAfterTests = async (appointment) => {
    try {
      // Update status to in-progress
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/appointments/${appointment._id}/continue-examination`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        message.success('Tiếp tục khám bệnh thành công');
        
        // Fetch updated appointment data before navigating
        try {
          const appointmentResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/appointments/${appointment._id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (appointmentResponse.ok) {
            const appointmentData = await appointmentResponse.json();
            // Navigate to medical record page at step 2 (Paraclinical Tests)
            navigate(`/doctor/medical-records/examination/${appointment._id}`, { 
              state: { 
                appointmentId: appointment._id,
                appointment: appointmentData.data, // Use fresh data from API
                currentStep: 1 // Start at step 2 (Paraclinical Tests)
              } 
            });
          } else {
            // Fallback to original appointment data if fetch fails
            navigate(`/doctor/medical-records/examination/${appointment._id}`, { 
              state: { 
                appointmentId: appointment._id,
                appointment: appointment,
                currentStep: 1
              } 
            });
          }
        } catch (fetchError) {
          console.error('Error fetching updated appointment:', fetchError);
          // Fallback to original appointment data
          navigate(`/doctor/medical-records/examination/${appointment._id}`, { 
            state: { 
              appointmentId: appointment._id,
              appointment: appointment,
              currentStep: 1
            } 
          });
        }
      } else {
        message.error('Lỗi khi tiếp tục khám bệnh');
      }
    } catch (error) {
      console.error('Error continuing examination:', error);
      message.error('Lỗi khi tiếp tục khám bệnh');
    }
  };

  // For in-treatment appointments (after service completion)
  const handleContinueAfterTreatment = async (appointment) => {
    try {
      // Update status to in-progress
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/appointments/${appointment._id}/continue-examination`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        message.success('Tiếp tục khám bệnh sau dịch vụ thành công');
        
        // Fetch updated appointment data before navigating
        try {
          const appointmentResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/appointments/${appointment._id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (appointmentResponse.ok) {
            const appointmentData = await appointmentResponse.json();
            // Navigate to medical record page at step 4 (Treatment & Services)
            navigate(`/doctor/medical-records/examination/${appointment._id}`, { 
              state: { 
                appointmentId: appointment._id,
                appointment: appointmentData.data, // Use fresh data from API
                currentStep: 3 // Start at step 4 (Treatment & Services)
              } 
            });
          } else {
            // Fallback to original appointment data if fetch fails
            navigate(`/doctor/medical-records/examination/${appointment._id}`, { 
              state: { 
                appointmentId: appointment._id,
                appointment: appointment,
                currentStep: 3
              } 
            });
          }
        } catch (fetchError) {
          console.error('Error fetching updated appointment:', fetchError);
          // Fallback to original appointment data
          navigate(`/doctor/medical-records/examination/${appointment._id}`, { 
            state: { 
              appointmentId: appointment._id,
              appointment: appointment,
              currentStep: 3
            } 
          });
        }
      } else {
        message.error('Lỗi khi tiếp tục khám bệnh');
      }
    } catch (error) {
      console.error('Error continuing examination:', error);
      message.error('Lỗi khi tiếp tục khám bệnh');
    }
  };

  const handleOnHold = (appointment) => {
    setSelectedAppointment(appointment);
    setOnHoldModalVisible(true);
  };

  const handleOnHoldConfirm = async () => {
    try {
      await putOnHold(selectedAppointment._id, onHoldReason);
      message.success('Tạm hoãn khám bệnh thành công');
      setOnHoldModalVisible(false);
      setOnHoldReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error putting on hold:', error);
      message.error('Lỗi khi tạm hoãn khám bệnh');
    }
  };

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setDetailModalVisible(true);
  };

  // Helper function to safely render values
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (Array.isArray(value)) {
      // If it's an array, join the elements
      return value.map(item => safeRender(item)).join(', ');
    }
    if (typeof value === 'object') {
      // If it's an object, try to get a meaningful string representation
      if (value.idNumber) return value.idNumber;
      if (value.number) return value.number;
      if (value.value) return value.value;
      if (value.condition) return value.condition;
      if (value.year) return value.year;
      if (value.notes) return value.notes;
      return JSON.stringify(value);
    }
    return String(value);
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      dataIndex: ['patient', 'basicInfo', 'fullName'],
      key: 'patientName',
      render: (text, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '14px',
            color: '#262626',
            marginBottom: '4px'
          }}>
            {text || 'N/A'}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <PhoneOutlined style={{ fontSize: '10px' }} />
            {record.patient?.contactInfo?.phone || 'N/A'}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Ngày khám',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
    },
    {
      title: 'Giờ khám',
      key: 'time',
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '14px',
            color: '#262626',
            marginBottom: '4px'
          }}>
            {record.startTime} - {record.endTime}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CalendarOutlined style={{ fontSize: '10px' }} />
            {record.schedule?.location?.name || record.location?.name || 'N/A'}
          </div>
        </div>
      ),
      width: 160,
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
      filters: [
        { text: 'Chờ xác nhận', value: 'pending' },
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Đã check-in', value: 'checked-in' },
        { text: 'Tạm hoãn', value: 'on-hold' },
        { text: 'Đang khám', value: 'in-progress' },
        { text: 'Chờ kết quả', value: 'waiting-for-results' },
        { text: 'Đang làm dịch vụ', value: 'in-treatment' },
        { text: 'Đã hoàn thành', value: 'completed' },
        { text: 'Không đến', value: 'no-show' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Lý do khám',
      dataIndex: 'reasonForVisit',
      key: 'reasonForVisit',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text || 'Không có'}
        </Tooltip>
      ),
    },
    {
      title: 'Chẩn đoán',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text || 'Chưa chẩn đoán'}
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          {/* Action Buttons Row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {record.status === 'checked-in' && (
              <>
                <Button 
                  type="primary" 
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleStartExamination(record)}
                  style={{ 
                    backgroundColor: '#52c41a', 
                    borderColor: '#52c41a', 
                    color: 'white',
                    minWidth: '120px' 
                  }}
                >
                  Bắt đầu khám
                </Button>
                <Button 
                  type="default" 
                  size="small"
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleOnHold(record)}
                  style={{ 
                    color: '#faad14', 
                    borderColor: '#faad14',
                    minWidth: '100px'
                  }}
                >
                  Tạm hoãn
                </Button>
              </>
            )}
            {record.status === 'on-hold' && (
              <Button 
                type="primary" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartExamination(record)}
                style={{ 
                  backgroundColor: '#fa8c16', 
                  borderColor: '#fa8c16', 
                  color: 'white',
                  minWidth: '140px'
                }}
              >
                Bắt đầu khám
              </Button>
            )}
            {record.status === 'waiting-for-results' && (
              <Button 
                type="primary" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleContinueAfterTests(record)}
                style={{ 
                  backgroundColor: '#faad14', 
                  borderColor: '#faad14', 
                  color: 'white',
                  minWidth: '160px'
                }}
              >
                Tiếp tục sau xét nghiệm
              </Button>
            )}
            {record.status === 'in-treatment' && (
              <Button 
                type="primary" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleContinueAfterTreatment(record)}
                style={{ 
                  backgroundColor: '#1890ff', 
                  borderColor: '#1890ff', 
                  color: 'white',
                  minWidth: '160px'
                }}
              >
                Tiếp tục sau dịch vụ
              </Button>
            )}
            {record.status === 'in-progress' && (
              <Button 
                type="primary" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleContinueInProgress(record)}
                style={{ 
                  backgroundColor: '#13c2c2', 
                  borderColor: '#13c2c2', 
                  color: 'white',
                  minWidth: '140px'
                }}
              >
                Tiếp tục khám
              </Button>
            )}
          </div>
          
          {/* Details Button Row */}
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            style={{ 
              padding: '4px 0',
              height: 'auto',
              color: '#1890ff'
            }}
          >
            Xem chi tiết
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <style jsx>{`
        .row-checked-in {
          border-left: 4px solid #52c41a;
        }
        .row-on-hold {
          border-left: 4px solid #faad14;
        }
        .row-in-progress {
          border-left: 4px solid #13c2c2;
        }
        .row-completed {
          border-left: 4px solid #722ed1;
        }
        .row-no-show {
          border-left: 4px solid #8c8c8c;
        }
        .row-cancelled {
          border-left: 4px solid #ff4d4f;
        }
        .ant-table-tbody > tr:hover {
          background-color: #f5f5f5 !important;
        }
      `}</style>
      
      <Card 
        title="Quản lý lịch hẹn" 
        extra={
          <Button type="primary" icon={<FilterOutlined />}>
            Xuất báo cáo
          </Button>
        }
      >
        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Input
              placeholder="Tìm kiếm bệnh nhân..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: 180 }}
              allowClear
            >
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="checked-in">Đã check-in</Option>
              <Option value="on-hold">Tạm hoãn</Option>
              <Option value="in-progress">Đang khám</Option>
              <Option value="waiting-for-results">Chờ kết quả</Option>
              <Option value="in-treatment">Đang làm dịch vụ</Option>
              <Option value="completed">Đã hoàn thành</Option>
              <Option value="no-show">Không đến</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
            <DatePicker
              placeholder="Chọn ngày"
              value={filters.date ? dayjs(filters.date) : null}
              onChange={(date) => handleFilterChange('date', date ? date.format('YYYY-MM-DD') : '')}
              style={{ width: 150 }}
            />
          </Space>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} lịch hẹn`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          size="middle"
          style={{ 
            marginTop: '16px'
          }}
          rowClassName={(record) => {
            switch (record.status) {
              case 'checked-in': return 'row-checked-in';
              case 'on-hold': return 'row-on-hold';
              case 'in-progress': return 'row-in-progress';
              case 'completed': return 'row-completed';
              case 'no-show': return 'row-no-show';
              case 'cancelled': return 'row-cancelled';
              default: return '';
            }
          }}
        />
      </Card>

      {/* No Show Modal */}
      <Modal
        title="Đánh dấu không đến"
        open={noShowModalVisible}
        onOk={handleNoShowConfirm}
        onCancel={() => {
          setNoShowModalVisible(false);
          setNoShowReason('');
          setSelectedAppointment(null);
        }}
        okText="Xác nhận"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
      >
        {selectedAppointment && (
          <div>
            <p>
              Bạn có chắc chắn muốn đánh dấu bệnh nhân{' '}
              <strong>{selectedAppointment.patient?.basicInfo?.fullName || selectedAppointment.patient?.user?.fullName}</strong> không đến khám vào{' '}
              <strong>{dayjs(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}</strong> lúc{' '}
              <strong>{selectedAppointment.startTime}</strong>?
            </p>
            <TextArea
              placeholder="Lý do không đến (tùy chọn)"
              value={noShowReason}
              onChange={(e) => setNoShowReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>

      {/* On Hold Modal */}
      <Modal
        title="Tạm hoãn khám bệnh"
        open={onHoldModalVisible}
        onOk={handleOnHoldConfirm}
        onCancel={() => {
          setOnHoldModalVisible(false);
          setOnHoldReason('');
          setSelectedAppointment(null);
        }}
        okText="Xác nhận"
        cancelText="Đóng"
        okButtonProps={{ style: { backgroundColor: '#faad14', borderColor: '#faad14' } }}
      >
        {selectedAppointment && (
          <div>
            <p>
              Bạn có chắc chắn muốn tạm hoãn khám bệnh cho{' '}
              <strong>{selectedAppointment.patient?.basicInfo?.fullName || selectedAppointment.patient?.user?.fullName}</strong> vào{' '}
              <strong>{dayjs(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}</strong> lúc{' '}
              <strong>{selectedAppointment.startTime}</strong>?
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Bệnh nhân có thể quay lại khám sau khi xử lý xong việc riêng.
            </p>
            <TextArea
              placeholder="Lý do tạm hoãn (tùy chọn)"
              value={onHoldReason}
              onChange={(e) => setOnHoldReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>

      {/* Patient Details Modal */}
      <Modal
        title="Chi tiết bệnh nhân"
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedAppointment(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedAppointment && selectedAppointment.patient && (
          <div>
            {/* Thông tin cơ bản */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                Thông tin cá nhân
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p><strong>Họ tên:</strong> {safeRender(selectedAppointment.patient.basicInfo?.fullName || selectedAppointment.patient.user?.fullName)}</p>
                  <p><strong>Email:</strong> {safeRender(selectedAppointment.patient.contactInfo?.email || selectedAppointment.patient.user?.email)}</p>
                  <p><strong>Số điện thoại:</strong> {safeRender(selectedAppointment.patient.contactInfo?.phone)}</p>
                </div>
                <div>
                  <p><strong>Ngày sinh:</strong> {selectedAppointment.patient.basicInfo?.dateOfBirth ? 
                    dayjs(selectedAppointment.patient.basicInfo.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}</p>
                  <p><strong>Giới tính:</strong> {(() => {
                    const g = selectedAppointment.patient.basicInfo?.gender;
                    if (g === 'male') return 'Nam';
                    if (g === 'female') return 'Nữ';
                    if (g === 'other') return 'Khác';
                    return 'Chưa cập nhật';
                  })()}</p>
                  <p><strong>CCCD:</strong> {safeRender(selectedAppointment.patient.basicInfo?.idCard?.idNumber)}</p>
                </div>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                <PhoneOutlined style={{ marginRight: '8px' }} />
                Thông tin liên hệ
              </h3>
              <p><strong>Địa chỉ:</strong> {(() => {
                const address = selectedAppointment.patient.contactInfo?.address;
                if (!address) return 'Chưa cập nhật';
                
                // Gộp các phần địa chỉ có giá trị (theo đúng schema: street, city, state, zipCode, country)
                const parts = [
                  address.street,
                  address.city,
                  address.state,
                  address.zipCode,
                  address.country
                ].filter(Boolean); // Loại bỏ giá trị null/undefined/''
                
                return parts.length > 0 ? parts.join(', ') : 'Chưa cập nhật';
              })()}</p>
            </div>

            {/* Thông tin bảo hiểm */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                <IdcardOutlined style={{ marginRight: '8px' }} />
                Thông tin bảo hiểm
              </h3>
              <p><strong>Bảo hiểm y tế:</strong> {safeRender(selectedAppointment.patient.insuranceInfo)}</p>
            </div>

            {/* Thông tin lịch hẹn */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                <CalendarOutlined style={{ marginRight: '8px' }} />
                Thông tin lịch hẹn
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p><strong>Ngày hẹn:</strong> {dayjs(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}</p>
                  <p><strong>Giờ hẹn:</strong> {selectedAppointment.startTime} - {selectedAppointment.endTime}</p>
                </div>
                <div>
                  <p><strong>Trạng thái:</strong> 
                    <Tag color={getAppointmentStatusColor(selectedAppointment.status)} style={{ marginLeft: '8px' }}>
                      {getAppointmentStatusText(selectedAppointment.status)}
                    </Tag>
                  </p>
                  <p><strong>Lý do khám:</strong> {safeRender(selectedAppointment.reasonForVisit)}</p>
                </div>
              </div>
              {selectedAppointment.notes && (
                <div style={{ marginTop: '16px' }}>
                  <p><strong>Ghi chú:</strong></p>
                  <div style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '6px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedAppointment.notes}
                  </div>
                </div>
              )}
            </div>

            {/* Tiền sử bệnh */}
            {selectedAppointment.patient.medicalHistory && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                  <FileTextOutlined style={{ marginRight: '8px' }} />
                  Tiền sử bệnh
                </h3>
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '12px', 
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {Array.isArray(selectedAppointment.patient.medicalHistory) 
                    ? selectedAppointment.patient.medicalHistory.map((item, index) => (
                        <div key={index} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                          <p><strong>Tình trạng:</strong> {safeRender(item.condition)}</p>
                          <p><strong>Năm:</strong> {safeRender(item.year)}</p>
                          {item.notes && <p><strong>Ghi chú:</strong> {safeRender(item.notes)}</p>}
                        </div>
                      ))
                    : safeRender(selectedAppointment.patient.medicalHistory)
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
