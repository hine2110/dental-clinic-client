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
      const doctorData = response.data;
      setProfile(doctorData);
      
      // Set form values with proper structure
      // Use array notation for nested fields in Ant Design Form
      form.setFieldsValue({
        // User information - use array notation
        'user.fullName': doctorData.user?.fullName,
        'user.email': doctorData.user?.email,
        'user.phone': doctorData.user?.phone,
        // Doctor information
        specializations: doctorData.specializations,
        // Credentials - use array notation
        'credentials.medicalLicense': doctorData.credentials?.medicalLicense,
        'credentials.dentalLicense': doctorData.credentials?.dentalLicense,
        // Status
        isAcceptingNewPatients: doctorData.isAcceptingNewPatients,
        isActive: doctorData.isActive,
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
      
      // Doctor không cập nhật workSchedule - do Admin/Staff quản lý
      const updateData = {
        phone: values['user.phone'],
        specializations: values.specializations,
        isAcceptingNewPatients: values.isAcceptingNewPatients,
        isActive: values.isActive
      };

      await updateDoctorProfile(updateData);
      message.success('Cập nhật hồ sơ thành công');
      await fetchProfile();
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      message.error('Lỗi khi cập nhật hồ sơ: ' + (error.response?.data?.message || error.message));
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
                  <Input prefix={<UserOutlined />} disabled />
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
              <Col span={24}>
                <Form.Item
                  name="user.phone"
                  label="Số điện thoại"
                  tooltip="Bạn có thể cập nhật số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                    { 
                      pattern: /^[0-9]{10}$/,
                      message: 'Số điện thoại phải có đúng 10 chữ số' 
                    }
                  ]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Nhập 10 chữ số" maxLength={10} />
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
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="credentials.dentalLicense"
                  label="Giấy phép hành nghề nha khoa"
                >
                  <Input disabled />
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

          <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={saving}
              size="large"
              style={{ 
                minWidth: '200px',
                height: '45px',
                fontSize: '16px',
                fontWeight: 500
              }}
            >
              {saving ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
