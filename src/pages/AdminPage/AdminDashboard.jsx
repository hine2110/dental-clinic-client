import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CreateAccount from "./CreateAccount";
import { adminService } from "../../services/adminService";

const { Header, Content } = Layout;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users data
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      message.error(
        "Failed to fetch users: " + (error.message || "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle create account success
  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    fetchUsers(); // Refresh users list
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

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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
        return <Tag color={color[role]}>{role.toUpperCase()}</Tag>;
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
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => setSelectedUser(record)}
          >
            Edit
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteUser(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "#fff",
          padding: "0 24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0, color: "#1977cc" }}>Admin Dashboard</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Create Account
          </Button>
        </div>
      </Header>

      <Content style={{ padding: "24px" }}>
        <Card>
          <Tabs defaultActiveKey="users">
            <TabPane tab="Users Management" key="users">
              <Table
                columns={columns}
                dataSource={users}
                loading={loading}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} of ${total} users`,
                }}
              />
            </TabPane>
            <TabPane tab="Statistics" key="stats">
              <div style={{ textAlign: "center", padding: "50px" }}>
                <h3>Statistics Coming Soon...</h3>
                <p>This section will show system statistics and analytics.</p>
              </div>
            </TabPane>
          </Tabs>
        </Card>

        {/* Create Account Modal */}
        <Modal
          title="Create New Account"
          open={createModalVisible}
          onCancel={() => setCreateModalVisible(false)}
          footer={null}
          width={600}
        >
          <CreateAccount onSuccess={handleCreateSuccess} />
        </Modal>
      </Content>
    </Layout>
  );
};

export default AdminDashboard;
