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
  Tag,
  Avatar
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
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getDoctorProfile();
      const doctorData = response.data;
      setProfile(doctorData);
      
      console.log('📋 Profile Data:', doctorData);
      console.log('📸 Avatar Path from API:', doctorData.user?.avatar);
      
      // Set avatar preview if exists - construct full URL
      if (doctorData.user?.avatar) {
        // Use base URL without /api for static files
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        // Static files are served from root, not /api
        const STATIC_BASE_URL = API_BASE_URL.replace('/api', '') || 'http://localhost:5000';
        let avatarUrl = doctorData.user.avatar;
        
        console.log('🔗 Original Avatar Path:', avatarUrl);
        console.log('🔗 Static Base URL:', STATIC_BASE_URL);
        
        // Handle different path formats
        if (avatarUrl.startsWith('http')) {
          // Already a full URL (e.g., Google avatar)
          console.log('✅ Full URL detected');
          setAvatarPreview(avatarUrl);
        } else if (avatarUrl.includes(':')) {
          // Absolute Windows path (e.g., D:\...\uploads\...)
          console.log('🔧 Processing Windows absolute path');
          // Extract just the uploads/... part
          const match = avatarUrl.match(/uploads[/\\].+$/);
          if (match) {
            avatarUrl = `${STATIC_BASE_URL}/${match[0].replace(/\\/g, '/')}`;
            console.log('✅ Extracted relative path:', match[0]);
          } else {
            // Fallback: try to construct from full path
            avatarUrl = avatarUrl.replace(/^.*[/\\]uploads[/\\]/, `${STATIC_BASE_URL}/uploads/`).replace(/\\/g, '/');
            console.log('⚠️  Using fallback path construction');
          }
          console.log('🔗 Final Avatar URL:', avatarUrl);
          setAvatarPreview(avatarUrl);
        } else {
          // Relative path (e.g., uploads/profile-xxx.jpg)
          console.log('🔧 Processing relative path');
          avatarUrl = `${STATIC_BASE_URL}/${avatarUrl.replace(/\\/g, '/')}`;
          console.log('🔗 Final Avatar URL:', avatarUrl);
          setAvatarPreview(avatarUrl);
        }
      } else {
        console.log('⚠️  No avatar found in profile data');
      }
      
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
        // Experience
        'experience.yearsOfPractice': doctorData.experience?.yearsOfPractice || 0,
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
      
      // Gửi dữ liệu dạng JSON (không có avatar upload)
      const updateData = {
        phone: values['user.phone'],
        specializations: values.specializations,
        experience: {
          yearsOfPractice: values['experience.yearsOfPractice'] || 0
        }
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
        >
          {/* Basic Information */}
          <Card title="Thông tin cơ bản" size="small" style={{ marginBottom: '16px' }}>
            {/* Avatar Display (Read-only) */}
            <Form.Item
              label="Ảnh đại diện"
              help="Ảnh đại diện chỉ có thể được thay đổi bởi quản trị viên"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar
                  src={avatarPreview || profile?.user?.avatar}
                  icon={<UserOutlined />}
                  size={100}
                  style={{ border: '2px solid #d9d9d9' }}
                  onError={() => {
                    console.error('❌ Failed to load avatar image:', avatarPreview || profile?.user?.avatar);
                    setAvatarPreview(null);
                  }}
                />
              </div>
            </Form.Item>

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

            <Form.Item
              name="experience.yearsOfPractice"
              label="Số năm kinh nghiệm"
              tooltip="Số năm thực hành y khoa của bạn"
            >
              <InputNumber
                min={0}
                placeholder="Ví dụ: 5"
                style={{ width: '100%' }}
              />
            </Form.Item>
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
