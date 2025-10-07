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
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { 
  getDoctorMedicalRecords, 
  getMedicalRecordById,
  deleteMedicalRecord,
  completeMedicalRecord,
  formatDateForDisplay,
  formatDateTimeForDisplay,
  getMedicalRecordStatusColor,
  getMedicalRecordStatusText,
  formatClinicalExamination,
  formatDiagnosis,
  formatTreatmentPlan
} from '../../services/medicalRecordService';
import { getDoctorAppointments } from '../../services/doctorService';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

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
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetchMedicalRecords();
    fetchAppointments();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters
      };

      const response = await getDoctorMedicalRecords(params);
      setMedicalRecords(response.data.medicalRecords);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalItems
      }));
    } catch (error) {
      console.error('Error fetching medical records:', error);
      message.error('Lỗi khi tải danh sách hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await getDoctorAppointments({ limit: 100 });
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleViewDetails = async (recordId) => {
    try {
      const response = await getMedicalRecordById(recordId);
      setSelectedRecord(response.data);
      setDetailModalVisible(true);
    } catch (error) {
      console.error('Error fetching medical record details:', error);
      message.error('Lỗi khi tải chi tiết hồ sơ bệnh án');
    }
  };

  const handleDelete = async (recordId) => {
    try {
      await deleteMedicalRecord(recordId);
      message.success('Xóa hồ sơ bệnh án thành công');
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error deleting medical record:', error);
      message.error('Lỗi khi xóa hồ sơ bệnh án');
    }
  };

  const handleComplete = async (recordId) => {
    try {
      await completeMedicalRecord(recordId);
      message.success('Hoàn thành hồ sơ bệnh án thành công');
      fetchMedicalRecords();
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
      title: 'Mã hồ sơ',
      dataIndex: 'recordId',
      key: 'recordId',
      render: (text) => (
        <Tag color="blue">{text}</Tag>
      ),
    },
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
      title: 'Ngày khám',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: (date) => formatDateForDisplay(date),
      sorter: (a, b) => new Date(a.visitDate) - new Date(b.visitDate),
    },
    {
      title: 'Triệu chứng chính',
      dataIndex: 'chiefComplaint',
      key: 'chiefComplaint',
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
          <div style={{ fontWeight: 500 }}>{record.diagnosis?.primary || 'Chưa chẩn đoán'}</div>
          {record.diagnosis?.secondary?.length > 0 && (
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
              +{record.diagnosis.secondary.length} chẩn đoán phụ
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
        <Tag color={getMedicalRecordStatusColor(status)}>
          {getMedicalRecordStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Bản nháp', value: 'draft' },
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đã lưu trữ', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
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
            Xem
          </Button>
          {record.status === 'draft' && (
            <>
              <Button 
                size="small"
                icon={<EditOutlined />}
                onClick={() => {
                  message.info('Tính năng chỉnh sửa đang được phát triển');
                }}
              >
                Sửa
              </Button>
              <Button 
                danger 
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record._id)}
              >
                Xóa
              </Button>
              <Button 
                type="primary" 
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleComplete(record._id)}
              >
                Hoàn thành
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const renderClinicalExamination = (examination) => {
    if (!examination) return <div>Chưa có thông tin khám lâm sàng</div>;
    
    const formatted = formatClinicalExamination(examination);
    
    return (
      <div>
        <h4>Khám tổng quát</h4>
        <p><strong>Ngoại hình:</strong> {formatted.general.appearance}</p>
        
        {formatted.general.vitalSigns && Object.keys(formatted.general.vitalSigns).length > 0 && (
          <div>
            <h5>Dấu hiệu sinh tồn:</h5>
            <ul>
              {formatted.general.vitalSigns.bloodPressure && (
                <li>Huyết áp: {formatted.general.vitalSigns.bloodPressure}</li>
              )}
              {formatted.general.vitalSigns.heartRate && (
                <li>Nhịp tim: {formatted.general.vitalSigns.heartRate} bpm</li>
              )}
              {formatted.general.vitalSigns.temperature && (
                <li>Nhiệt độ: {formatted.general.vitalSigns.temperature}°C</li>
              )}
              {formatted.general.vitalSigns.respiratoryRate && (
                <li>Nhịp thở: {formatted.general.vitalSigns.respiratoryRate} lần/phút</li>
              )}
            </ul>
          </div>
        )}

        <h4>Khám răng miệng</h4>
        <Row gutter={16}>
          <Col span={12}>
            <h5>Răng:</h5>
            <p><strong>Tình trạng:</strong> {formatted.oral.teeth.condition || 'N/A'}</p>
            {formatted.oral.teeth.missingTeeth?.length > 0 && (
              <p><strong>Răng mất:</strong> {formatted.oral.teeth.missingTeeth.join(', ')}</p>
            )}
            {formatted.oral.teeth.filledTeeth?.length > 0 && (
              <p><strong>Răng trám:</strong> {formatted.oral.teeth.filledTeeth.join(', ')}</p>
            )}
            {formatted.oral.teeth.decayedTeeth?.length > 0 && (
              <p><strong>Răng sâu:</strong> {formatted.oral.teeth.decayedTeeth.join(', ')}</p>
            )}
          </Col>
          <Col span={12}>
            <h5>Nướu:</h5>
            <p><strong>Tình trạng:</strong> {formatted.oral.gums.condition || 'N/A'}</p>
            <p><strong>Chảy máu:</strong> {formatted.oral.gums.bleeding ? 'Có' : 'Không'}</p>
            <p><strong>Sưng:</strong> {formatted.oral.gums.swelling ? 'Có' : 'Không'}</p>
          </Col>
        </Row>
      </div>
    );
  };

  const renderDiagnosis = (diagnosis) => {
    if (!diagnosis) return <div>Chưa có chẩn đoán</div>;
    
    const formatted = formatDiagnosis(diagnosis);
    
    return (
      <div>
        <h4>Chẩn đoán chính</h4>
        <p>{formatted.primary}</p>
        
        {formatted.secondary.length > 0 && (
          <div>
            <h4>Chẩn đoán phụ</h4>
            <ul>
              {formatted.secondary.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {formatted.differential.length > 0 && (
          <div>
            <h4>Chẩn đoán phân biệt</h4>
            <ul>
              {formatted.differential.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderTreatmentPlan = (plan) => {
    if (!plan) return <div>Chưa có kế hoạch điều trị</div>;
    
    const formatted = formatTreatmentPlan(plan);
    
    return (
      <div>
        {formatted.immediate.length > 0 && (
          <div>
            <h4>Điều trị ngay</h4>
            <ul>
              {formatted.immediate.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {formatted.shortTerm.length > 0 && (
          <div>
            <h4>Điều trị ngắn hạn</h4>
            <ul>
              {formatted.shortTerm.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {formatted.longTerm.length > 0 && (
          <div>
            <h4>Điều trị dài hạn</h4>
            <ul>
              {formatted.longTerm.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {formatted.followUp.nextVisit && (
          <div>
            <h4>Lịch tái khám</h4>
            <p><strong>Ngày tái khám:</strong> {formatDateForDisplay(formatted.followUp.nextVisit)}</p>
            <p><strong>Khoảng cách:</strong> {formatted.followUp.interval || 'N/A'}</p>
            <p><strong>Hướng dẫn:</strong> {formatted.followUp.instructions || 'N/A'}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Card 
        title="Quản lý hồ sơ bệnh án" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              message.info('Tính năng tạo hồ sơ bệnh án đang được phát triển');
            }}
          >
            Tạo hồ sơ mới
          </Button>
        }
      >
        {/* Filters */}
        <div style={{ marginBottom: '16px' }}>
          <Space wrap>
            <Input
              placeholder="Tìm kiếm bệnh nhân..."
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select
              placeholder="Trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="draft">Bản nháp</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="archived">Đã lưu trữ</Option>
            </Select>
            <RangePicker
              placeholder={['Từ ngày', 'Đến ngày']}
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
          </Space>
        </div>

        {/* Table */}
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
        />
      </Card>

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
      >
        {selectedRecord && (
          <div>
            <Descriptions title="Thông tin cơ bản" bordered column={2}>
              <Descriptions.Item label="Mã hồ sơ" span={2}>
                <Tag color="blue">{selectedRecord.recordId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bệnh nhân" span={2}>
                {selectedRecord.patient?.user?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày khám">
                {formatDateForDisplay(selectedRecord.visitDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getMedicalRecordStatusColor(selectedRecord.status)}>
                  {getMedicalRecordStatusText(selectedRecord.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Triệu chứng chính" span={2}>
                {selectedRecord.chiefComplaint || 'Chưa có'}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền sử bệnh hiện tại" span={2}>
                {selectedRecord.presentIllness || 'Chưa có'}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <h3>Khám lâm sàng</h3>
            {renderClinicalExamination(selectedRecord.clinicalExamination)}

            <Divider />

            <h3>Chẩn đoán</h3>
            {renderDiagnosis(selectedRecord.diagnosis)}

            <Divider />

            <h3>Kế hoạch điều trị</h3>
            {renderTreatmentPlan(selectedRecord.treatmentPlan)}

            {selectedRecord.notes && (
              <>
                <Divider />
                <h3>Ghi chú bổ sung</h3>
                <p>{selectedRecord.notes}</p>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MedicalRecords;
