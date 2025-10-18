import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Space, 
  Tag,
  Modal,
  message,
  Spin,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  IdcardOutlined,
  HomeOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
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

  // Helper function to safely render values
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (Array.isArray(value)) {
      return value.map(item => safeRender(item)).join(', ');
    }
    if (typeof value === 'object') {
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
      key: 'patient',
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '14px',
            color: '#262626',
            marginBottom: '4px'
          }}>
            {safeRender(record.user?.fullName)}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <PhoneOutlined style={{ fontSize: '10px' }} />
            {safeRender(record.contactInfo?.phone)}
          </div>
        </div>
      ),
      width: 200,
    },
    {
      title: 'Tuổi',
      key: 'age',
      render: (_, record) => {
        const age = record.basicInfo?.dateOfBirth 
          ? new Date().getFullYear() - new Date(record.basicInfo.dateOfBirth).getFullYear()
          : 'N/A';
        return (
          <div style={{ padding: '8px 0' }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '14px',
              color: '#262626'
            }}>
              {age} tuổi
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#8c8c8c',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CalendarOutlined style={{ fontSize: '10px' }} />
              {record.basicInfo?.dateOfBirth 
                ? dayjs(record.basicInfo.dateOfBirth).format('DD/MM/YYYY')
                : 'N/A'
              }
            </div>
          </div>
        );
      },
      width: 120,
    },
    {
      title: 'Giới tính',
      dataIndex: ['basicInfo', 'gender'],
      key: 'gender',
      render: (gender, record) => {
        const genderMap = {
          'male': 'Nam',
          'female': 'Nữ',
          'other': 'Khác'
        };
        return (
          <div style={{ padding: '8px 0' }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: '14px',
              color: '#262626'
            }}>
              {genderMap[gender] || 'N/A'}
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#8c8c8c',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <IdcardOutlined style={{ fontSize: '10px' }} />
              {safeRender(record.basicInfo?.idCard)}
            </div>
          </div>
        );
      },
      width: 120,
    },
    {
      title: 'Địa chỉ',
      dataIndex: ['contactInfo', 'address', 'street'],
      key: 'address',
      render: (text, record) => (
        <div style={{ padding: '8px 0' }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '14px',
            color: '#262626',
            marginBottom: '4px'
          }}>
            {safeRender(text)}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <HomeOutlined style={{ fontSize: '10px' }} />
            {safeRender(record.contactInfo?.address?.city)} - {safeRender(record.contactInfo?.address?.state)}
          </div>
        </div>
      ),
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Lịch sử bệnh',
      key: 'medicalHistory',
      render: (_, record) => (
        <div style={{ padding: '8px 0' }}>
          {record.medicalHistory?.length > 0 ? (
            <Tag color="blue" style={{ marginBottom: '4px' }}>
              {record.medicalHistory.length} bệnh
            </Tag>
          ) : (
            <Tag color="default" style={{ marginBottom: '4px' }}>
              Không có
            </Tag>
          )}
          <div style={{ 
            fontSize: '12px', 
            color: '#8c8c8c',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <HeartOutlined style={{ fontSize: '10px' }} />
            {record.allergies?.length > 0 ? `${record.allergies.length} dị ứng` : 'Không dị ứng'}
          </div>
        </div>
      ),
      width: 150,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <Button 
            type="link" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record._id)}
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
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* Patient Details Modal */}
      <Modal
        title="Chi tiết bệnh nhân"
        open={patientDetailsVisible}
        onCancel={() => {
          setPatientDetailsVisible(false);
          setPatientDetails(null);
        }}
        footer={[
          <Button key="close" onClick={() => setPatientDetailsVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {patientDetails && patientDetails.patient && (
          <div>
            {/* Thông tin cơ bản */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                <UserOutlined style={{ marginRight: '8px' }} />
                Thông tin cá nhân
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p><strong>Họ tên:</strong> {safeRender(patientDetails.patient.user?.fullName)}</p>
                  <p><strong>Email:</strong> {safeRender(patientDetails.patient.user?.email)}</p>
                  <p><strong>Số điện thoại:</strong> {safeRender(patientDetails.patient.contactInfo?.phone)}</p>
                </div>
                <div>
                  <p><strong>Ngày sinh:</strong> {patientDetails.patient.basicInfo?.dateOfBirth ? 
                    dayjs(patientDetails.patient.basicInfo.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}</p>
                  <p><strong>Giới tính:</strong> {safeRender(patientDetails.patient.basicInfo?.gender)}</p>
                  <p><strong>CCCD:</strong> {safeRender(patientDetails.patient.basicInfo?.idCard)}</p>
                </div>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                <PhoneOutlined style={{ marginRight: '8px' }} />
                Thông tin liên hệ
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p><strong>Địa chỉ:</strong> {safeRender(patientDetails.patient.contactInfo?.address?.street)}</p>
                  <p><strong>Phường/Xã:</strong> {safeRender(patientDetails.patient.contactInfo?.address?.ward)}</p>
                </div>
                <div>
                  <p><strong>Quận/Huyện:</strong> {safeRender(patientDetails.patient.contactInfo?.address?.district)}</p>
                  <p><strong>Tỉnh/Thành phố:</strong> {safeRender(patientDetails.patient.contactInfo?.address?.city)}</p>
                </div>
              </div>
            </div>

            {/* Thông tin bảo hiểm */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                <IdcardOutlined style={{ marginRight: '8px' }} />
                Thông tin bảo hiểm
              </h3>
              <p><strong>Bảo hiểm y tế:</strong> {safeRender(patientDetails.patient.insuranceInfo)}</p>
            </div>

            {/* Tiền sử bệnh */}
            {patientDetails.patient.medicalHistory && (
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
                  {Array.isArray(patientDetails.patient.medicalHistory) 
                    ? patientDetails.patient.medicalHistory.map((item, index) => (
                        <div key={index} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                          <p><strong>Tình trạng:</strong> {safeRender(item.condition)}</p>
                          <p><strong>Năm:</strong> {safeRender(item.year)}</p>
                          {item.notes && <p><strong>Ghi chú:</strong> {safeRender(item.notes)}</p>}
                        </div>
                      ))
                    : safeRender(patientDetails.patient.medicalHistory)
                  }
                </div>
              </div>
            )}

            {/* Dị ứng */}
            {patientDetails.patient.allergies && patientDetails.patient.allergies.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                  <ExclamationCircleOutlined style={{ marginRight: '8px' }} />
                  Dị ứng
                </h3>
                <div style={{ 
                  background: '#fff2f0', 
                  padding: '12px', 
                  borderRadius: '6px',
                  border: '1px solid #ffccc7'
                }}>
                  {patientDetails.patient.allergies.map((allergy, index) => (
                    <div key={index} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                      <p><strong>Tác nhân:</strong> {safeRender(allergy.allergen)}</p>
                      <p><strong>Mức độ:</strong> {safeRender(allergy.severity)}</p>
                      {allergy.notes && <p><strong>Ghi chú:</strong> {safeRender(allergy.notes)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lịch sử khám */}
            {patientDetails.appointmentHistory && patientDetails.appointmentHistory.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#1890ff', marginBottom: '16px' }}>
                  <CalendarOutlined style={{ marginRight: '8px' }} />
                  Lịch sử khám
                </h3>
                <div style={{ 
                  background: '#f6ffed', 
                  padding: '12px', 
                  borderRadius: '6px',
                  border: '1px solid #b7eb8f'
                }}>
                  {patientDetails.appointmentHistory.map((appointment, index) => (
                    <div key={index} style={{ marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                      <p><strong>Ngày khám:</strong> {dayjs(appointment.appointmentDate).format('DD/MM/YYYY')}</p>
                      <p><strong>Giờ khám:</strong> {appointment.startTime} - {appointment.endTime}</p>
                      <p><strong>Trạng thái:</strong> {appointment.status}</p>
                      {appointment.reasonForVisit && <p><strong>Lý do khám:</strong> {safeRender(appointment.reasonForVisit)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
