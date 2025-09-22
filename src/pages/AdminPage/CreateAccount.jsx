import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
  Modal,
  Result,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { adminService } from "../../services/adminService";

const { Option } = Select;

const CreateAccount = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(null);

  // Role options
  const roleOptions = [
    { value: "doctor", label: "Doctor", color: "blue" },
    { value: "staff", label: "Staff", color: "green" },
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await adminService.createStaffAccount(values);

      if (response.success) {
        setCreatedAccount({
          fullName: response.data.user.fullName,
          email: response.data.user.email,
          role: response.data.user.role,
          temporaryPassword: response.data.temporaryPassword,
        });
        setSuccessModalVisible(true);
        form.resetFields();
      }
    } catch (error) {
      console.error("Create account error:", error);
      message.error(
        error.message ||
          error.errors?.join(", ") ||
          "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setFieldsValue({ temporaryPassword: password });
  };

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <Card title="Create New Account" style={{ marginBottom: "24px" }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            role: "doctor",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please enter first name" },
                  {
                    min: 2,
                    message: "First name must be at least 2 characters",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter first name"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[
                  { required: true, message: "Please enter last name" },
                  {
                    min: 2,
                    message: "Last name must be at least 2 characters",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter last name"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: "Please enter email address" },
              { type: "email", message: "Please enter a valid email address" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter email address"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select role">
              {roleOptions.map((role) => (
                <Option key={role.value} value={role.value}>
                  <Space>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: role.color,
                        display: "inline-block",
                        marginRight: 8,
                      }}
                    />
                    {role.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^[0-9+\-\s()]+$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Enter phone number"
            />
          </Form.Item>

          <Form.Item
            name="temporaryPassword"
            label="Temporary Password"
            rules={[
              { required: true, message: "Please enter temporary password" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
            extra="This password will be used for first login. User should change it after login."
          >
            <Input
              prefix={<LockOutlined />}
              placeholder="Enter temporary password"
              addonAfter={
                <Button type="link" onClick={generatePassword}>
                  Generate
                </Button>
              }
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={() => form.resetFields()}>Reset</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Account
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Success Modal */}
      <Modal
        title="Tạo tài khoản thành công!"
        open={successModalVisible}
        onCancel={() => setSuccessModalVisible(false)}
        footer={null}
        width={600}
        centered
      >
        <Result
          status="success"
          title="Tài khoản đã được tạo thành công!"
          subTitle={
            <div style={{ textAlign: "left", marginTop: "20px" }}>
              <p>
                <strong>Tên:</strong> {createdAccount?.fullName}
              </p>
              <p>
                <strong>Email:</strong> {createdAccount?.email}
              </p>
              <p>
                <strong>Vai trò:</strong> {createdAccount?.role}
              </p>
              <p>
                <strong>Mật khẩu tạm thời:</strong>
                <span
                  style={{
                    background: "#f0f0f0",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                    marginLeft: "8px",
                  }}
                >
                  {createdAccount?.temporaryPassword}
                </span>
              </p>
              <div
                style={{
                  background: "#fff7e6",
                  border: "1px solid #ffd591",
                  borderRadius: "6px",
                  padding: "12px",
                  marginTop: "16px",
                }}
              >
                <p style={{ margin: 0, color: "#d46b08" }}>
                  <strong>Lưu ý:</strong> Hãy ghi lại mật khẩu tạm thời này.
                  Người dùng cần đổi mật khẩu sau lần đăng nhập đầu tiên.
                </p>
              </div>
            </div>
          }
          extra={[
            <Button
              key="back"
              onClick={() => setSuccessModalVisible(false)}
              style={{ marginRight: "8px" }}
            >
              Tạo tài khoản khác
            </Button>,
            <Button
              key="home"
              type="primary"
              onClick={() => {
                setSuccessModalVisible(false);
                window.location.href = "/admin";
              }}
            >
              Quay lại Admin Dashboard
            </Button>,
          ]}
        />
      </Modal>
    </div>
  );
};

export default CreateAccount;
