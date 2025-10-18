import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  message, 
  Steps, 
  Divider,
  Row,
  Col,
  Typography,
  Tag,
  Modal,
  Table,
  Popconfirm,
  Spin,
  Collapse,
  Badge,
  Tooltip,
  Progress,
  Alert,
  Timeline,
  Statistic,
  Avatar,
  Descriptions
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  MedicineBoxOutlined,
  FileTextOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  HeartOutlined,
  EyeOutlined,
  ExperimentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  EditOutlined,
  PrinterOutlined,
  DownloadOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { 
  getAppointmentDetails, 
  updateAppointmentStatus,
  createPrescription,
  getMedicines
} from '../../services/doctorService';
import './MedicalRecord.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Step } = Steps;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h3 style={{ color: '#ff4d4f' }}>Đã xảy ra lỗi trong component</h3>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <Button onClick={() => window.location.reload()}>
            Tải lại trang
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const MedicalRecord = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [form] = Form.useForm();
  const [prescriptionForm] = Form.useForm();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [medicines, setMedicines] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [labTests, setLabTests] = useState([]);
  const [imagingTests, setImagingTests] = useState([]);
  const [followUpDate, setFollowUpDate] = useState(null);
  const [error, setError] = useState(null);

  // Helper function to safely render values
  const safeRender = (value, fallback = 'N/A') => {
    if (value === null || value === undefined) return fallback;
    if (Array.isArray(value)) {
      return value.map(item => safeRender(item)).join(', ');
    }
    if (typeof value === 'object') {
      // Handle address object
      if (value.street || value.city || value.state || value.zipCode || value.country) {
        const addressParts = [
          value.street,
          value.city, 
          value.state,
          value.zipCode,
          value.country
        ].filter(Boolean);
        return addressParts.join(', ');
      }
      // Handle other common object types
      if (value.idNumber) return value.idNumber;
      if (value.number) return value.number;
      if (value.value) return value.value;
      if (value.condition) return value.condition;
      if (value.year) return value.year;
      if (value.notes) return value.notes;
      if (value.fullName) return value.fullName;
      if (value.email) return value.email;
      if (value.phone) return value.phone;
      // For any other object, try to convert to string safely
      try {
        return JSON.stringify(value);
      } catch (e) {
        return '[Object]';
      }
    }
    return String(value);
  };

  useEffect(() => {
    if (appointmentId) {
      try {
        fetchAppointmentDetails();
        fetchMedicines();
        
        // Check if we have currentStep from navigation state
        const location = window.location;
        if (location.state && location.state.currentStep !== undefined) {
          setCurrentStep(location.state.currentStep);
          console.log('🎯 Starting at step:', location.state.currentStep + 1);
        }
      } catch (err) {
        console.error('Error in useEffect:', err);
        setError(err.message || 'Unknown error');
      }
    } else {
      message.error('Không tìm thấy thông tin lịch hẹn');
      navigate('/doctor/appointments');
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching appointment details for ID:', appointmentId);
      const response = await getAppointmentDetails(appointmentId);
      console.log('📋 API Response:', response);
      
      if (response && response.data) {
        console.log('✅ Setting appointment data:', response.data);
        setAppointment(response.data);
        
        // Pre-fill form with existing data
        const formData = {
          // Step 1: Physical Examination
          vitalSigns: response.data.physicalExamination?.vitalSigns || '',
          generalAppearance: response.data.physicalExamination?.generalAppearance || '',
          oralExamination: response.data.physicalExamination?.oralExamination || '',
          otherFindings: response.data.physicalExamination?.otherFindings || '',
          
          // Step 2: Lab Tests
          labTests: response.data.labTests || [],
          imagingTests: response.data.imagingTests || [],
          testInstructions: response.data.testInstructions || '',
          
          // Step 3: Re-examination
          testResults: response.data.testResults || '',
          reExaminationFindings: response.data.reExaminationFindings || '',
          preliminaryDiagnosis: response.data.preliminaryDiagnosis || '',
          differentialDiagnosis: response.data.differentialDiagnosis || '',
          finalDiagnosis: response.data.finalDiagnosis || '',
          
          // Step 4: Treatment
          treatment: response.data.treatment || '',
          procedures: response.data.procedures || [],
          
          // Step 5: Follow-up
          followUpInstructions: response.data.followUpInstructions || '',
          
          // Legacy fields
          clinicalDiagnosis: response.data.clinicalDiagnosis || '',
          notes: response.data.notes || ''
        };
        
        console.log('📝 Pre-filling form with data:', formData);
        form.setFieldsValue(formData);
      } else {
        console.error('❌ Invalid response format:', response);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching appointment details:', error);
      message.error('Lỗi khi tải thông tin lịch hẹn: ' + (error.message || 'Unknown error'));
      navigate('/doctor/appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await getMedicines();
      setMedicines(response.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      message.error('Lỗi khi tải danh sách thuốc');
    }
  };

  const handleStepChange = (step) => {
    // Cho phép chuyển đến bước trước đó để xem dữ liệu
    if (step < currentStep) {
      console.log(`📋 Viewing step ${step + 1} data`);
      setCurrentStep(step);
      return;
    }
    
    // Chỉ cho phép chuyển đến bước tiếp theo nếu đã hoàn thành bước hiện tại
    if (step > currentStep) {
      message.warning('Vui lòng hoàn thành bước hiện tại trước khi chuyển sang bước tiếp theo');
      return;
    }
    
    setCurrentStep(step);
  };

  const handleSavePhysicalExamination = async (values) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointmentId, {
        physicalExamination: values,
        status: 'in-progress'
      });
      
      message.success('Lưu khám lâm sàng thành công');
      setCurrentStep(1);
    } catch (error) {
      console.error('Error saving physical examination:', error);
      message.error('Lỗi khi lưu khám lâm sàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLabTests = async (values) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointmentId, {
        labTests: values.labTests,
        imagingTests: values.imagingTests
      });
      
      message.success('Lưu cận lâm sàng thành công');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error saving lab tests:', error);
      message.error('Lỗi khi lưu cận lâm sàng');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiagnosis = async (values) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointmentId, {
        preliminaryDiagnosis: values.preliminaryDiagnosis,
        differentialDiagnosis: values.differentialDiagnosis,
        finalDiagnosis: values.finalDiagnosis
      });
      
      message.success('Lưu chẩn đoán thành công');
      setCurrentStep(3);
    } catch (error) {
      console.error('Error saving diagnosis:', error);
      message.error('Lỗi khi lưu chẩn đoán');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTreatment = async (values) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointmentId, {
        treatment: values.treatment,
        procedures: values.procedures,
        homeCare: values.homeCare
      });
      
      message.success('Lưu điều trị thành công');
      setCurrentStep(4);
    } catch (error) {
      console.error('Error saving treatment:', error);
      message.error('Lỗi khi lưu điều trị');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFollowUp = async (values) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(appointmentId, {
        followUpDate: values.followUpDate,
        followUpInstructions: values.followUpInstructions,
        warnings: values.warnings
      });
      
      message.success('Lưu theo dõi thành công');
      setCurrentStep(4);
    } catch (error) {
      console.error('Error saving follow-up:', error);
      message.error('Lỗi khi lưu theo dõi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescriptionItem = () => {
    setPrescriptionModalVisible(true);
  };

  const handleSavePrescriptionItem = (values) => {
    const newItem = {
      id: Date.now(),
      medicine: values.medicine,
      dosage: values.dosage,
      frequency: values.frequency,
      duration: values.duration,
      instructions: values.instructions
    };
    
    setPrescriptionItems([...prescriptionItems, newItem]);
    setPrescriptionModalVisible(false);
    prescriptionForm.resetFields();
    message.success('Thêm thuốc vào đơn thành công');
  };

  const handleRemovePrescriptionItem = (id) => {
    setPrescriptionItems(prescriptionItems.filter(item => item.id !== id));
  };

  const handleSavePrescription = async () => {
    if (prescriptionItems.length === 0) {
      message.warning('Vui lòng thêm ít nhất một loại thuốc');
      return;
    }

    try {
      setLoading(true);
      await createPrescription({
        appointmentId: appointmentId,
        patientId: appointment.patient._id,
        doctorId: appointment.doctor._id,
        medicines: prescriptionItems,
        notes: form.getFieldValue('prescriptionNotes') || ''
      });
      
      message.success('Lưu đơn thuốc thành công');
      setCurrentStep(3);
    } catch (error) {
      console.error('Error saving prescription:', error);
      message.error('Lỗi khi lưu đơn thuốc');
    } finally {
      setLoading(false);
    }
  };


  const handleCompleteExamination = async () => {
    try {
      // Validate appointmentId
      if (!appointmentId) {
        message.error('Không tìm thấy ID lịch hẹn');
        return;
      }
      
      // Validate appointment
      if (!appointment) {
        message.error('Không tìm thấy thông tin lịch hẹn');
        return;
      }
      
      setLoading(true);
      
      // Lấy tất cả dữ liệu từ form
      const formValues = form.getFieldsValue();
      
      // Tạo dữ liệu cập nhật đơn giản
      const updateData = {
        status: 'completed',
        completedAt: new Date(),
        // Chỉ gửi các field cần thiết
        finalDiagnosis: formValues.finalDiagnosis || formValues.clinicalDiagnosis || 'Khám răng định kỳ',
        treatment: formValues.treatment || 'Vệ sinh răng miệng định kỳ',
        followUpInstructions: formValues.followUpInstructions || 'Tái khám sau 6 tháng',
        followUpDate: formValues.followUpDate ? new Date(formValues.followUpDate) : null
      };
      
      // Cập nhật appointment status
      await updateAppointmentStatus(appointmentId, updateData);
      
      message.success('Hoàn thành khám bệnh và lưu hồ sơ thành công');
      
      // Chuyển hướng về trang appointments
      setTimeout(() => {
        navigate('/doctor/appointments');
      }, 1000);
    } catch (error) {
      console.error('Error completing examination:', error);
      message.error('Lỗi khi hoàn thành khám bệnh');
    } finally {
      setLoading(false);
    }
  };

  const prescriptionColumns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'medicine',
      key: 'medicine',
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
    },
    {
      title: 'Thời gian',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Hướng dẫn',
      dataIndex: 'instructions',
      key: 'instructions',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Popconfirm
          title="Xóa thuốc này?"
          onConfirm={() => handleRemovePrescriptionItem(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3 style={{ color: '#ff4d4f' }}>Đã xảy ra lỗi</h3>
        <p>{error}</p>
        <Button onClick={() => navigate('/doctor/appointments')}>
          Quay lại danh sách lịch hẹn
        </Button>
      </div>
    );
  }

  if (!appointment || !appointment._id) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Đang tải thông tin lịch hẹn...</div>
      </div>
    );
  }

  try {
    // Debug log
    console.log('Rendering MedicalRecord with appointment:', appointment);
    
    return (
      <div className="medical-record-container">
        {/* Header Section */}
        <div className="medical-record-header fade-in">
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <div className="patient-avatar">
                <UserOutlined />
              </div>
            </Col>
            <Col xs={24} sm={16} md={18}>
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                Hồ sơ bệnh án
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                Bệnh nhân: {safeRender(appointment?.patient?.user?.fullName)}
              </Text>
              <div style={{ marginTop: '12px' }}>
                <Space>
                  <Tag color="rgba(255,255,255,0.2)" style={{ color: 'white' }}>
                    <CalendarOutlined /> {dayjs(appointment?.appointmentDate).format('DD/MM/YYYY')}
                  </Tag>
                  <Tag color="rgba(255,255,255,0.2)" style={{ color: 'white' }}>
                    <ClockCircleOutlined /> {safeRender(appointment?.startTime)} - {safeRender(appointment?.endTime)}
                  </Tag>
                  <Tag color="rgba(255,255,255,0.2)" style={{ color: 'white' }}>
                    <FileTextOutlined /> {safeRender(appointment?.appointmentId)}
                  </Tag>
                </Space>
              </div>
            </Col>
          </Row>
        </div>

        {/* Patient Info Card */}
        <div className="patient-info-card fade-in">
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Họ tên"
                value={safeRender(appointment?.patient?.user?.fullName)}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '16px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Tuổi"
                value={safeRender(appointment?.patient?.basicInfo?.age)}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Giới tính"
                value={safeRender(appointment?.patient?.basicInfo?.gender)}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="SĐT"
                value={safeRender(appointment?.patient?.contactInfo?.phone)}
                prefix={<PhoneOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
          </Row>
          <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Email"
                value={safeRender(appointment?.patient?.user?.email)}
                prefix={<MailOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '14px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Địa chỉ"
                value={safeRender(appointment?.patient?.contactInfo?.address)}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '14px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Lý do khám"
                value={safeRender(appointment?.reasonForVisit)}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '14px' }}
              />
            </Col>
          </Row>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator fade-in">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16}>
              <Progress 
                percent={((currentStep + 1) / 5) * 100} 
                strokeColor={{
                  '0%': '#1890ff',
                  '100%': '#40a9ff',
                }}
                trailColor="#f0f0f0"
                strokeWidth={8}
              />
            </Col>
            <Col xs={24} sm={8}>
              <div className="progress-stats">
                <div className="stat-item">
                  <div className="stat-value">{currentStep + 1}/5</div>
                  <div className="stat-label">Bước hiện tại</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{Math.round(((currentStep + 1) / 5) * 100)}%</div>
                  <div className="stat-label">Hoàn thành</div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Steps Container */}
        <div className="steps-container fade-in">
          <Alert
            message="💡 Bạn có thể click vào các bước đã hoàn thành để xem lại dữ liệu"
            type="info"
            showIcon
            className="alert-enhanced"
          />
          
          <Steps 
            current={currentStep} 
            onChange={handleStepChange}
            type="navigation"
            size="small"
          >
            <Step 
              title="Khám lâm sàng" 
              description="Khám tổng quát và chuyên khoa"
              status={appointment?.physicalExamination ? "finish" : "wait"}
              icon={<EyeOutlined />}
            />
            <Step 
              title="Chỉ định cận lâm sàng" 
              description="Chỉ định xét nghiệm và chờ kết quả"
              status={appointment?.labTests?.length > 0 ? "finish" : "wait"}
              icon={<ExperimentOutlined />}
            />
            <Step 
              title="Chẩn đoán" 
              description="Chẩn đoán dựa trên kết quả xét nghiệm"
              status={appointment?.finalDiagnosis ? "finish" : currentStep === 2 ? "process" : "wait"}
              icon={<CheckCircleOutlined />}
            />
            <Step 
              title="Thực hiện điều trị" 
              description="Thực hiện các dịch vụ răng (trám, nhổ, cạo vôi...)"
              status={appointment?.procedures ? "finish" : currentStep === 3 ? "process" : "wait"}
              icon={<MedicineBoxOutlined />}
            />
            <Step 
              title="Kê đơn & Theo dõi" 
              description="Kê đơn thuốc và lịch tái khám"
              status={appointment?.followUpInstructions ? "finish" : currentStep === 4 ? "process" : "wait"}
              icon={<ClockCircleOutlined />}
            />
          </Steps>
        </div>

        {/* Form Content */}
        <div className="step-content fade-in">
          <Card
            title={
              <div className="section-header">
                <div className="section-icon">
                  {currentStep === 0 && <EyeOutlined />}
                  {currentStep === 1 && <ExperimentOutlined />}
                  {currentStep === 2 && <CheckCircleOutlined />}
                  {currentStep === 3 && <MedicineBoxOutlined />}
                  {currentStep === 4 && <ClockCircleOutlined />}
                </div>
                <div>
                  <h3 className="section-title">
                    {currentStep === 0 && 'Khám lâm sàng'}
                    {currentStep === 1 && 'Chỉ định cận lâm sàng'}
                    {currentStep === 2 && 'Chẩn đoán'}
                    {currentStep === 3 && 'Thực hiện điều trị'}
                    {currentStep === 4 && 'Kê đơn & Theo dõi'}
                  </h3>
                  <p className="section-description">
                    {currentStep === 0 && 'Thực hiện khám tổng quát và chuyên khoa răng miệng'}
                    {currentStep === 1 && 'Chỉ định các xét nghiệm cần thiết và chờ kết quả'}
                    {currentStep === 2 && 'Chẩn đoán dựa trên kết quả xét nghiệm và khám lâm sàng'}
                    {currentStep === 3 && 'Thực hiện các dịch vụ răng như trám, nhổ, cạo vôi...'}
                    {currentStep === 4 && 'Kê đơn thuốc và lên lịch tái khám'}
                  </p>
                </div>
              </div>
            }
            style={{ border: 'none', boxShadow: 'none' }}
          >


            <Form form={form} layout="vertical">
              {/* Step 1: Physical Examination */}
              {currentStep === 0 && (
                <div className="form-section slide-in">
                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="vitalSigns"
                        label="Dấu hiệu sinh tồn"
                        className="form-item-enhanced"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Mạch, huyết áp, nhiệt độ, nhịp thở..."
                          prefix={<HeartOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="generalAppearance"
                        label="Tình trạng chung"
                        className="form-item-enhanced"
                      >
                        <TextArea
                          rows={3}
                          placeholder="Tinh thần, da niêm mạc, dinh dưỡng..."
                          prefix={<UserOutlined />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="oralExamination"
                    label="Khám răng miệng chuyên khoa"
                    rules={[{ required: true, message: 'Vui lòng nhập kết quả khám răng miệng' }]}
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Tình trạng răng, nướu, niêm mạc, khớp cắn, mô mềm (lưỡi, má, môi)..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="occlusionExamination"
                    label="Khám khớp cắn và chức năng"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Khớp cắn, chức năng nhai, nuốt, khớp thái dương hàm..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="otherFindings"
                    label="Các phát hiện khác"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Các dấu hiệu bất thường khác..."
                    />
                  </Form.Item>
                  
                  <div className="action-buttons">
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={async () => {
                          try {
                            const values = await form.validateFields();
                            await handleSavePhysicalExamination(values);
                          } catch (error) {
                            if (error.errorFields) {
                              message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                            } else {
                              console.error('Error validating form:', error);
                              message.error('Lỗi khi xử lý form');
                            }
                          }
                        }}
                        loading={loading}
                        className="btn-primary-enhanced"
                      >
                        Lưu khám lâm sàng
                      </Button>
                      <Button 
                        onClick={() => navigate('/doctor/appointments')}
                        className="btn-secondary-enhanced"
                      >
                        Quay lại hồ sơ bệnh án
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              {/* Step 2: Lab Tests Prescription */}
              {currentStep === 1 && (
                <div className="form-section slide-in">
                  <Alert
                    message="Chỉ định các xét nghiệm cần thiết"
                    description="Sau khi chỉ định xét nghiệm, bệnh nhân sẽ được chuyển sang phòng xét nghiệm. Bác sĩ có thể khám bệnh nhân khác trong thời gian chờ kết quả."
                    type="info"
                    showIcon
                    className="alert-enhanced"
                  />

                  <Form.Item
                    name="labTests"
                    label="Xét nghiệm nha khoa cần làm"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một xét nghiệm' }]}
                    className="form-item-enhanced"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn các xét nghiệm nha khoa cần thiết"
                      options={[
                        { label: 'Xét nghiệm vi khuẩn trong miệng', value: 'Oral Bacteria Test' },
                        { label: 'Xét nghiệm pH nước bọt', value: 'Saliva pH Test' },
                        { label: 'Xét nghiệm mảng bám răng', value: 'Plaque Test' },
                        { label: 'Xét nghiệm độ nhạy cảm răng', value: 'Tooth Sensitivity Test' },
                        { label: 'Xét nghiệm chức năng nhai', value: 'Chewing Function Test' }
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="imagingTests"
                    label="Chẩn đoán hình ảnh nha khoa"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một xét nghiệm hình ảnh' }]}
                    className="form-item-enhanced"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn các xét nghiệm hình ảnh nha khoa"
                      options={[
                        { label: 'X-quang răng (Periapical)', value: 'Periapical X-ray' },
                    { label: 'X-quang toàn cảnh (Panoramic)', value: 'Panoramic X-ray' },
                    { label: 'X-quang cắn cánh (Bitewing)', value: 'Bitewing X-ray' },
                    { label: 'CT Cone Beam (CBCT)', value: 'CBCT' },
                    { label: 'X-quang sọ mặt', value: 'Cephalometric X-ray' },
                    { label: 'X-quang TMJ (khớp thái dương hàm)', value: 'TMJ X-ray' }
                  ]}
                />
              </Form.Item>

                  <Form.Item
                    name="testInstructions"
                    label="Hướng dẫn cho bệnh nhân"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Hướng dẫn bệnh nhân trước khi làm xét nghiệm..."
                    />
                  </Form.Item>
                  
                  <div className="action-buttons">
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={async () => {
                          try {
                            const values = await form.validateFields();
                            await handleSaveLabTests(values);
                          } catch (error) {
                            if (error.errorFields) {
                              message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                            } else {
                              console.error('Error validating form:', error);
                              message.error('Lỗi khi xử lý form');
                            }
                          }
                        }}
                        loading={loading}
                        className="btn-primary-enhanced"
                      >
                        Chỉ định xét nghiệm
                      </Button>
                      <Button 
                        type="primary"
                        onClick={async () => {
                        try {
                          console.log('=== DEBUG: Chuyển bệnh nhân đi xét nghiệm ===');
                          console.log('AppointmentId:', appointmentId);
                          console.log('Appointment object:', appointment);
                          
                          // Validate appointmentId
                          if (!appointmentId) {
                            message.error('Không tìm thấy ID lịch hẹn');
                            return;
                          }

                          // Get form values
                          const formValues = form.getFieldsValue();
                          console.log('Form values:', formValues);

                          // Validate required fields
                          if (!formValues.labTests || formValues.labTests.length === 0) {
                            message.error('Vui lòng chọn ít nhất một xét nghiệm nha khoa');
                            return;
                          }

                          if (!formValues.imagingTests || formValues.imagingTests.length === 0) {
                            message.error('Vui lòng chọn ít nhất một xét nghiệm hình ảnh');
                            return;
                          }

                          const updateData = {
                            status: 'waiting-for-results',
                            labTests: formValues.labTests,
                            imagingTests: formValues.imagingTests,
                            testInstructions: formValues.testInstructions || ''
                          };

                          console.log('Update data to send:', updateData);
                          console.log('Calling updateAppointmentStatus...');

                          // Call API
                          const result = await updateAppointmentStatus(appointmentId, updateData);
                          console.log('API response:', result);
                          
                          message.success('Bệnh nhân đã được chuyển sang phòng xét nghiệm. Lịch hẹn sẽ chuyển sang trạng thái "Chờ kết quả xét nghiệm". Bạn có thể khám bệnh nhân khác và quay lại sau khi có kết quả.');
                          
                          console.log('Navigating to appointments...');
                          navigate('/doctor/appointments');
                        } catch (error) {
                          console.error('=== ERROR: Chuyển bệnh nhân đi xét nghiệm ===');
                          console.error('Error details:', error);
                          console.error('Error response:', error.response);
                          console.error('Error message:', error.message);
                          
                          message.error('Lỗi khi cập nhật trạng thái lịch hẹn: ' + (error.response?.data?.message || error.message));
                        }
                        }}
                        className="btn-primary-enhanced"
                      >
                        Chuyển bệnh nhân đi xét nghiệm
                      </Button>
                      <Button 
                        onClick={() => navigate('/doctor/appointments')}
                        className="btn-secondary-enhanced"
                      >
                        Quay lại hồ sơ bệnh án
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              {/* Step 3: Diagnosis based on Test Results */}
              {currentStep === 2 && (
                <div className="form-section slide-in">
                  <Alert
                    message="Chẩn đoán dựa trên kết quả xét nghiệm"
                    description="Dựa trên kết quả xét nghiệm và khám lâm sàng để đưa ra chẩn đoán chính xác và kế hoạch điều trị phù hợp."
                    type="success"
                    showIcon
                    className="alert-enhanced"
                  />

                  <Form.Item
                    name="testResults"
                    label="Kết quả xét nghiệm"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={2}
                      placeholder="Kết quả X-quang, xét nghiệm vi khuẩn, pH nước bọt..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="finalDiagnosis"
                    label="Chẩn đoán cuối cùng"
                    rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán cuối cùng' }]}
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Chẩn đoán chính xác dựa trên khám lâm sàng và kết quả xét nghiệm..."
                    />
                  </Form.Item>
                  
                  <div className="action-buttons">
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={async () => {
                          try {
                            const values = await form.validateFields();
                            await handleSaveDiagnosis(values);
                          } catch (error) {
                            if (error.errorFields) {
                              message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                            } else {
                              console.error('Error validating form:', error);
                              message.error('Lỗi khi xử lý form');
                            }
                          }
                        }}
                        loading={loading}
                        className="btn-primary-enhanced"
                      >
                        Lưu chẩn đoán
                      </Button>
                      <Button 
                        onClick={() => navigate('/doctor/appointments')}
                        className="btn-secondary-enhanced"
                      >
                        Quay lại hồ sơ bệnh án
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              {/* Step 3: Treatment Execution */}
              {currentStep === 3 && (
                <div className="form-section slide-in">
                  <Alert
                    message="Thực hiện điều trị nha khoa"
                    description="Ghi lại các dịch vụ răng đã thực hiện cho bệnh nhân (trám răng, nhổ răng, cạo vôi, chỉnh nha...)."
                    type="info"
                    showIcon
                    className="alert-enhanced"
                  />

                  <div style={{ marginBottom: '24px' }}>
                    <Button 
                      type="dashed" 
                      icon={<PlusOutlined />}
                      onClick={handleAddPrescriptionItem}
                      block
                      size="large"
                      className="btn-secondary-enhanced"
                    >
                      Thêm thuốc vào đơn
                    </Button>
                  </div>

                  {prescriptionItems.length > 0 && (
                    <div className="prescription-table" style={{ marginBottom: '24px' }}>
                      <Table
                        columns={prescriptionColumns}
                        dataSource={prescriptionItems}
                        rowKey="id"
                        pagination={false}
                        size="small"
                      />
                    </div>
                  )}


                  <Form.Item
                    name="procedures"
                    label="Thủ thuật/Phẫu thuật nha khoa"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Các thủ thuật nha khoa cần thực hiện (trám răng, nhổ răng, cạo vôi, chỉnh nha...)..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="homeCare"
                    label="Hướng dẫn chăm sóc tại nhà"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Hướng dẫn bệnh nhân chăm sóc tại nhà..."
                    />
                  </Form.Item>
                  
                  <div className="action-buttons">
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={async () => {
                          try {
                            const values = await form.validateFields();
                            await handleSaveTreatment(values);
                          } catch (error) {
                            if (error.errorFields) {
                              message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                            } else {
                              console.error('Error validating form:', error);
                              message.error('Lỗi khi xử lý form');
                            }
                          }
                        }}
                        loading={loading}
                        className="btn-primary-enhanced"
                      >
                        Lưu kết quả điều trị
                      </Button>
                      <Button 
                        onClick={() => navigate('/doctor/appointments')}
                        className="btn-secondary-enhanced"
                      >
                        Quay lại hồ sơ bệnh án
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              {/* Step 4: Prescription & Follow-up */}
              {currentStep === 4 && (
                <div className="form-section slide-in">
                  <Alert
                    message="Kê đơn thuốc và lên lịch tái khám"
                    description="Kê đơn thuốc cần thiết cho bệnh nhân và lên lịch tái khám phù hợp."
                    type="success"
                    showIcon
                    className="alert-enhanced"
                  />

                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="followUpDate"
                        label="Lịch tái khám"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày tái khám' }]}
                        className="form-item-enhanced"
                      >
                        <DatePicker 
                          style={{ width: '100%' }}
                          placeholder="Chọn ngày tái khám"
                      showTime={{ format: 'HH:mm' }}
                    />
                  </Form.Item>
                </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="followUpType"
                        label="Loại tái khám"
                        className="form-item-enhanced"
                      >
                        <Select placeholder="Chọn loại tái khám">
                          <Option value="routine">Tái khám định kỳ (6 tháng)</Option>
                          <Option value="urgent">Tái khám khẩn cấp (1-3 ngày)</Option>
                          <Option value="follow-up">Theo dõi điều trị (1-2 tuần)</Option>
                          <Option value="check-up">Kiểm tra sau điều trị (1 tháng)</Option>
                          <Option value="orthodontic">Tái khám chỉnh nha (1-2 tháng)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="followUpInstructions"
                    label="Hướng dẫn tái khám"
                    rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn tái khám' }]}
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Hướng dẫn chi tiết cho lần tái khám..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="warnings"
                    label="Cảnh báo"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Các dấu hiệu cần đến ngay bệnh viện..."
                    />
                  </Form.Item>
                  
                  <div className="action-buttons">
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<SaveOutlined />}
                        onClick={async () => {
                          try {
                            const values = await form.validateFields();
                            await handleSaveFollowUp(values);
                          } catch (error) {
                            if (error.errorFields) {
                              message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
                            } else {
                              console.error('Error validating form:', error);
                              message.error('Lỗi khi xử lý form');
                            }
                          }
                        }}
                        loading={loading}
                        className="btn-primary-enhanced"
                      >
                        Lưu theo dõi
                      </Button>
                      <Button 
                        onClick={() => navigate('/doctor/appointments')}
                        className="btn-secondary-enhanced"
                      >
                        Quay lại hồ sơ bệnh án
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

              {/* Step 5: Complete */}
              {currentStep === 4 && (
                <div className="form-section slide-in">
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Text style={{ fontSize: '16px', color: '#52c41a' }}>
                      ✅ Đã hoàn thành tất cả các bước khám bệnh
                    </Text>
                    <br />
                    <br />
                    <Space size="large">
                      <Button 
                        type="primary" 
                        size="large"
                        onClick={handleCompleteExamination}
                        loading={loading}
                        className="btn-primary-enhanced"
                        style={{
                          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                          fontWeight: '600',
                          fontSize: '16px',
                          height: '48px',
                          padding: '0 32px'
                        }}
                      >
                        ✅ Kết thúc khám bệnh
                      </Button>
                      <Button 
                        size="large"
                        onClick={() => navigate('/doctor/appointments')}
                        className="btn-secondary-enhanced"
                      >
                        Quay lại hồ sơ bệnh án
                      </Button>
                    </Space>
                  </div>
                </div>
              )}

            </Form>
          </Card>
        </div>

        {/* Prescription Modal */}
        <Modal
          title="Thêm thuốc vào đơn"
          open={prescriptionModalVisible}
          onCancel={() => {
            setPrescriptionModalVisible(false);
            prescriptionForm.resetFields();
          }}
          className="modal-enhanced"
        onOk={() => prescriptionForm.submit()}
        width={600}
      >
        <Form
          form={prescriptionForm}
          layout="vertical"
          onFinish={handleSavePrescriptionItem}
        >
          <Form.Item
            name="medicine"
            label="Tên thuốc"
            rules={[{ required: true, message: 'Vui lòng chọn thuốc' }]}
          >
            <Select
              showSearch
              placeholder="Chọn thuốc"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {medicines.map(medicine => (
                <Option key={medicine._id} value={medicine.name}>
                  {medicine.name} - {medicine.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dosage"
                label="Liều lượng"
                rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
              >
                <Input placeholder="VD: 500mg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="Tần suất"
                rules={[{ required: true, message: 'Vui lòng nhập tần suất' }]}
              >
                <Input placeholder="VD: 3 lần/ngày" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="duration"
            label="Thời gian sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập thời gian sử dụng' }]}
          >
            <Input placeholder="VD: 7 ngày" />
          </Form.Item>

          <Form.Item
            name="instructions"
            label="Hướng dẫn sử dụng"
          >
            <TextArea
              rows={3}
              placeholder="Hướng dẫn chi tiết cách sử dụng thuốc..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
  } catch (error) {
    console.error('Error rendering MedicalRecord:', error);
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h3>Đã xảy ra lỗi khi tải trang</h3>
        <p>Vui lòng thử lại sau</p>
        <Button onClick={() => navigate('/doctor/appointments')}>
          Quay lại danh sách lịch hẹn
        </Button>
      </div>
    );
  }
};

const MedicalRecordWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <MedicalRecord />
    </ErrorBoundary>
  );
};

export default MedicalRecordWithErrorBoundary;
