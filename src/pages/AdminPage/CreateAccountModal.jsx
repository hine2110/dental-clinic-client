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
  Upload, // <-- ĐÃ THÊM
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  UploadOutlined, // <-- ĐÃ THÊM
} from "@ant-design/icons";
import { adminService } from "../../services/adminService";

const { Option } = Select;

const CreateAccountModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [step, setStep] = useState(1); // 1: form, 2: success
  const selectedRole = Form.useWatch("role", form);

  // === THÊM STATE CHO AVATAR ===
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  // =============================

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

  // === ĐÃ SỬA: Handle form submission ĐỂ GỬI FORMDATA ===
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("ЁЯФД Submitting form with values:", values);

      // 1. TẠO FORMDATA
      const formData = new FormData();

      // 2. Thêm các giá trị text (và mảng) vào formData
      for (const key in values) {
        if (key === 'specializations' && values.role === 'doctor' && typeof values[key] === 'string') {
          // Xử lý mảng specializations
          const specializationsArray = values[key].split(',').map(s => s.trim()).filter(Boolean);
          // Gửi mảng bằng cách append từng giá trị
          specializationsArray.forEach(spec => formData.append('specializations', spec));
        } else if (values[key] !== undefined && key !== 'avatar') {
          // Thêm các trường khác (bỏ qua 'avatar' ảo từ Form)
          formData.append(key, values[key]);
        }
      }

      // 3. THÊM AVATAR VÀO FORMDATA (nếu là Doctor và có file)
      if (avatarFile && values.role === 'doctor') {
        formData.append('avatar', avatarFile); // Key phải khớp với 'uploadProfile.single("avatar")'
      }

      // 4. Gọi service với formData
      const response = await adminService.createStaffAccount(formData);
      console.log("ЁЯУд Server response:", response);

      if (response.success) {
        setSuccessData({
          fullName: response.data.user.fullName,
          email: response.data.user.email,
          role: response.data.user.role,
          temporaryPassword: response.data.temporaryPassword,
        });
        setStep(2);
        form.resetFields();
        setAvatarFile(null); // <-- Dọn dẹp state
        setAvatarPreview(null); // <-- Dọn dẹp state
      } else {
        throw new Error(response.message || "Create account failed");
      }
    } catch (error) {
      console.error("тЭМ Create account error:", error);
      console.error("ЁЯУЛ Full error object:", JSON.stringify(error, null, 2));

      // Handle different types of errors
      let errorMessage = "Failed to create account. Please try again.";

      // Check if it's an API response error
      if (error.response) {
        console.error("ЁЯУб API Error Response:", error.response);
        const apiError = error.response.data;

        if (apiError.errors && Array.isArray(apiError.errors)) {
          errorMessage = "Validation failed: " + apiError.errors.join(", ");
        } else if (apiError.message) {
          errorMessage = apiError.message;
        }

        console.error("ЁЯФН API Error Details:", {
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
  // ========================================================

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
    setAvatarFile(null); // <-- Dọn dẹp state
    setAvatarPreview(null); // <-- Dọn dẹp state
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

      {/* Doctor-only fields (ĐÃ CẬP NHẬT) */}
      {form.getFieldValue("role") === "doctor" && (
        <>
          {/* === BỔ SUNG KHỐI UPLOAD AVATAR === */}
          <Form.Item
            name="avatar"
            label="Profile Avatar (Optional)"
            help="Image must be JPG/PNG and smaller than 2MB."
          >
            <Upload
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              // Ngăn chặn việc tự động upload
              beforeUpload={(file) => {
                // Kiểm tra file
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                if (!isJpgOrPng) {
                  message.error('You can only upload JPG/PNG file!');
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Image must be smaller than 2MB!');
                  return Upload.LIST_IGNORE;
                }
                
                // Lưu file vào state
                setAvatarFile(file);
                
                // Tạo preview
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => setAvatarPreview(reader.result);

                return false; // Trả về false để ngăn upload tự động
              }}
              onRemove={() => { // Hỗ trợ xóa nếu cần
                 setAvatarFile(null);
                 setAvatarPreview(null);
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" style={{ width: '100%', objectFit: 'cover' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
          {/* ================================== */}

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

          {/* === TRƯỜNG KINH NGHIỆM CHO DOCTOR === */}
          <Form.Item
            name="yearsOfPractice"
            label="Years of Practice"
            initialValue={0}
            rules={[
              {
                required: true,
                message: "Please enter years of practice (enter 0 if new)",
              },
            ]}
          >
            <Input
              type="number"
              min={0}
              placeholder="e.g. 5"
              style={{ width: "100%" }}
            />
          </Form.Item>
          {/* ============================================== */}
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