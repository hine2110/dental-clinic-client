import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  message,
  Spin,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  getDoctorPrescriptions, 
  createPrescription,
  getDoctorAppointments
} from '../../services/doctorService';

const { Option } = Select;
const { TextArea } = Input;

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchAppointments();
  }, [pagination.current, pagination.pageSize]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await getDoctorPrescriptions({
        page: pagination.current,
        limit: pagination.pageSize
      });
      setPrescriptions(response.data.prescriptions || []);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination?.totalItems || 0
      }));
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      message.error('Lỗi khi tải danh sách đơn thuốc');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await getDoctorAppointments({ limit: 100 });
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  const handleCreatePrescription = async (values) => {
    try {
      await createPrescription(values);
      message.success('Tạo đơn thuốc thành công');
      setCreateModalVisible(false);
      form.resetFields();
      fetchPrescriptions();
    } catch (error) {
      console.error('Error creating prescription:', error);
      message.error('Lỗi khi tạo đơn thuốc');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unfinished':
        return 'orange';
      case 'invoiced':
        return 'blue';
      case 'completed':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'unfinished':
        return 'Chưa hoàn thành';
      case 'invoiced':
        return 'Đã xuất hóa đơn';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Không xác định';
    }
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.patient?.user?.fullName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.patient?.contactInfo?.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Lịch hẹn',
      key: 'appointment',
      render: (_, record) => record.appointment ? (
        <div>
          <div>{dayjs(record.appointment.appointmentDate).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.appointment.startTime}
          </div>
        </div>
      ) : 'Không có',
    },
    {
      title: 'Thuốc',
      key: 'medications',
      render: (_, record) => (
        <div>
          {record.medications?.length > 0 ? (
            <Tag color="blue">{record.medications.length} loại thuốc</Tag>
          ) : (
            <Tag color="default">Không có thuốc</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Dịch vụ',
      key: 'services',
      render: (_, record) => (
        <div>
          {record.services?.length > 0 ? (
            <Tag color="green">{record.services.length} dịch vụ</Tag>
          ) : (
            <Tag color="default">Không có dịch vụ</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              message.info('Tính năng xem chi tiết đang được phát triển');
            }}
          >
            Xem
          </Button>
          <Button 
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              message.info('Tính năng chỉnh sửa đang được phát triển');
            }}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="Quản lý đơn thuốc"
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo đơn thuốc
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={prescriptions}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} đơn thuốc`,
          }}
          onChange={(pagination) => setPagination(pagination)}
        />
      </Card>

      {/* Create Prescription Modal */}
      <Modal
        title="Tạo đơn thuốc mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePrescription}
        >
          <Form.Item
            name="patientId"
            label="Bệnh nhân"
            rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
          >
            <Select placeholder="Chọn bệnh nhân">
              {appointments
                .filter(appointment => appointment.patient && appointment.patient._id)
                .map(appointment => (
                  <Option key={appointment.patient._id} value={appointment.patient._id}>
                    {appointment.patient.user?.fullName} - {appointment.patient.contactInfo?.phone}
                  </Option>
                ))}
              {appointments.filter(appointment => appointment.patient && appointment.patient._id).length === 0 && (
                <Option disabled value="no-patients">
                  Không có bệnh nhân nào
                </Option>
              )}
            </Select>
          </Form.Item>

          <Form.Item
            name="appointmentId"
            label="Lịch hẹn (tùy chọn)"
          >
            <Select placeholder="Chọn lịch hẹn" allowClear>
              {appointments
                .filter(appointment => appointment.patient && appointment.patient._id)
                .map(appointment => (
                  <Option key={appointment._id} value={appointment._id}>
                    {dayjs(appointment.appointmentDate).format('DD/MM/YYYY')} - {appointment.startTime}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Hướng dẫn sử dụng"
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập hướng dẫn sử dụng thuốc..."
            />
          </Form.Item>

          <Form.Item
            name="medications"
            label="Thuốc (tùy chọn)"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập danh sách thuốc (mỗi dòng một loại thuốc)..."
            />
          </Form.Item>

          <Form.Item
            name="services"
            label="Dịch vụ (tùy chọn)"
          >
            <TextArea 
              rows={3} 
              placeholder="Nhập danh sách dịch vụ (mỗi dòng một dịch vụ)..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Prescriptions;
