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
  Typography,
  Image
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
  HeartOutlined,
  PrinterOutlined
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
          <div style={{ fontWeight: 500 }}>
            {record.patient?.basicInfo?.fullName || record.patient?.user?.fullName || record.patient?.user?.email?.split('@')[0] || 'N/A'}
          </div>
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
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            <span style={{ fontSize: '18px', fontWeight: 600 }}>Chi tiết hồ sơ bệnh án</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} size="large" onClick={() => window.print()}>
            In hồ sơ
          </Button>,
          <Button key="close" size="large" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={1200}
        className="modal-enhanced"
        style={{ top: 20 }}
      >
        {/* Thông tin phòng khám - chỉ hiển thị khi in */}
        <div className="clinic-header print-only" style={{ display: 'none' }}>
          <div className="clinic-name">PHÒNG KHÁM ĐA KHOA BEAUTY CLINIC</div>
          <div className="clinic-info">
            <div>📍 Địa chỉ: 123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</div>
            <div>📞 Điện thoại: (028) 1234-5678 | Hotline: 0901-234-567</div>
            <div>📧 Email: info@beautyclinic.com | Website: www.beautyclinic.com</div>
            <div>🕒 Giờ làm việc: Thứ 2 - CN: 7:00 - 20:00</div>
          </div>
        </div>
        
        {selectedRecord && (
          <div style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', padding: '8px' }}>
            {/* Thông tin bệnh nhân */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserOutlined style={{ color: '#1890ff' }} />
                  <span>Thông tin bệnh nhân</span>
                </div>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Họ và tên" span={1}>
                  <strong>{selectedRecord.patient?.basicInfo?.fullName || selectedRecord.patient?.user?.fullName || 'N/A'}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Mã lịch hẹn" span={1}>
                  <Tag color="blue">{selectedRecord.appointmentId}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh" span={1}>
                  {selectedRecord.patient?.basicInfo?.dateOfBirth ? dayjs(selectedRecord.patient.basicInfo.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính" span={1}>
                  {(() => {
                    const g = selectedRecord.patient?.basicInfo?.gender;
                    if (g === 'male') return 'Nam';
                    if (g === 'female') return 'Nữ';
                    if (g === 'other') return 'Khác';
                    return 'N/A';
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại" span={1} className="print-hide">
                  {selectedRecord.patient?.contactInfo?.phone || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Email" span={1} className="print-hide">
                  {selectedRecord.patient?.contactInfo?.email || selectedRecord.patient?.user?.email || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {selectedRecord.patient?.contactInfo?.address 
                    ? (typeof selectedRecord.patient.contactInfo.address === 'string' 
                        ? selectedRecord.patient.contactInfo.address
                        : [
                            selectedRecord.patient.contactInfo.address.street,
                            selectedRecord.patient.contactInfo.address.city,
                            selectedRecord.patient.contactInfo.address.state,
                            selectedRecord.patient.contactInfo.address.zipCode,
                            selectedRecord.patient.contactInfo.address.country
                          ].filter(Boolean).join(', '))
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày khám" span={1}>
                  <Tag color="green">{dayjs(selectedRecord.appointmentDate).format('DD/MM/YYYY HH:mm')}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={1} className="print-hide">
                  <Tag color="success">Đã hoàn thành</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Lý do đến khám & Tiền sử */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HeartOutlined style={{ color: '#ff4d4f' }} />
                  <span>Lý do đến khám & Tiền sử bệnh</span>
                </div>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
              className="print-hide"
            >
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Lý do đến khám">
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRecord.chiefComplaint || selectedRecord.reasonForVisit || 'Chưa có thông tin'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Tiền sử bệnh">
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRecord.medicalHistory || selectedRecord.patient?.medicalHistory?.conditions?.join(', ') || 'Không có tiền sử bệnh đặc biệt'}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Dị ứng thuốc">
                  {selectedRecord.patient?.medicalHistory?.allergies?.length > 0 
                    ? selectedRecord.patient.medicalHistory.allergies.join(', ')
                    : 'Không có'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Divider style={{ margin: '16px 0' }} />

            {/* Khám lâm sàng */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EyeOutlined style={{ color: '#52c41a' }} />
                  <span>Khám lâm sàng</span>
                </div>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
              className="print-hide"
            >
              {selectedRecord.physicalExamination || selectedRecord.chiefComplaint ? (
                <Descriptions bordered column={1} size="small">
                  {selectedRecord.chiefComplaint && (
                    <Descriptions.Item label="Lý do đến khám">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.chiefComplaint}</div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.medicalHistory && (
                    <Descriptions.Item label="Tiền sử bệnh">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.medicalHistory}</div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.physicalExamination?.oralExamination && (
                    <Descriptions.Item label="Khám răng miệng">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.physicalExamination.oralExamination}</div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.physicalExamination?.occlusionExamination && (
                    <Descriptions.Item label="Khám khớp cắn">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.physicalExamination.occlusionExamination}</div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.physicalExamination?.otherFindings && (
                    <Descriptions.Item label="Phát hiện khác">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.physicalExamination.otherFindings}</div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              ) : (
                <Text type="secondary">Chưa có thông tin khám lâm sàng</Text>
              )}
            </Card>

            {/* Chỉ định cận lâm sàng */}
            {((selectedRecord.labTests && selectedRecord.labTests.length > 0) || 
              (selectedRecord.imagingTests && selectedRecord.imagingTests.length > 0) ||
              (selectedRecord.testServices && selectedRecord.testServices.length > 0) ||
              selectedRecord.testResults) && (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MedicineBoxOutlined style={{ color: '#722ed1' }} />
                    <span>Chỉ định cận lâm sàng</span>
                  </div>
                }
                size="small" 
                style={{ marginBottom: '16px' }}
                className="print-hide"
              >
                <Descriptions bordered column={1} size="small">
                  {(selectedRecord.testServices && selectedRecord.testServices.length > 0) ? (
                    <Descriptions.Item label="Xét nghiệm & Chẩn đoán cần làm">
                      <div>
                        {selectedRecord.testServices.map((service, index) => (
                          <Tag key={index} color="purple" style={{ marginBottom: '4px' }}>
                            {typeof service === 'object' && service?.serviceName 
                              ? service.serviceName 
                              : service}
                          </Tag>
                        ))}
                      </div>
                    </Descriptions.Item>
                  ) : (
                    <>
                      {selectedRecord.imagingTests && selectedRecord.imagingTests.length > 0 && (
                        <Descriptions.Item label="Chẩn đoán hình ảnh">
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {selectedRecord.imagingTests.map((test, index) => (
                              <li key={index}>{test}</li>
                            ))}
                          </ul>
                        </Descriptions.Item>
                      )}
                      {selectedRecord.labTests && selectedRecord.labTests.length > 0 && (
                        <Descriptions.Item label="Xét nghiệm">
                          <ul style={{ margin: 0, paddingLeft: '20px' }}>
                            {selectedRecord.labTests.map((test, index) => (
                              <li key={index}>{test}</li>
                            ))}
                          </ul>
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                  {selectedRecord.imagingResults && (
                    <Descriptions.Item label="Kết quả chẩn đoán hình ảnh">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.imagingResults}</div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.labResults && (
                    <Descriptions.Item label="Kết quả xét nghiệm">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.labResults}</div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.testResults && (
                    <Descriptions.Item label="Kết quả tổng hợp">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.testResults}</div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.testImages && selectedRecord.testImages.length > 0 && (
                    <Descriptions.Item label="Hình ảnh xét nghiệm" span={3}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Image.PreviewGroup>
                          {selectedRecord.testImages.map((url, index) => (
                            <Image
                              key={index}
                              width={100}
                              height={100}
                              src={url}
                              alt={`Kết quả xét nghiệm ${index + 1}`}
                              style={{ 
                                objectFit: 'cover', 
                                borderRadius: '8px',
                                border: '1px solid #d9d9d9'
                              }}
                            />
                          ))}
                        </Image.PreviewGroup>
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Chẩn đoán */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircleOutlined style={{ color: '#fa8c16' }} />
                  <span>Chẩn đoán</span>
                </div>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Chẩn đoán chính">
                  <div style={{ whiteSpace: 'pre-wrap', fontWeight: 500, color: '#d4380d' }}>
                    {selectedRecord.finalDiagnosis || selectedRecord.clinicalDiagnosis || 'Chưa có chẩn đoán'}
                  </div>
                </Descriptions.Item>
                {selectedRecord.preliminaryDiagnosis && (
                  <Descriptions.Item label="Chẩn đoán sơ bộ">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.preliminaryDiagnosis}</div>
                  </Descriptions.Item>
                )}
                {selectedRecord.differentialDiagnosis && (
                  <Descriptions.Item label="Chẩn đoán phân biệt">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.differentialDiagnosis}</div>
                  </Descriptions.Item>
                )}
                {selectedRecord.prognosis && (
                  <Descriptions.Item label="Tiên lượng">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.prognosis}</div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Điều trị */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MedicineBoxOutlined style={{ color: '#13c2c2' }} />
                  <span>Điều trị</span>
                </div>
              }
              size="small" 
              style={{ marginBottom: '16px' }}
            >
              <Descriptions bordered column={1} size="small">
                {selectedRecord.selectedServices && selectedRecord.selectedServices.length > 0 && (
                  <Descriptions.Item label="Dịch vụ đã thực hiện">
                    <div>
                      {selectedRecord.selectedServices.map((service, index) => (
                        <Tag key={index} color="blue" style={{ marginBottom: '4px' }}>
                          {typeof service === 'object' && service?.name 
                            ? service.name 
                            : service}
                        </Tag>
                      ))}
                    </div>
                  </Descriptions.Item>
                )}
                {selectedRecord.treatment && (
                  <Descriptions.Item label="Phương pháp điều trị">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.treatment}</div>
                  </Descriptions.Item>
                )}
                {selectedRecord.treatmentNotes && (
                  <Descriptions.Item label="Ghi chú điều trị">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.treatmentNotes}</div>
                  </Descriptions.Item>
                )}
                {selectedRecord.procedures && (
                  <Descriptions.Item label="Các thủ thuật">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.procedures}</div>
                  </Descriptions.Item>
                )}
                {selectedRecord.homeCare && (
                  <Descriptions.Item label="Hướng dẫn chăm sóc tại nhà">
                    <div style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff7e6', padding: '12px', borderRadius: '4px' }}>
                      {selectedRecord.homeCare}
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Đơn thuốc & Tái khám */}
            {(selectedRecord.prescriptions?.length > 0 || selectedRecord.followUpDate || selectedRecord.followUpInstructions) && (
              <Card 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CalendarOutlined style={{ color: '#eb2f96' }} />
                    <span>Đơn thuốc & Tái khám</span>
                  </div>
                }
                size="small" 
                style={{ marginBottom: '16px' }}
              >
                <Descriptions bordered column={1} size="small">
                  {selectedRecord.prescriptions && selectedRecord.prescriptions.length > 0 && (
                    <Descriptions.Item label="Đơn thuốc">
                      <div>
                        {selectedRecord.prescriptions.map((prescription, index) => (
                          <div key={index} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f0f5ff', borderRadius: '4px' }}>
                            <strong>{prescription.medicine}</strong><br />
                            Liều lượng: {prescription.dosage} | Tần suất: {prescription.frequency}<br />
                            Thời gian: {prescription.duration} | {prescription.instructions}
                          </div>
                        ))}
                      </div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.followUpDate && (
                    <Descriptions.Item label="Lịch tái khám">
                      <Tag color="orange" style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {dayjs(selectedRecord.followUpDate).format('DD/MM/YYYY HH:mm')}
                      </Tag>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.followUpType && (
                    <Descriptions.Item label="Loại tái khám">
                      {(() => {
                        const map = {
                          'routine': 'Tái khám định kỳ (6 tháng)',
                          'urgent': 'Tái khám khẩn cấp (1-3 ngày)',
                          'follow-up': 'Theo dõi điều trị (1-2 tuần)',
                          'check-up': 'Kiểm tra sau điều trị (1 tháng)',
                          'orthodontic': 'Tái khám chỉnh nha (1-2 tháng)'
                        };
                        return map[selectedRecord.followUpType] || selectedRecord.followUpType;
                      })()}
                    </Descriptions.Item>
                  )}
                  {selectedRecord.followUpInstructions && (
                    <Descriptions.Item label="Hướng dẫn tái khám">
                      <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.followUpInstructions}</div>
                    </Descriptions.Item>
                  )}
                  {selectedRecord.warnings && (
                    <Descriptions.Item label="Cảnh báo & Lưu ý">
                      <div style={{ whiteSpace: 'pre-wrap', backgroundColor: '#fff1f0', padding: '12px', borderRadius: '4px', color: '#cf1322' }}>
                        ⚠️ {selectedRecord.warnings}
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Ghi chú khác */}
            {selectedRecord.notes && (
              <Card 
                title="Ghi chú khác"
                size="small"
              >
                <div style={{ whiteSpace: 'pre-wrap', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px' }}>
                  {selectedRecord.notes}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
