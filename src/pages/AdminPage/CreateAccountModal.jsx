import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  message,
  Space,
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

const CreateAccountModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [step, setStep] = useState(1); // 1: form, 2: success
  const selectedRole = Form.useWatch("role", form);

  // When switching to Staff, set default staffType if not selected yet
  useEffect(() => {
    if (selectedRole === "staff") {
      const current = form.getFieldValue("staffType");
      if (!current) {
        form.setFieldsValue({ staffType: "receptionist" });
      }
    } else if (selectedRole !== "staff") {
      // Clear staffType when not staff
      form.setFieldsValue({ staffType: undefined });
    }
  }, [selectedRole, form]);

  // Role options - Admin can create doctor, staff, management
  const roleOptions = [
    { value: "doctor", label: "Doctor", color: "#1890ff" },
    { value: "staff", label: "Staff", color: "#52c41a" },
    { value: "management", label: "Management", color: "#722ed1" },
  ];

  // Handle form submission
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("🔄 Submitting form with values:", values);
      const payload = { ...values };
      // Normalize doctor specializations string -> array
      if (
        payload.role === "doctor" &&
        typeof payload.specializations === "string"
      ) {
        payload.specializations = payload.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      const response = await adminService.createStaffAccount(payload);
      console.log("📤 Server response:", response);

      if (response.success) {
        setSuccessData({
          fullName: response.data.user.fullName,
          email: response.data.user.email,
          role: response.data.user.role,
          temporaryPassword: response.data.temporaryPassword,
        });
        setStep(2);
        form.resetFields();
      } else {
        throw new Error(response.message || "Create account failed");
      }
    } catch (error) {
      console.error("❌ Create account error:", error);
      console.error("📋 Full error object:", JSON.stringify(error, null, 2));

      // Handle different types of errors
      let errorMessage = "Failed to create account. Please try again.";

      // Check if it's an API response error
      if (error.response) {
        console.error("📡 API Error Response:", error.response);
        const apiError = error.response.data;

        if (apiError.errors && Array.isArray(apiError.errors)) {
          errorMessage = "Validation failed: " + apiError.errors.join(", ");
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        console.error("🔍 API Error Details:", {
          status: error.response.status,
          message: apiError.message,
          errors: apiError.errors,
          details: apiError.details,
        });
      } else if (error.errors && Array.isArray(error.errors)) {
        errorMessage = "Validation failed: " + error.errors.join(", ");
      } else if (error.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
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

  // Handle modal close
  const handleCancel = () => {
    if (step === 2) {
      onSuccess();
    } else {
      onCancel();
    }
    setStep(1);
    setSuccessData(null);
    form.resetFields();
  };

  const renderForm = () => (
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
            <Input prefix={<UserOutlined />} placeholder="Enter first name" />
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
            <Input prefix={<UserOutlined />} placeholder="Enter last name" />
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
        <Input prefix={<MailOutlined />} placeholder="Enter email address" />
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

      {/* Staff-only fields */}
      {form.getFieldValue("role") === "staff" && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="staffType"
              label="Staff Type"
              rules={[{ required: true, message: "Please select staff type" }]}
            >
              <Select placeholder="Select staff type">
                <Option value="receptionist">Receptionist</Option>
                <Option value="storeKepper">Store Keeper</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )}

      {/* Doctor-only fields (NOW REQUIRED) */}
      {form.getFieldValue("role") === "doctor" && (
        <>
          <Form.Item
            name="specializations"
            label="Specializations (comma-separated)"
            rules={[
              {
                required: true,
                message: "Please enter doctor's specializations",
              },
            ]}
          >
            <Input placeholder="e.g. Orthodontics, Endodontics" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="medicalLicense"
                label="Medical License"
                rules={[
                  {
                    required: true,
                    message: "Please enter medical license",
                  },
                ]}
              >
                <Input placeholder="Enter medical license" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dentalLicense"
                label="Dental License"
                rules={[
                  { required: true, message: "Please enter dental license" },
                ]}
              >
                <Input placeholder="Enter dental license" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

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
        <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
      </Form.Item>

      <Form.Item
        name="temporaryPassword"
        label="Temporary Password"
        rules={[
          { required: false },
          { min: 6, message: "Password must be at least 6 characters" },
        ]}
        extra="If left blank, the system will generate a temporary password."
      >
        <Input
          prefix={<LockOutlined />}
          placeholder="Enter temporary password (optional)"
          addonAfter={
            <Button type="link" onClick={generatePassword}>
              Generate
            </Button>
          }
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
        <Space>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Account
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );

  const renderSuccess = () => (
    <Result
      status="success"
      title="Account Created Successfully!"
      subTitle={
        <div style={{ textAlign: "left", marginTop: "20px" }}>
          <p>
            <strong>Name:</strong> {successData?.fullName}
          </p>
          <p>
            <strong>Email:</strong> {successData?.email}
          </p>
          <p>
            <strong>Role:</strong> {successData?.role}
          </p>
          <p>
            <strong>Temporary Password:</strong>
            <span
              style={{
                background: "#f0f0f0",
                padding: "4px 8px",
                borderRadius: "4px",
                fontFamily: "monospace",
                marginLeft: "8px",
              }}
            >
              {successData?.temporaryPassword}
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
              <strong>Note:</strong> Please save this temporary password. The
              user should change it after their first login.
            </p>
          </div>
        </div>
      }
      extra={[
        <Button key="create-another" onClick={() => setStep(1)}>
          Create Another Account
        </Button>,
        <Button key="done" type="primary" onClick={handleCancel}>
          Done
        </Button>,
      ]}
    />
  );

  return (
    <Modal
      title={step === 1 ? "Create New Account" : "Account Created"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      {step === 1 ? renderForm() : renderSuccess()}
    </Modal>
  );
};

export default CreateAccountModal;