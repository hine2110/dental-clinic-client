import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Badge } from 'antd';
import { 
  DashboardOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  FileSearchOutlined,
  ScheduleOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { getDoctorProfile } from '../../services/doctorService';
import './DoctorLayout.css';

const { Header, Sider, Content } = Layout;

const DoctorLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Fetch doctor profile to get avatar
  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await getDoctorProfile();
        const doctorData = response.data;
        
        if (doctorData.user?.avatar) {
          // Construct full URL for avatar (same logic as Profile.jsx)
          const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
          const STATIC_BASE_URL = API_BASE_URL.replace('/api', '') || 'http://localhost:5000';
          let avatar = doctorData.user.avatar;
          
          if (avatar.startsWith('http')) {
            // Already a full URL (e.g., Google avatar)
            setAvatarUrl(avatar);
          } else if (avatar.includes(':')) {
            // Absolute Windows path - extract uploads/... part
            const match = avatar.match(/uploads[/\\].+$/);
            if (match) {
              setAvatarUrl(`${STATIC_BASE_URL}/${match[0].replace(/\\/g, '/')}`);
            } else {
              setAvatarUrl(avatar.replace(/^.*[/\\]uploads[/\\]/, `${STATIC_BASE_URL}/uploads/`).replace(/\\/g, '/'));
            }
          } else {
            // Relative path
            setAvatarUrl(`${STATIC_BASE_URL}/${avatar.replace(/\\/g, '/')}`);
          }
        }
      } catch (error) {
        console.error('Error fetching doctor avatar:', error);
      }
    };
    
    if (user?.role === 'doctor') {
      fetchAvatar();
    }
  }, [user]);

  const menuItems = [
    {
      key: '/doctor',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/doctor/appointments',
      icon: <CalendarOutlined />,
      label: 'Lịch hẹn',
    },
    {
      key: '/doctor/patients',
      icon: <UserOutlined />,
      label: 'Bệnh nhân',
    },
    {
      key: '/doctor/medical-records',
      icon: <FileSearchOutlined />,
      label: 'Hồ sơ bệnh án',
    },
    {
      key: '/doctor/schedule',
      icon: <ScheduleOutlined />,
      label: 'Lịch làm việc',
    },
    {
      key: '/doctor/profile',
      icon: <SettingOutlined />,
      label: 'Hồ sơ',
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Hồ sơ cá nhân',
      onClick: () => navigate('/doctor/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="doctor-sider"
      >
        <div className="doctor-logo">
          <h3>{collapsed ? 'DC' : 'Dental Clinic'}</h3>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header className="doctor-header">
          <div className="header-left">
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="menu-toggle-btn"
            />
            <div className="header-brand">
              <h2>Beauty Clinic</h2>
              <span className="brand-subtitle">Hệ thống quản lý phòng khám</span>
            </div>
          </div>
          
          <div className="header-center">
            <div className="current-time">
              <CalendarOutlined />
              <span>{new Date().toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          
          <div className="header-right">
            <div className="header-actions">
              <Badge count={0} size="small" className="notification-badge">
                <Button 
                  type="text" 
                  icon={<BellOutlined />} 
                  className="action-btn notification-btn"
                  title="Thông báo"
                />
              </Badge>
              
              <Button 
                type="text" 
                icon={<SettingOutlined />} 
                className="action-btn settings-btn"
                title="Cài đặt"
                onClick={() => navigate('/doctor/profile')}
              />
            </div>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
              trigger={['click']}
            >
              <div className="user-profile">
                <div className="user-avatar">
                  <Avatar 
                    src={avatarUrl || user?.avatar} 
                    icon={<UserOutlined />}
                    size={40}
                  />
                  <div className="status-indicator online"></div>
                </div>
                <div className="user-info">
                  <div className="user-name">{user?.fullName || 'Bác sĩ'}</div>
                  <div className="user-role">
                    <span className="role-badge">BÁC SĨ</span>
                  </div>
                </div>
                <div className="dropdown-arrow">
                  <DownOutlined />
                </div>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="doctor-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DoctorLayout;
