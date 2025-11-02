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
  Descriptions,
  Upload,
  Image
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
  UploadOutlined,
  PictureOutlined,
  MailOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { 
  getAppointmentDetails, 
  updateAppointmentStatus,
  getMedicines,
  getServices,
  getServiceDoctors
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
  const location = useLocation();
  const { appointmentId } = useParams();
  const [form] = Form.useForm();
  const [prescriptionForm] = Form.useForm();
  
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(location.state?.currentStep || 0);
  const [medicines, setMedicines] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceDoctors, setServiceDoctors] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [labTests, setLabTests] = useState([]);
  const [imagingTests, setImagingTests] = useState([]);
  const [followUpDate, setFollowUpDate] = useState(null);
  const [error, setError] = useState(null);
  const [testImages, setTestImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

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
        fetchServices();
        fetchServiceDoctors();
      } catch (err) {
        console.error('Error in useEffect:', err);
        setError(err.message || 'Unknown error');
      }
    } else {
      message.error('Không tìm thấy thông tin lịch hẹn');
      navigate('/doctor/appointments');
    }
  }, [appointmentId]);

  // Fetch medicines sau khi appointment đã được load
  useEffect(() => {
    if (appointment) {
      fetchMedicines();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointment]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const response = await getAppointmentDetails(appointmentId);
      
      if (response && response.data) {
        setAppointment(response.data);
        
        // Pre-fill form with existing data
        const formData = {
          // Step 1: Clinical Examination
          chiefComplaint: response.data.chiefComplaint || '',
          medicalHistory: response.data.medicalHistory || '',
          oralExamination: response.data.physicalExamination?.oralExamination || '',
          occlusionExamination: response.data.physicalExamination?.occlusionExamination || '',
          otherFindings: response.data.physicalExamination?.otherFindings || '',
          
          // Step 2: Lab Tests
          testServices: response.data.testServices?.map(s => typeof s === 'object' ? s._id : s) || [],
          testInstructions: response.data.testInstructions || '',
          
          // Step 3: Diagnosis
          imagingResults: response.data.imagingResults || '',
          labResults: response.data.labResults || '',
          testResults: response.data.testResults || '',
          finalDiagnosis: response.data.finalDiagnosis || '',
          prognosis: response.data.prognosis || '',
          
          // Step 4: Treatment
          selectedServices: response.data.selectedServices?.map(s => typeof s === 'object' ? s._id : s) || [],
          treatmentNotes: response.data.treatmentNotes || '',
          homeCare: response.data.homeCare || '',
          
          // Step 5: Follow-up
          followUpDate: response.data.followUpDate ? dayjs(response.data.followUpDate) : null,
          followUpType: response.data.followUpType || '',
          followUpInstructions: response.data.followUpInstructions || '',
          warnings: response.data.warnings || ''
        };
        
        form.setFieldsValue(formData);
        
        // Load test images if exist
        if (response.data.testImages && response.data.testImages.length > 0) {
          setTestImages(response.data.testImages);
        }
        
        // Load prescriptions if exist
        if (response.data.prescriptions && response.data.prescriptions.length > 0) {
          const prescriptions = response.data.prescriptions.map((p, index) => ({
            id: Date.now() + index,
            medicine: p.medicine,
            dosage: p.dosage,
            frequency: p.frequency,
            instructions: p.instructions
          }));
          setPrescriptionItems(prescriptions);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      message.error('Lỗi khi tải thông tin lịch hẹn: ' + (error.message || 'Unknown error'));
      navigate('/doctor/appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      // Lấy locationId từ appointment
      const locationId = appointment?.location?._id || 
                        appointment?.location || 
                        appointment?.schedule?.location?._id || 
                        appointment?.schedule?.location;
      
      if (!locationId) {
        message.warning('Không thể tải danh sách thuốc: thiếu thông tin cơ sở');
        return;
      }
      
      const response = await getMedicines(locationId);
      setMedicines(response.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      message.error('Lỗi khi tải danh sách thuốc: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchServices = async () => {
    try {
      const response = await getServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      message.error('Lỗi khi tải danh sách dịch vụ');
    }
  };

  const fetchServiceDoctors = async () => {
    try {
      const response = await getServiceDoctors();
      setServiceDoctors(response.data || []);
    } catch (error) {
      console.error('Error fetching service doctors:', error);
      message.error('Lỗi khi tải danh sách dịch vụ xét nghiệm');
    }
  };

  const handleStepChange = (step) => {
    // Cho phép chuyển đến bước trước đó để xem dữ liệu
    if (step < currentStep) {
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
        chiefComplaint: values.chiefComplaint,
        medicalHistory: values.medicalHistory,
        physicalExamination: {
          oralExamination: values.oralExamination,
          occlusionExamination: values.occlusionExamination,
          otherFindings: values.otherFindings
        },
        status: 'in-progress'
      });
      
      // Refresh appointment data để cập nhật Steps indicator
      await fetchAppointmentDetails();
      
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
        testServices: values.testServices,
        testInstructions: values.testInstructions
      });
      
      // Refresh appointment data để cập nhật Steps indicator
      await fetchAppointmentDetails();
      
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
        imagingResults: values.imagingResults,
        labResults: values.labResults,
        testResults: values.testResults,
        finalDiagnosis: values.finalDiagnosis,
        prognosis: values.prognosis
      });
      
      // Refresh appointment data để cập nhật Steps indicator
      await fetchAppointmentDetails();
      
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
        selectedServices: values.selectedServices,
        treatmentNotes: values.treatmentNotes,
        homeCare: values.homeCare
      });
      
      // Refresh appointment data để cập nhật Steps indicator
      await fetchAppointmentDetails();
      
      message.success('Lưu dịch vụ & điều trị thành công');
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
      
      // ✅ VALIDATION: Kiểm tra các fields bắt buộc từ các bước trước
      const missingFields = [];
      
      if (!appointment?.chiefComplaint) missingFields.push('Lý do khám (Step 1)');
      if (!appointment?.medicalHistory) missingFields.push('Tiền sử bệnh (Step 1)');
      if (!appointment?.physicalExamination?.oralExamination) missingFields.push('Khám răng miệng (Step 1)');
      if (!appointment?.finalDiagnosis) missingFields.push('Chẩn đoán xác định (Step 3)');
      
      if (missingFields.length > 0) {
        message.error({
          content: (
            <div>
              <strong>Không thể hoàn thành khám bệnh!</strong>
              <br />
              <span>Vui lòng điền đầy đủ các thông tin bắt buộc:</span>
              <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                {missingFields.map((field, index) => (
                  <li key={index}>{field}</li>
                ))}
              </ul>
            </div>
          ),
          duration: 5
        });
        setLoading(false);
        return;
      }
      
      // Prepare prescription data
      const prescriptionData = prescriptionItems.map(item => ({
        medicine: item.medicine,
        dosage: item.dosage,
        frequency: item.frequency,
        // Lưu số ngày vào duration để tương thích schema trên server/medical record
        duration: item.days ? `${item.days}` : undefined,
        instructions: item.instructions
      }));
      
      await updateAppointmentStatus(appointmentId, {
        prescriptions: prescriptionData,
        followUpDate: values.followUpDate,
        followUpType: values.followUpType,
        followUpInstructions: values.followUpInstructions,
        warnings: values.warnings,
        status: 'completed'
      });
      
      message.success('Lưu đơn thuốc & tái khám thành công! Hoàn thành khám bệnh.');
      
      // Navigate back to appointments after a short delay
      setTimeout(() => {
        navigate('/doctor/appointments');
      }, 1500);
    } catch (error) {
      console.error('Error saving follow-up:', error);
      message.error('Lỗi khi lưu đơn thuốc & tái khám');
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
      instructions: values.instructions,
      days: Number(values.days || 1)
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
      // Prescription data will be saved as part of the medical record
      // when completing the examination
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
      title: 'Số ngày',
      dataIndex: 'days',
      key: 'days',
      render: (v) => (v ? v : 1)
    },
    {
      title: 'SL/ngày',
      key: 'qtyPerDay',
      render: (_, record) => {
        const extractNumber = (text) => {
          const m = String(text || '').match(/\d+(?:[\.,]\d+)?/);
          if (!m) return 0;
          const n = parseFloat(m[0].replace(',', '.'));
          return isNaN(n) ? 0 : n;
        };
        const d = extractNumber(record.dosage);
        const f = extractNumber(record.frequency);
        return d * f || '';
      }
    },
    {
      title: 'Tổng SL',
      key: 'totalQty',
      render: (_, record) => {
        const extractNumber = (text) => {
          const m = String(text || '').match(/\d+(?:[\.,]\d+)?/);
          if (!m) return 0;
          const n = parseFloat(m[0].replace(',', '.'));
          return isNaN(n) ? 0 : n;
        };
        const d = extractNumber(record.dosage);
        const f = extractNumber(record.frequency);
        const days = Number(record.days || 1);
        const perDay = d * f;
        const total = perDay * (Number.isFinite(days) && days > 0 ? days : 1);
        return total || '';
      }
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  Hồ sơ bệnh án
                </Title>
                {appointment?.status === 'completed' && (
                  <Button 
                    type="primary"
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                    style={{ marginLeft: '16px' }}
                  >
                    In hồ sơ
                  </Button>
                )}
              </div>
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>
                Bệnh nhân: {safeRender(appointment?.patient?.basicInfo?.fullName || appointment?.patient?.user?.fullName)}
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
                value={safeRender(appointment?.patient?.basicInfo?.fullName || appointment?.patient?.user?.fullName)}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '16px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Tuổi"
                value={safeRender((() => {
                  const dob = appointment?.patient?.basicInfo?.dateOfBirth;
                  if (!dob) return 'Chưa cập nhật';
                  const birth = dayjs(dob);
                  if (!birth.isValid()) return 'Chưa cập nhật';
                  return dayjs().diff(birth, 'year');
                })())}
                prefix={<HeartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Giới tính"
                value={safeRender(
                  appointment?.patient?.basicInfo?.gender === 'male' ? 'Nam' :
                  appointment?.patient?.basicInfo?.gender === 'female' ? 'Nữ' :
                  appointment?.patient?.basicInfo?.gender === 'other' ? 'Khác' :
                  'Chưa cập nhật'
                )}
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
                value={safeRender(appointment?.patient?.contactInfo?.email || appointment?.patient?.user?.email)}
                prefix={<MailOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '14px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Địa chỉ"
                value={safeRender(
                  appointment?.patient?.contactInfo?.address 
                    ? `${appointment.patient.contactInfo.address.street}, ${appointment.patient.contactInfo.address.city}, ${appointment.patient.contactInfo.address.state}`
                    : 'Chưa cập nhật'
                )}
                prefix={<HomeOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '14px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Ngày sinh"
                value={safeRender(
                  appointment?.patient?.basicInfo?.dateOfBirth 
                    ? dayjs(appointment.patient.basicInfo.dateOfBirth).format('DD/MM/YYYY')
                    : 'Chưa cập nhật'
                )}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '14px' }}
              />
            </Col>
          </Row>
          <Row gutter={[24, 16]} style={{ marginTop: '16px' }}>
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
              description={
                appointment?.chiefComplaint && appointment?.medicalHistory && appointment?.physicalExamination?.oralExamination
                  ? "✓ Đã hoàn thành"
                  : "⚠ Chưa đầy đủ thông tin"
              }
              status={
                appointment?.chiefComplaint && appointment?.medicalHistory && appointment?.physicalExamination?.oralExamination
                  ? "finish" 
                  : currentStep === 0 ? "process" : "error"
              }
              icon={<EyeOutlined />}
            />
            <Step 
              title="Chỉ định cận lâm sàng" 
              description="Chỉ định xét nghiệm và chờ kết quả"
              status={appointment?.labTests?.length > 0 || appointment?.imagingTests?.length > 0 ? "finish" : currentStep === 1 ? "process" : "wait"}
              icon={<ExperimentOutlined />}
            />
            <Step 
              title="Chẩn đoán" 
              description={
                appointment?.finalDiagnosis
                  ? "✓ Đã hoàn thành"
                  : "⚠ Chưa đầy đủ thông tin"
              }
              status={
                appointment?.finalDiagnosis
                  ? "finish" 
                  : currentStep === 2 ? "process" : "error"
              }
              icon={<CheckCircleOutlined />}
            />
            <Step 
              title="Dịch vụ & Điều trị" 
              description="Chọn dịch vụ và thực hiện điều trị"
              status={appointment?.treatmentNotes ? "finish" : currentStep === 3 ? "process" : "wait"}
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
              <div className="easection-hder">
                <div className="section-icon">
                  {currentStep === 0 && <EyeOutlined />}
                  {currentStep === 1 && <ExperimentOutlined />}
                  {currentStep === 2 && <CheckCircleOutlined />}
                  {currentStep === 3 && <MedicineBoxOutlined />}
                  {currentStep === 4 && <ClockCircleOutlined />}
                </div>
                <div>
                  <h3 className="step-title">
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
                          name="chiefComplaint"
                          label="Lý do đến khám"
                          rules={[{ required: true, message: 'Vui lòng nhập lý do đến khám' }]}
                          className="form-item-enhanced"
                        >
                          <TextArea
                            rows={3}
                            placeholder="Đau răng, sưng nướu, chảy máu chân răng, muốn làm răng sứ..."
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          name="medicalHistory"
                          label="Tiền sử bệnh"
                          className="form-item-enhanced"
                        >
                          <TextArea
                            rows={3}
                            placeholder="Tiểu đường, tim mạch, huyết áp, dị ứng thuốc, đang uống thuốc gì..."
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
                    name="testServices"
                    label="Xét nghiệm & Chẩn đoán cần làm"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một xét nghiệm/chẩn đoán' }]}
                    className="form-item-enhanced"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn các xét nghiệm và chẩn đoán cần thiết"
                      options={serviceDoctors.map(service => {
                        const priceValue = (service.price ?? service.servicePrice ?? 0);
                        const priceText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceValue);
                        return {
                          label: `${service.serviceName} - ${priceText}`,
                          value: service._id
                        };
                      })}
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
                          // Validate appointmentId
                          if (!appointmentId) {
                            message.error('Không tìm thấy ID lịch hẹn');
                            return;
                          }

                          // Get form values
                          const formValues = form.getFieldsValue();

                          // Validate required fields
                          if (!formValues.testServices || formValues.testServices.length === 0) {
                            message.error('Vui lòng chọn ít nhất một xét nghiệm/chẩn đoán');
                            return;
                          }

                          const updateData = {
                            status: 'waiting-for-results',
                            testServices: formValues.testServices,
                            testInstructions: formValues.testInstructions || ''
                          };

                          // Call API
                          await updateAppointmentStatus(appointmentId, updateData);
                          
                          message.success('Bệnh nhân đã được chuyển sang phòng xét nghiệm. Lịch hẹn sẽ chuyển sang trạng thái "Chờ kết quả xét nghiệm". Bạn có thể khám bệnh nhân khác và quay lại sau khi có kết quả.');
                          navigate('/doctor/appointments');
                        } catch (error) {
                          console.error('Error transferring patient for tests:', error);
                          
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

                  {/* Upload hình ảnh xét nghiệm */}
                  <Form.Item
                    label={
                      <span>
                        <PictureOutlined /> Hình ảnh kết quả xét nghiệm
                      </span>
                    }
                    className="form-item-enhanced"
                  >
                    <Upload
                      listType="picture-card"
                      fileList={testImages.map((url, index) => ({
                        uid: `${index}`,
                        name: `test-image-${index + 1}`,
                        status: 'done',
                        url: url
                      }))}
                      customRequest={async ({ file, onSuccess, onError }) => {
                        setUploadingImage(true);
                        const formData = new FormData();
                        formData.append('image', file);
                        
                        try {
                          const response = await fetch(
                            `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/upload/image`,
                            {
                              method: 'POST',
                              headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              },
                              body: formData
                            }
                          );
                          
                          if (response.ok) {
                            const data = await response.json();
                            const newImages = [...testImages, data.data.url];
                            setTestImages(newImages);
                            
                            // Lưu vào database
                            await fetch(
                              `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/appointments/${appointmentId}`,
                              {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                                },
                                body: JSON.stringify({ testImages: newImages })
                              }
                            );
                            
                            message.success('Upload hình ảnh thành công');
                            onSuccess();
                          } else {
                            throw new Error('Upload failed');
                          }
                        } catch (error) {
                          console.error('Upload error:', error);
                          message.error('Lỗi khi upload hình ảnh');
                          onError(error);
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                      onRemove={async (file) => {
                        try {
                          const imageUrl = file.url;
                          const filename = imageUrl.split('/').pop();
                          
                          // Xóa file từ server
                          await fetch(
                            `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/upload/image/${filename}`,
                            {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              }
                            }
                          );
                          
                          // Cập nhật state
                          const newImages = testImages.filter(url => url !== imageUrl);
                          setTestImages(newImages);
                          
                          // Cập nhật database
                          await fetch(
                            `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'}/doctor/appointments/${appointmentId}`,
                            {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              },
                              body: JSON.stringify({ testImages: newImages })
                            }
                          );
                          
                          message.success('Đã xóa hình ảnh');
                          return true;
                        } catch (error) {
                          console.error('Delete error:', error);
                          message.error('Lỗi khi xóa hình ảnh');
                          return false;
                        }
                      }}
                      onPreview={(file) => {
                        window.open(file.url, '_blank');
                      }}
                      accept="image/*"
                      capture="environment"
                      disabled={uploadingImage}
                    >
                      {testImages.length >= 8 ? null : (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                      )}
                    </Upload>
                    <div style={{ color: '#8c8c8c', fontSize: '12px', marginTop: '8px' }}>
                      Hỗ trợ: JPG, PNG, GIF. Tối đa 8 hình ảnh (mỗi ảnh ≤ 5MB)
                    </div>
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

              {/* Step 4: Service Selection & Treatment Execution */}
              {currentStep === 3 && (
                <div className="form-section slide-in">
                  <Alert
                    message="Chọn dịch vụ và thực hiện điều trị"
                    description="Sau khi chọn dịch vụ, bệnh nhân sẽ được chuyển sang phòng thực hiện dịch vụ. Bác sĩ có thể khám bệnh nhân khác trong thời gian chờ hoàn tất dịch vụ."
                    type="info"
                    showIcon
                    className="alert-enhanced"
                  />

                  {/* Chọn dịch vụ */}
                  <Form.Item
                    name="selectedServices"
                    label="Chọn dịch vụ điều trị"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một dịch vụ' }]}
                    className="form-item-enhanced"
                  >
                    <Select
                      mode="multiple"
                      placeholder="Chọn các dịch vụ nha khoa"
                      style={{ width: '100%' }}
                      showSearch
                      filterOption={(input, option) => {
                        // Find the service by value (service._id)
                        const service = services.find(s => s._id === option.value);
                        if (!service) return false;
                        // Search by service name
                        return service.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                      }}
                    >
                      {services.map(service => (
                        <Option key={service._id} value={service._id}>
                          {service.name} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(service.price)}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  <Form.Item
                    name="treatmentNotes"
                    label="Ghi chú điều trị"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Ghi chú thêm về quá trình điều trị (nếu có)..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="homeCare"
                    label="Hướng dẫn chăm sóc tại nhà"
                    rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn chăm sóc' }]}
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Hướng dẫn bệnh nhân chăm sóc tại nhà (vệ sinh răng miệng, kiêng thức ăn, uống thuốc giảm đau...)..."
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
                        Chỉ định dịch vụ
                      </Button>
                      <Button 
                        type="primary"
                        onClick={async () => {
                          try {
                            // Validate appointmentId
                            if (!appointmentId) {
                              message.error('Không tìm thấy ID lịch hẹn');
                              return;
                            }

                            // Get form values
                            const formValues = form.getFieldsValue();

                            // Validate required fields
                            if (!formValues.selectedServices || formValues.selectedServices.length === 0) {
                              message.error('Vui lòng chọn ít nhất một dịch vụ');
                              return;
                            }

                            if (!formValues.homeCare || formValues.homeCare.trim() === '') {
                              message.error('Vui lòng nhập hướng dẫn chăm sóc tại nhà');
                              return;
                            }

                            const updateData = {
                              status: 'in-treatment',
                              selectedServices: formValues.selectedServices,
                              treatmentNotes: formValues.treatmentNotes || '',
                              homeCare: formValues.homeCare
                            };

                            // Call API
                            await updateAppointmentStatus(appointmentId, updateData);
                            
                            message.success('Bệnh nhân đã được chuyển sang phòng thực hiện dịch vụ. Lịch hẹn sẽ chuyển sang trạng thái "Đang điều trị". Bạn có thể khám bệnh nhân khác và quay lại sau khi hoàn tất dịch vụ.');
                            navigate('/doctor/appointments');
                          } catch (error) {
                            console.error('Error details:', error);
                            message.error('Lỗi khi cập nhật trạng thái lịch hẹn: ' + (error.response?.data?.message || error.message));
                          }
                        }}
                        className="btn-primary-enhanced"
                      >
                        Chuyển bệnh nhân đi làm dịch vụ
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

              {/* Step 5: Prescription & Follow-up */}
              {currentStep === 4 && (
                <div className="form-section slide-in">
                  <Alert
                    message="Kê đơn thuốc và lên lịch tái khám"
                    description="Kê đơn thuốc cần thiết cho bệnh nhân sau điều trị và lên lịch tái khám phù hợp."
                    type="success"
                    showIcon
                    className="alert-enhanced"
                  />

                  {/* Đơn thuốc */}
                  <Divider orientation="left">💊 Đơn thuốc</Divider>
                  
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

                  {/* Lịch tái khám */}
                  <Divider orientation="left">📅 Lịch tái khám</Divider>

                  <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="followUpDate"
                        label="Ngày tái khám"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày tái khám' }]}
                        className="form-item-enhanced"
                      >
                        <DatePicker 
                          style={{ width: '100%' }}
                          placeholder="Chọn ngày tái khám"
                          showTime={{ format: 'HH:mm' }}
                          disabledDate={(current) => {
                            // Không cho chọn ngày quá khứ (trước hôm nay)
                            return current && current < dayjs().startOf('day');
                          }}
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
                      placeholder="Hướng dẫn chi tiết cho lần tái khám (mục đích, cần chuẩn bị gì...)..."
                    />
                  </Form.Item>

                  <Form.Item
                    name="warnings"
                    label="Cảnh báo & Lưu ý"
                    className="form-item-enhanced"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Các dấu hiệu bất thường cần đến ngay bệnh viện (chảy máu nhiều, sưng quá mức, đau dữ dội không giảm...)..."
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
                        Lưu đơn thuốc & Tái khám
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
              filterOption={(input, option) => {
                // Find the medicine by value (medicine.name)
                const medicine = medicines.find(m => m.name === option.value);
                if (!medicine) return false;
                // Search by medicine name
                return medicine.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
            >
              {medicines.map(medicine => {
                const stock = medicine.currentStock ?? 0;
                const stockStatus = stock > 0 ? '✓' : '✗';
                const stockColor = stock > 0 ? '#52c41a' : '#ff4d4f';
                return (
                  <Option key={medicine._id} value={medicine.name}>
                    <span>
                      <span style={{ marginRight: 8, color: stockColor }}>{stockStatus}</span>
                      {medicine.name} - {medicine.description}
                      <span style={{ marginLeft: 8, color: stockColor, fontWeight: 'bold' }}>
                        (Tồn: {stock})
                      </span>
                    </span>
                  </Option>
                );
              })}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dosage"
                label="Liều lượng"
                rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
              >
                <Input placeholder="VD: 2 viên" />
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

          {/* Số lượng/ngày tự tính từ liều lượng x tần suất */}
          <Form.Item shouldUpdate noStyle>
            {() => {
              const dosageText = prescriptionForm.getFieldValue('dosage') || '';
              const frequencyText = prescriptionForm.getFieldValue('frequency') || '';
              const days = Number(prescriptionForm.getFieldValue('days') || 1);
              const extractNumber = (text) => {
                const m = String(text).match(/\d+(?:[\.,]\d+)?/);
                if (!m) return 0;
                const n = parseFloat(m[0].replace(',', '.'));
                return isNaN(n) ? 0 : n;
              };
              const dosageNum = extractNumber(dosageText);
              const freqNum = extractNumber(frequencyText);
              const qtyPerDay = dosageNum * freqNum;
              const totalQty = qtyPerDay * (Number.isFinite(days) && days > 0 ? days : 1);
              return (
                <div>
                  <Form.Item label="Số lượng/ngày (tự tính)">
                    <Input value={qtyPerDay || ''} placeholder="Tự tính theo Liều lượng x Tần suất" disabled />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="days" label="Số ngày dùng" initialValue={1}>
                        <Input type="number" min={1} step={1} placeholder="VD: 5" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Tổng số lượng (ước tính)">
                        <Input value={totalQty || ''} placeholder="Số lượng/ngày x Số ngày" disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              );
            }}
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
