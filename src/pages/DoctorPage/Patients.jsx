import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Tag,
  Modal,
  Descriptions,
  message,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  UserOutlined
} from '@ant-design/icons';
import { getDoctorPatients, getPatientDetails } from '../../services/doctorService';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [searchText, setSearchText] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetailsVisible, setPatientDetailsVisible] = useState(false);
  const [patientDetails, setPatientDetails] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, [pagination.current, pagination.pageSize, searchText]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText
      };

      const response = await getDoctorPatients(params);
      setPatients(response.data.patients);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalItems
      }));
    } catch (error) {
      console.error('Error fetching patients:', error);
      message.error('Lỗi khi tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (patientId) => {
    try {
      const response = await getPatientDetails(patientId);
      setPatientDetails(response.data);
      setPatientDetailsVisible(true);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      message.error('Lỗi khi tải thông tin bệnh nhân');
    }
  };

  const columns = [
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.user?.fullName}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.contactInfo?.phone}
          </div>
        </div>
      ),
    },
    {
      title: 'Tuổi',
      key: 'age',
      render: (_, record) => {
        const age = record.basicInfo?.dateOfBirth 
          ? new Date().getFullYear() - new Date(record.basicInfo.dateOfBirth).getFullYear()
          : 'N/A';
        return age;
      },
    },
    {
      title: 'Giới tính',
      dataIndex: ['basicInfo', 'gender'],
      key: 'gender',
      render: (gender) => {
        const genderMap = {
          'male': 'Nam',
          'female': 'Nữ',
          'other': 'Khác'
        };
        return genderMap[gender] || 'N/A';
      },
    },
    {
      title: 'Địa chỉ',
      dataIndex: ['contactInfo', 'address', 'street'],
      key: 'address',
      ellipsis: true,
    },
    {
      title: 'Lịch sử bệnh',
      key: 'medicalHistory',
      render: (_, record) => (
        <div>
          {record.medicalHistory?.length > 0 ? (
            <Tag color="blue">{record.medicalHistory.length} bệnh</Tag>
          ) : (
            <Tag color="default">Không có</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Dị ứng',
      key: 'allergies',
      render: (_, record) => (
        <div>
          {record.allergies?.length > 0 ? (
            <Tag color="red">{record.allergies.length} dị ứng</Tag>
          ) : (
            <Tag color="green">Không có</Tag>
          )}
        </div>
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
            onClick={() => handleViewDetails(record._id)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="Danh sách bệnh nhân">
        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="Tìm kiếm bệnh nhân..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={patients}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} bệnh nhân`,
          }}
          onChange={(pagination) => setPagination(pagination)}
        />
      </Card>

      {/* Patient Details Modal */}
      <Modal
        title="Thông tin chi tiết bệnh nhân"
        open={patientDetailsVisible}
        onCancel={() => setPatientDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPatientDetailsVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {patientDetails && (
          <div>
            <Descriptions title="Thông tin cơ bản" bordered column={2}>
              <Descriptions.Item label="Họ tên" span={2}>
                {patientDetails.patient.user?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {patientDetails.patient.contactInfo?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {patientDetails.patient.contactInfo?.email}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {patientDetails.patient.basicInfo?.dateOfBirth 
                  ? new Date(patientDetails.patient.basicInfo.dateOfBirth).toLocaleDateString('vi-VN')
                  : 'N/A'
                }
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {patientDetails.patient.basicInfo?.gender === 'male' ? 'Nam' : 
                 patientDetails.patient.basicInfo?.gender === 'female' ? 'Nữ' : 'Khác'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}>
                {patientDetails.patient.contactInfo?.address?.street}, {' '}
                {patientDetails.patient.contactInfo?.address?.city}, {' '}
                {patientDetails.patient.contactInfo?.address?.state}
              </Descriptions.Item>
            </Descriptions>

            {patientDetails.patient.medicalHistory?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4>Lịch sử bệnh:</h4>
                <ul>
                  {patientDetails.patient.medicalHistory.map((history, index) => (
                    <li key={index}>
                      {history.condition} ({history.year})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {patientDetails.patient.allergies?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4>Dị ứng:</h4>
                <ul>
                  {patientDetails.patient.allergies.map((allergy, index) => (
                    <li key={index}>
                      {allergy.allergen} - {allergy.severity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {patientDetails.appointmentHistory?.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <h4>Lịch sử khám:</h4>
                <ul>
                  {patientDetails.appointmentHistory.map((appointment, index) => (
                    <li key={index}>
                      {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} - 
                      {appointment.startTime} ({appointment.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
