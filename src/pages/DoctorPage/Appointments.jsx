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
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  getDoctorAppointments, 
  confirmAppointment, 
  cancelAppointment,
  getAppointmentStatusColor,
  getAppointmentStatusText
} from '../../services/doctorService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const Appointments = () => {
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
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

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

  const handleConfirm = async (appointmentId) => {
    try {
      await confirmAppointment(appointmentId);
      message.success('Xác nhận lịch hẹn thành công');
      fetchAppointments();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      message.error('Lỗi khi xác nhận lịch hẹn');
    }
  };

  const handleCancel = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalVisible(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await cancelAppointment(selectedAppointment._id, cancelReason);
      message.success('Hủy lịch hẹn thành công');
      setCancelModalVisible(false);
      setCancelReason('');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (error) {
      console.error('Error canceling appointment:', error);
      message.error('Lỗi khi hủy lịch hẹn');
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

  const columns = [
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
        <div>
          <div>{record.startTime} - {record.endTime}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.schedule?.location?.name}
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
      filters: [
        { text: 'Chờ xác nhận', value: 'pending' },
        { text: 'Đã xác nhận', value: 'confirmed' },
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
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleConfirm(record._id)}
              >
                Xác nhận
              </Button>
              <Button 
                danger 
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancel(record)}
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
              onClick={() => handleCancel(record)}
            >
              Hủy
            </Button>
          )}
          <Button 
            type="text" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              // TODO: Implement view details
              message.info('Tính năng xem chi tiết đang được phát triển');
            }}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
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
              style={{ width: 150 }}
              allowClear
            >
              <Option value="pending">Chờ xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
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
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Cancel Modal */}
      <Modal
        title="Hủy lịch hẹn"
        open={cancelModalVisible}
        onOk={handleCancelConfirm}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
          setSelectedAppointment(null);
        }}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
      >
        {selectedAppointment && (
          <div>
            <p>
              Bạn có chắc chắn muốn hủy lịch hẹn của{' '}
              <strong>{selectedAppointment.patient?.user?.fullName}</strong> vào{' '}
              <strong>{dayjs(selectedAppointment.appointmentDate).format('DD/MM/YYYY')}</strong> lúc{' '}
              <strong>{selectedAppointment.startTime}</strong>?
            </p>
            <TextArea
              placeholder="Lý do hủy (tùy chọn)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
