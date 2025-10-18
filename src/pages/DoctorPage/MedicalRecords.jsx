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
  Tooltip,
  Row,
  Col,
  Descriptions,
  Divider,
  Badge,
  Statistic,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HeartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDoctorAppointments } from '../../services/doctorService';
import './MedicalRecords.css';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Title, Text } = Typography;

const MedicalRecords = () => {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    patientId: '',
    startDate: '',
    endDate: ''
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      
      // Lấy tất cả appointments đã hoàn thành
      const response = await getDoctorAppointments({ 
        status: 'completed',
        limit: 1000 
      });
      
      // Lọc và format dữ liệu thành medical records
      const completedAppointments = response.data.appointments.filter(apt => 
        apt.status === 'completed' && 
        (apt.finalDiagnosis || apt.clinicalDiagnosis || apt.physicalExamination)
      );
      
      setMedicalRecords(completedAppointments);
      setPagination(prev => ({
        ...prev,
        total: completedAppointments.length
      }));
    } catch (error) {
      console.error('Error fetching medical records:', error);
      message.error('Lỗi khi tải danh sách hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailModalVisible(true);
  };

  const handleDelete = async (recordId) => {
    try {
      message.info('Hồ sơ bệnh án đã hoàn thành không thể xóa');
    } catch (error) {
      console.error('Error deleting medical record:', error);
      message.error('Lỗi khi xóa hồ sơ bệnh án');
    }
  };

  const handleComplete = async (recordId) => {
    try {
      message.info('Hồ sơ bệnh án đã hoàn thành');
    } catch (error) {
      console.error('Error completing medical record:', error);
      message.error('Lỗi khi hoàn thành hồ sơ bệnh án');
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
      title: 'Mã lịch hẹn',
      dataIndex: 'appointmentId',
      key: 'appointmentId',
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.patient?.user?.fullName || 'N/A'}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {record.patient?.contactInfo?.phone || 'N/A'}
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
      title: 'Lý do khám',
      dataIndex: 'reasonForVisit',
      key: 'reasonForVisit',
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text || 'Chưa có'}
        </Tooltip>
      ),
    },
    {
      title: 'Chẩn đoán',
      key: 'diagnosis',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.finalDiagnosis || record.clinicalDiagnosis || 'Chưa chẩn đoán'}
          </div>
          {record.differentialDiagnosis && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Chẩn đoán phân biệt: {record.differentialDiagnosis}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="green">Đã hoàn thành</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <div className="action-buttons">
          <Button 
            className="btn-view"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Xem
          </Button>
        </div>
      ),
    },
  ];


  return (
    <div className="medical-records-container">
      {/* Header Section */}
      <div className="medical-records-header fade-in">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} sm={16} md={18}>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              Hồ sơ bệnh án
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
              Quản lý và theo dõi hồ sơ bệnh án của bệnh nhân
            </Text>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                message.info('Tính năng tạo hồ sơ bệnh án đang được phát triển');
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
                fontWeight: 600
              }}
            >
              Tạo hồ sơ mới
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <div className="stats-cards fade-in">
        <div className="stat-card">
          <div className="stat-icon">
            <FileTextOutlined />
          </div>
          <div className="stat-value">{medicalRecords.length}</div>
          <div className="stat-label">Tổng hồ sơ</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircleOutlined />
          </div>
          <div className="stat-value">{medicalRecords.filter(r => r.status === 'completed').length}</div>
          <div className="stat-label">Đã hoàn thành</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <UserOutlined />
          </div>
          <div className="stat-value">{new Set(medicalRecords.map(r => r.patient?._id)).size}</div>
          <div className="stat-label">Bệnh nhân</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CalendarOutlined />
          </div>
          <div className="stat-value">{medicalRecords.filter(r => dayjs(r.appointmentDate).isSame(dayjs(), 'day')).length}</div>
          <div className="stat-label">Hôm nay</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section fade-in">
        <div className="filters-title">
          <FilterOutlined />
          Bộ lọc và tìm kiếm
        </div>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm bệnh nhân..."
              prefix={<SearchOutlined />}
              className="search-input"
              onChange={(e) => handleFilterChange('patientId', e.target.value)}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              className="search-input"
              allowClear
            >
              <Option value="draft">Bản nháp</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="archived">Đã lưu trữ</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
              className="search-input"
              onChange={(dates) => {
                if (dates) {
                  handleFilterChange('startDate', dates[0]?.format('YYYY-MM-DD'));
                  handleFilterChange('endDate', dates[1]?.format('YYYY-MM-DD'));
                } else {
                  handleFilterChange('startDate', '');
                  handleFilterChange('endDate', '');
                }
              }}
            />
          </Col>
        </Row>
      </div>

      {/* Table Section */}
      <div className="table-container fade-in">
        <div className="table-header">
          <div className="table-title">
            <FileTextOutlined />
            Danh sách hồ sơ bệnh án
          </div>
        </div>

        {medicalRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FileTextOutlined />
            </div>
            <div className="empty-state-title">Chưa có hồ sơ bệnh án</div>
            <div className="empty-state-description">
              Bắt đầu tạo hồ sơ bệnh án đầu tiên cho bệnh nhân
            </div>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={medicalRecords}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} của ${total} hồ sơ`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
            className="enhanced-table"
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết hồ sơ bệnh án"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={1000}
        className="modal-enhanced"
      >
        {selectedRecord && (
          <div>
            <div className="detail-section">
              <h3>Thông tin cơ bản</h3>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Mã lịch hẹn" span={2}>
                  <Tag color="blue">{selectedRecord.appointmentId}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Bệnh nhân" span={2}>
                  {selectedRecord.patient?.user?.fullName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày khám">
                  {dayjs(selectedRecord.appointmentDate).format('DD/MM/YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color="green">Đã hoàn thành</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Lý do khám" span={2}>
                  {selectedRecord.reasonForVisit || 'Chưa có'}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedRecord.notes || 'Chưa có'}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="detail-section">
              <h3>Khám lâm sàng</h3>
              {selectedRecord.physicalExamination ? (
                <div>
                  <p><strong>Dấu hiệu sinh tồn:</strong> {selectedRecord.physicalExamination.vitalSigns || 'Chưa có'}</p>
                  <p><strong>Ngoại hình:</strong> {selectedRecord.physicalExamination.generalAppearance || 'Chưa có'}</p>
                  <p><strong>Khám răng miệng:</strong> {selectedRecord.physicalExamination.oralExamination || 'Chưa có'}</p>
                  <p><strong>Phát hiện khác:</strong> {selectedRecord.physicalExamination.otherFindings || 'Chưa có'}</p>
                </div>
              ) : (
                <div>Chưa có thông tin khám lâm sàng</div>
              )}
            </div>

            <div className="detail-section">
              <h3>Xét nghiệm</h3>
              {selectedRecord.labTests && selectedRecord.labTests.length > 0 && (
                <div>
                  <h4>Xét nghiệm nha khoa:</h4>
                  <ul>
                    {selectedRecord.labTests.map((test, index) => (
                      <li key={index}>{test}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedRecord.imagingTests && selectedRecord.imagingTests.length > 0 && (
                <div>
                  <h4>Chẩn đoán hình ảnh:</h4>
                  <ul>
                    {selectedRecord.imagingTests.map((test, index) => (
                      <li key={index}>{test}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedRecord.testResults && (
                <div>
                  <h4>Kết quả xét nghiệm:</h4>
                  <p>{selectedRecord.testResults}</p>
                </div>
              )}
            </div>

            <div className="detail-section">
              <h3>Chẩn đoán</h3>
              <div>
                <p><strong>Chẩn đoán chính:</strong> {selectedRecord.finalDiagnosis || selectedRecord.clinicalDiagnosis || 'Chưa có'}</p>
                {selectedRecord.preliminaryDiagnosis && (
                  <p><strong>Chẩn đoán sơ bộ:</strong> {selectedRecord.preliminaryDiagnosis}</p>
                )}
                {selectedRecord.differentialDiagnosis && (
                  <p><strong>Chẩn đoán phân biệt:</strong> {selectedRecord.differentialDiagnosis}</p>
                )}
              </div>
            </div>

            <div className="detail-section">
              <h3>Điều trị</h3>
              <div>
                {selectedRecord.treatment && (
                  <p><strong>Phương pháp điều trị:</strong> {selectedRecord.treatment}</p>
                )}
                {selectedRecord.procedures && selectedRecord.procedures.length > 0 && (
                  <div>
                    <h4>Thủ thuật:</h4>
                    <ul>
                      {selectedRecord.procedures.map((procedure, index) => (
                        <li key={index}>{procedure}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedRecord.followUpInstructions && (
                  <p><strong>Hướng dẫn theo dõi:</strong> {selectedRecord.followUpInstructions}</p>
                )}
                {selectedRecord.followUpDate && (
                  <p><strong>Lịch tái khám:</strong> {dayjs(selectedRecord.followUpDate).format('DD/MM/YYYY')}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
