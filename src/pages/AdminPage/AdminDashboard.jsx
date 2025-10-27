import React, { useEffect, useState } from "react";
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  message,
  Tabs,
  Input,
  Select,
  Avatar,
  Dropdown,
  Menu, 
  Descriptions, 
  List, 
  Spin, 
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  MoreOutlined,
  ExportOutlined,
  ReloadOutlined,
  SettingOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TeamOutlined,
  BarChartOutlined,
  EyeOutlined, 
  CalendarOutlined, // <-- ĐÃ THÊM LẠI
  HistoryOutlined, // Giữ lại cho History Modal
} from "@ant-design/icons";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import CreateAccountModal from "./CreateAccountModal";
import { adminService } from "../../services/adminService";
import ServicesManager from "./ServicesManager";
import DiscountsManager from "./DiscountsManager";
import ScheduleManagement from "./ScheduleManagement";
import ServiceDoctorManager from "./ServiceDoctor";
import "./AdminDashboard.css";
import moment from "moment"; 

const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Search } = Input;
const { Option } = Select;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");

  // State cho modal view detail
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  // State cho modal lịch sử khám bệnh
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers({ limit: "all" });
      if (response.success) {
        setUsers(response.data || []);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("❌ Fetch users error:", error);
      message.error(
        "Failed to fetch users: " + (error.message || "Unknown error")
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users khi tab thay đổi
  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'dashboard') {
        fetchUsers();
    }
  }, [activeTab]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handle create account success
  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    if (activeTab === 'users') { 
        fetchUsers();
    }
    message.success("Account created successfully!");
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    Modal.confirm({
      title: "Delete User",
      content: "Are you sure you want to delete this user?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await adminService.deleteUser(userId);
          message.success("User deleted successfully");
          fetchUsers();
        } catch (error) {
          message.error(
            "Failed to delete user: " + (error.message || "Unknown error")
          );
        }
      },
    });
  };

  // Hàm mở/đóng modal view detail
  const handleViewDetails = (user) => {
    setViewUser(user);
    setIsViewModalVisible(true);
  };

  const handleViewModalCancel = () => {
    setIsViewModalVisible(false);
    setViewUser(null);
  };

  // Hàm mở/đóng modal lịch sử
  const handleViewHistory = async (patient) => {
      if (patient.role !== 'patient') {
          message.info("Chỉ có thể xem lịch sử của bệnh nhân.");
          return;
      }
      setSelectedPatient(patient);
      setHistoryLoading(true);
      setHistoryModalVisible(true);
      try {
          const res = await adminService.getPatientHistory(patient._id); 
          if (res.success) {
              setHistoryData(res.data || []);
          } else {
              message.error(res.message || "Failed to load history.");
              setHistoryData([]); 
          }
      } catch (error) {
          message.error(error.message || "Error fetching history.");
          setHistoryData([]); 
      } finally {
          setHistoryLoading(false);
      }
  };

  const handleHistoryModalCancel = () => {
      setHistoryModalVisible(false);
      setHistoryData([]);
      setSelectedPatient(null);
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // SỬA LẠI USER MENU CHO ANTD V5
  const handleMenuClick = (e) => {
      if (e.key === 'logout') {
        handleLogout();
      }
  };
  const menuItems = [
      { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
      { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
  ];

  const columns = [
    {
      title: "User",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: "#1890ff" }} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 500 }}>{text || "N/A"}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const color = { admin: "red", doctor: "blue", staff: "green", patient: "orange", management: "purple" };
        const roleName = role || "unknown";
        return <Tag color={color[roleName] || 'default'}>{roleName.toUpperCase()}</Tag>;
      },
    },
    { title: "Phone", dataIndex: "phone", key: "phone", render: (phone) => phone || "N/A" },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)}>
            View
          </Button>

          {/* nut ban/unban */}
          <Popconfirm
            title={`Are you sure you want to ${record.isActive ? 'ban' : 'unban'} this user?`}
            onConfirm={async () => { // Logic onClick được chuyển vào đây
              try {
                await adminService.toggleUserStatus(record._id || record.id);
                message.success(record.isActive ? "User banned" : "User unbanned");
                fetchUsers();
              } catch (error) {
                message.error(error.message || "Failed to toggle status");
              }
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type={record.isActive ? "default" : "primary"}
              danger={record.isActive}
              disabled={record._id === user._id} // Vẫn giữ logic tự ban
            >
              {record.isActive ? "Ban" : "Unban"}
            </Button>
          </Popconfirm>
          
          {/* Nút History */}
          {record.role === 'patient' && (
            <Button
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            >
              History
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Dashboard statistics
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.isActive).length,
    doctors: users.filter((u) => u.role === "doctor").length,
    patients: users.filter((u) => u.role === "patient").length,
    staff: users.filter((u) => u.role === "staff").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
         <Col xs={24} sm={12} lg={6}><Card className="stat-card"><Statistic title="Total Users" value={stats.totalUsers} prefix={<UserOutlined style={{ color: "#1890ff" }} />} valueStyle={{ color: "#1890ff" }} /></Card></Col>
         <Col xs={24} sm={12} lg={6}><Card className="stat-card"><Statistic title="Active Users" value={stats.activeUsers} prefix={<TeamOutlined style={{ color: "#52c41a" }} />} valueStyle={{ color: "#52c41a" }} /></Card></Col>
         <Col xs={24} sm={12} lg={6}><Card className="stat-card"><Statistic title="Doctors" value={stats.doctors} prefix={<UserOutlined style={{ color: "#722ed1" }} />} valueStyle={{ color: "#722ed1" }} /></Card></Col>
         <Col xs={24} sm={12} lg={6}><Card className="stat-card"><Statistic title="Patients" value={stats.patients} prefix={<UserOutlined style={{ color: "#fa8c16" }} />} valueStyle={{ color: "#fa8c16" }} /></Card></Col>
      </Row>
      {/* Recent Users */}
      <Card title="Recent Users" className="recent-users-card">
        <Table
          columns={columns.slice(0, 4)} 
          dataSource={users.slice(0, 5)} 
          rowKey={(record) => record._id || record.id || record.email}
          pagination={false}
          size="small"
        />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button type="link" onClick={() => setActiveTab("users")}>
            View All Users →
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderUserManagement = () => (
    <div className="user-management">
      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}><Search placeholder="Search users..." allowClear value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "100%" }}/></Col>
        <Col xs={24} sm={12} md={6}><Select placeholder="Filter by role" value={roleFilter} onChange={setRoleFilter} style={{ width: "100%" }}><Option value="all">All Roles</Option><Option value="admin">Admin</Option><Option value="doctor">Doctor</Option><Option value="staff">Staff</Option><Option value="patient">Patient</Option></Select></Col>
        <Col xs={24} sm={24} md={10}><Space><Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>Create Account</Button><Button icon={<ReloadOutlined />} onClick={fetchUsers}>Refresh</Button></Space></Col>
      </Row>
      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey={(record) => record._id || record.id || record.email}
          pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true, showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users` }}
        />
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <Card>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <BarChartOutlined style={{ fontSize: "64px", color: "#1890ff", marginBottom: "16px" }}/>
        <h3>Analytics Dashboard</h3>
        <p>Detailed analytics and reporting features will be available here.</p>
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <SettingOutlined style={{ fontSize: "64px", color: "#1890ff", marginBottom: "16px" }}/>
        <h3>System Settings</h3>
        <p>System configuration and settings will be available here.</p>
      </div>
    </Card>
  );

  // === HÀM RENDER CONTENT ĐÃ THÊM LẠI CASE SCHEDULES ===
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return renderDashboard();
      case "users": return renderUserManagement();
      case "services": return <ServicesManager />;
      case "doctor-services": return <ServiceDoctorManager />;
      case "discounts": return <DiscountsManager />;
      case "schedules": return <ScheduleManagement />; 
      case "analytics": return renderAnalytics();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };
  // ===========================================

  return (
    <Layout className="admin-layout">
      <Header className="admin-header">
        <div className="header-content">
          <div className="header-left">
            <div className="admin-logo"><span>M</span></div>
            <h1 className="admin-brand">Medilab</h1>
          </div>
          <div className="header-nav">
             <Button type={activeTab === 'dashboard' ? 'primary' : 'default'} icon={<DashboardOutlined />} onClick={() => setActiveTab('dashboard')} className="nav-btn">Dashboard</Button>
             <Button type={activeTab === 'users' ? 'primary' : 'default'} icon={<TeamOutlined />} onClick={() => setActiveTab('users')} className="nav-btn">Users</Button>
             <Button type={activeTab === 'services' ? 'primary' : 'default'} icon={<SettingOutlined />} onClick={() => setActiveTab('services')} className="nav-btn">Services</Button>
             <Button type={activeTab === 'discounts' ? 'primary' : 'default'} icon={<SettingOutlined />} onClick={() => setActiveTab('discounts')} className="nav-btn">Discount</Button>
             <Button
               type={activeTab === 'schedules' ? 'primary' : 'default'}
               icon={<CalendarOutlined />}
               onClick={() => setActiveTab('schedules')}
               className="nav-btn"
             >
               Schedules
             </Button>
             <Button
      type={activeTab === 'doctor-services' ? 'primary' : 'default'}
      icon={<UserOutlined />} 
      onClick={() => setActiveTab('doctor-services')}
      className="nav-btn"
    >
      Doctor Services
    </Button>
             <Button type={activeTab === 'analytics' ? 'primary' : 'default'} icon={<BarChartOutlined />} onClick={() => setActiveTab('analytics')} className="nav-btn">Analytics</Button>
             <Button type={activeTab === 'settings' ? 'primary' : 'default'} icon={<SettingOutlined />} onClick={() => setActiveTab('settings')} className="nav-btn">Settings</Button>
          </div>
          {/* ======================================= */}
          <div className="header-right">
            {/* === DROPDOWN ĐÃ SỬA === */}
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} placement="bottomRight">
            {/* ======================= */}
              <div className="user-profile">
                <Avatar style={{ backgroundColor: '#1890ff', marginRight: 8 }} icon={<UserOutlined />} />
                <div className="user-info">
                  <div className="user-name">{user?.fullName || 'Admin'}</div>
                  <div className="user-role">Administrator</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>

      <Content className="admin-content">{renderContent()}</Content>

      {/* Create Account Modal */}
      <CreateAccountModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* View Detail Modal */}
      <Modal
        title="User Account Details"
        open={isViewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[<Button key="close" onClick={handleViewModalCancel}>Close</Button>]}
        width={600}
        destroyOnClose
      >
        {viewUser && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Full Name">{viewUser.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{viewUser.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{viewUser.phone || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Role"><Tag color="blue">{viewUser.role?.toUpperCase()}</Tag></Descriptions.Item>
            <Descriptions.Item label="Status"><Tag color={viewUser.isActive ? "green" : "red"}>{viewUser.isActive ? "Active" : "Inactive (Banned)"}</Tag></Descriptions.Item>
            <Descriptions.Item label="Joined Date">{moment(viewUser.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
            {viewUser.role === 'doctor' && viewUser.doctorProfile && (<><Descriptions.Item label="Doctor ID">{viewUser.doctorProfile.doctorId}</Descriptions.Item><Descriptions.Item label="Specializations">{viewUser.doctorProfile.specializations?.join(', ')}</Descriptions.Item></>)}
            {viewUser.role === 'staff' && viewUser.staffProfile && (<Descriptions.Item label="Staff Type">{viewUser.staffProfile.staffType}</Descriptions.Item>)}
          </Descriptions>
        )}
      </Modal>

      <Modal
        title={`Medical History: ${selectedPatient?.fullName || ''}`}
        open={historyModalVisible}
        onCancel={handleHistoryModalCancel}
        footer={[ <Button key="close" onClick={handleHistoryModalCancel}>Close</Button> ]}
        width={800} // Cho modal rộng
        destroyOnClose
      >
        <Spin spinning={historyLoading}>
          <List
            itemLayout="vertical"
            dataSource={historyData}
            locale={{ emptyText: 'No completed appointments found.' }}
            renderItem={item => (
              <List.Item
                key={item._id}
                style={{ background: '#f9f9f9', marginBottom: 16, padding: 16, borderRadius: 8 }}
              >
                {/* Dùng Descriptions để hiển thị thông tin chi tiết từ model Appointment */}
                <Descriptions title={`Appointment: ${moment(item.appointmentDate).format('DD/MM/YYYY HH:mm')}`} column={2}>
                  <Descriptions.Item label="Doctor">{item.doctor?.user?.fullName || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Service(s)">{item.selectedServices?.map(s => s.name).join(', ') || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Reason for Visit" span={2}>{item.reasonForVisit || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Final Diagnosis" span={2}>{item.finalDiagnosis || 'No diagnosis provided.'}</Descriptions.Item>
                  <Descriptions.Item label="Treatment" span={2}>{item.treatmentNotes || item.treatment || 'No treatment notes.'}</Descriptions.Item>
                </Descriptions>
              </List.Item>
            )}
          />
        </Spin>
      </Modal>

    </Layout>
  );
};

export default AdminDashboard;