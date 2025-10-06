import React, { useState, useEffect } from "react";
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
} from "@ant-design/icons";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import CreateAccountModal from "./CreateAccountModal";
import { adminService } from "../../services/adminService";
import ServicesManager from "./ServicesManager";
import "./AdminDashboard.css";

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

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching users...");
      const response = await adminService.getAllUsers({ limit: "all" });
      console.log("✅ Users response:", response);

      if (response.success) {
        setUsers(response.data || []);
        message.success(`Loaded ${response.data?.length || 0} users`);
      } else {
        throw new Error(response.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("❌ Fetch users error:", error);
      message.error(
        "Failed to fetch users: " + (error.message || "Unknown error")
      );
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Handle create account success
  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchUsers();
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

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // User menu
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        style={{ color: "#ff4d4f" }}
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  // Table columns
  const columns = [
    {
      title: "User",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Space>
          <Avatar
            size="small"
            style={{ backgroundColor: "#1890ff" }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        const color = {
          admin: "red",
          doctor: "blue",
          staff: "green",
          patient: "orange",
        };
        return <Tag color={color[role]}>{role?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
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
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<TeamOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Doctors"
              value={stats.doctors}
              prefix={<UserOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="Patients"
              value={stats.patients}
              prefix={<UserOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Quick Actions" className="actions-card">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <Button
                  block
                  icon={<TeamOutlined />}
                  size="large"
                  onClick={() => setActiveTab("users")}
                >
                  Manage Users
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}>
                <Button
                  block
                  icon={<BarChartOutlined />}
                  size="large"
                  onClick={() => setActiveTab("analytics")}
                >
                  View Analytics
                </Button>
              </Col>
              <Col xs={12} sm={8} md={6}></Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Users */}
      <Card title="Recent Users" className="recent-users-card">
        <Table
          columns={columns.slice(0, 4)}
          dataSource={users.slice(0, 5)}
          rowKey={(record) => record.id || record._id || record.email}
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
        <Col xs={24} sm={12} md={8}>
          <Search
            placeholder="Search users..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%" }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filter by role"
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: "100%" }}
          >
            <Option value="all">All Roles</Option>
            <Option value="admin">Admin</Option>
            <Option value="doctor">Doctor</Option>
            <Option value="staff">Staff</Option>
            <Option value="patient">Patient</Option>
          </Select>
        </Col>
        <Col xs={24} sm={24} md={10}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Create Account
            </Button>
            <Button icon={<ExportOutlined />}>Export</Button>
            <Button icon={<ReloadOutlined />} onClick={fetchUsers}>
              Refresh
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowKey={(record) => record.id || record._id || record.email}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <Card>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <BarChartOutlined
          style={{ fontSize: "64px", color: "#1890ff", marginBottom: "16px" }}
        />
        <h3>Analytics Dashboard</h3>
        <p>Detailed analytics and reporting features will be available here.</p>
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <SettingOutlined
          style={{ fontSize: "64px", color: "#1890ff", marginBottom: "16px" }}
        />
        <h3>System Settings</h3>
        <p>System configuration and settings will be available here.</p>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return renderUserManagement();
      case "services":
        return <ServicesManager />;
      case "analytics":
        return renderAnalytics();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <Layout className="admin-layout">
      <Header className="admin-header">
        <div className="header-content">
          {/* Logo and Brand */}
          <div className="header-left">
            <div className="admin-logo">
              <span>M</span>
            </div>
            <h1 className="admin-brand">Medilab</h1>
          </div>

          {/* Navigation Tabs */}
          <div className="header-nav">
            <Button
              type={activeTab === "dashboard" ? "primary" : "default"}
              icon={<DashboardOutlined />}
              onClick={() => setActiveTab("dashboard")}
              className="nav-btn"
            >
              Dashboard
            </Button>
            <Button
              type={activeTab === "users" ? "primary" : "default"}
              icon={<TeamOutlined />}
              onClick={() => setActiveTab("users")}
              className="nav-btn"
            >
              Users
            </Button>
            <Button
              type={activeTab === "services" ? "primary" : "default"}
              icon={<SettingOutlined />}
              onClick={() => setActiveTab("services")}
              className="nav-btn"
            >
              Services
            </Button>
            <Button
              type={activeTab === "analytics" ? "primary" : "default"}
              icon={<BarChartOutlined />}
              onClick={() => setActiveTab("analytics")}
              className="nav-btn"
            >
              Analytics
            </Button>
            <Button
              type={activeTab === "settings" ? "primary" : "default"}
              icon={<SettingOutlined />}
              onClick={() => setActiveTab("settings")}
              className="nav-btn"
            >
              Settings
            </Button>
          </div>

          {/* User Info */}
          <div className="header-right">
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div className="user-profile">
                <Avatar
                  style={{ backgroundColor: "#1890ff", marginRight: 8 }}
                  icon={<UserOutlined />}
                />
                <div className="user-info">
                  <div className="user-name">{user?.fullName || "Admin"}</div>
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
    </Layout>
  );
};

export default AdminDashboard;
