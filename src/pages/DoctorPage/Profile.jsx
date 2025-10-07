import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  DatePicker, 
  InputNumber, 
  Switch, 
  message,
  Spin,
  Row,
  Col,
  Divider,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined,
  EnvironmentOutlined,
  BookOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getDoctorProfile, updateDoctorProfile } from '../../services/doctorService';

const { Option } = Select;
const { TextArea } = Input;

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getDoctorProfile();
      setProfile(response.data);
      
      // Set form values
      form.setFieldsValue({
        ...response.data,
        dateOfBirth: response.data.user?.dateOfBirth ? dayjs(response.data.user.dateOfBirth) : null,
        // Set work schedule
        'workSchedule.monday.startTime': response.data.workSchedule?.monday?.startTime,
        'workSchedule.monday.endTime': response.data.workSchedule?.monday?.endTime,
        'workSchedule.monday.isWorking': response.data.workSchedule?.monday?.isWorking,
        // ... other days
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Lỗi khi tải thông tin hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      
      // Format work schedule
      const workSchedule = {
        monday: {
          startTime: values['workSchedule.monday.startTime'],
          endTime: values['workSchedule.monday.endTime'],
          isWorking: values['workSchedule.monday.isWorking'] || false
        },
        tuesday: {
          startTime: values['workSchedule.tuesday.startTime'],
          endTime: values['workSchedule.tuesday.endTime'],
          isWorking: values['workSchedule.tuesday.isWorking'] || false
        },
        wednesday: {
          startTime: values['workSchedule.wednesday.startTime'],
          endTime: values['workSchedule.wednesday.endTime'],
          isWorking: values['workSchedule.wednesday.isWorking'] || false
        },
        thursday: {
          startTime: values['workSchedule.thursday.startTime'],
          endTime: values['workSchedule.thursday.endTime'],
          isWorking: values['workSchedule.thursday.isWorking'] || false
        },
        friday: {
          startTime: values['workSchedule.friday.startTime'],
          endTime: values['workSchedule.friday.endTime'],
          isWorking: values['workSchedule.friday.isWorking'] || false
        },
        saturday: {
          startTime: values['workSchedule.saturday.startTime'],
          endTime: values['workSchedule.saturday.endTime'],
          isWorking: values['workSchedule.saturday.isWorking'] || false
        },
        sunday: {
          startTime: values['workSchedule.sunday.startTime'],
          endTime: values['workSchedule.sunday.endTime'],
          isWorking: values['workSchedule.sunday.isWorking'] || false
        }
      };

      const updateData = {
        ...values,
        workSchedule,
        // Remove form field prefixes
        'workSchedule.monday.startTime': undefined,
        'workSchedule.monday.endTime': undefined,
        'workSchedule.monday.isWorking': undefined,
        // ... other days
      };

      await updateDoctorProfile(updateData);
      message.success('Cập nhật hồ sơ thành công');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Lỗi khi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card title="Hồ sơ bác sĩ">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            isAcceptingNewPatients: true,
            isActive: true
          }}
        >
          {/* Basic Information */}
          <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="user.fullName"
                  label="Họ và tên"
                  rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="user.email"
                  label="Email"
                  rules={[{ required: true, message: 'Vui lòng nhập email' }]}
                >
                  <Input prefix={<MailOutlined />} disabled />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="user.phone"
                  label="Số điện thoại"
                >
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="consultationFee"
                  label="Phí khám (VNĐ)"
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* Professional Information */}
          <Card title="Thông tin chuyên môn" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="credentials.medicalLicense"
                  label="Giấy phép hành nghề y"
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="credentials.dentalLicense"
                  label="Giấy phép hành nghề nha khoa"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="specializations"
              label="Chuyên khoa"
            >
              <Select
                mode="tags"
                placeholder="Nhập chuyên khoa"
                style={{ width: '100%' }}
              />
            </Form.Item>

            <Form.Item
              name="experience.yearsOfPractice"
              label="Số năm kinh nghiệm"
            >
              <InputNumber min={0} max={50} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="biography"
              label="Tiểu sử"
            >
              <TextArea rows={4} placeholder="Nhập tiểu sử của bạn..." />
            </Form.Item>
          </Card>

          {/* Work Schedule */}
          <Card title="Lịch làm việc định kỳ" size="small" style={{ marginBottom: '16px' }}>
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
              <Row key={day} gutter={16} style={{ marginBottom: '8px' }}>
                <Col span={4}>
                  <div style={{ paddingTop: '6px', fontWeight: 500 }}>
                    {day === 'monday' && 'Thứ 2'}
                    {day === 'tuesday' && 'Thứ 3'}
                    {day === 'wednesday' && 'Thứ 4'}
                    {day === 'thursday' && 'Thứ 5'}
                    {day === 'friday' && 'Thứ 6'}
                    {day === 'saturday' && 'Thứ 7'}
                    {day === 'sunday' && 'Chủ nhật'}
                  </div>
                </Col>
                <Col span={4}>
                  <Form.Item name={`workSchedule.${day}.isWorking`} valuePropName="checked">
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={7}>
                  <Form.Item name={`workSchedule.${day}.startTime`}>
                    <Input placeholder="08:00" />
                  </Form.Item>
                </Col>
                <Col span={1} style={{ textAlign: 'center', paddingTop: '6px' }}>
                  -
                </Col>
                <Col span={7}>
                  <Form.Item name={`workSchedule.${day}.endTime`}>
                    <Input placeholder="17:00" />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </Card>

          {/* Status */}
          <Card title="Trạng thái" size="small" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isAcceptingNewPatients"
                  label="Nhận bệnh nhân mới"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Trạng thái hoạt động"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving}
              size="large"
            >
              Cập nhật hồ sơ
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
