import React, { useState } from 'react';
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
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './DoctorLayout.css';

const { Header, Sider, Content } = Layout;

const DoctorLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

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
      key: '/doctor/prescriptions',
      icon: <FileTextOutlined />,
      label: 'Đơn thuốc',
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
              icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: '16px', width: 64, height: 64 }}
            />
          </div>
          
          <div className="header-right">
            <Badge count={0} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                size="large"
                className="notification-btn"
              />
            </Badge>
            
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="user-info">
                <Avatar 
                  src={user?.avatar} 
                  icon={<UserOutlined />}
                  size="large"
                />
                <div className="user-details">
                  <span className="user-name">{user?.fullName}</span>
                  <span className="user-role">Bác sĩ</span>
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
