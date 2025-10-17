import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  Modal,
  Form,
  InputNumber,
  message,
  Popconfirm,
  Upload,
  Image,
  AutoComplete,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleTwoTone,
  StopTwoTone,
  UploadOutlined,
  DeleteOutlined as DeleteIcon,
  EyeOutlined,
} from "@ant-design/icons";
import { adminService } from "../../services/adminService";

const { Search } = Input;
const { Option } = Select;

// Component chứa toàn bộ CSS, đặt ngay trong file JSX
const Styles = () => (
  <style>{`
    /* === MAIN PAGE & HEADER === */
    .user-manager {
      padding: 24px;
      background-color: #f5f7fa;
      min-height: 100vh;
    }
    .user-header {
      background-color: #ffffff;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }
    .services-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 600;
      margin: 0;
      color: #1a273a;
    }
    .services-icon {
      font-size: 24px;
      color: #1890ff;
    }
    .services-subtitle {
      font-size: 14px;
      color: #595959;
      margin-top: 4px;
    }

    /* === FILTERS & ACTIONS BAR === */
    .filters-and-actions {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 16px;
      align-items: center;
      margin-top: 20px;
    }
    .action-buttons-group {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    }
    @media (max-width: 992px) {
      .filters-and-actions {
        grid-template-columns: 1fr 1fr;
      }
      .action-buttons-group {
        grid-column: 1 / -1;
        justify-content: flex-start;
        margin-top: 16px;
      }
    }
    @media (max-width: 576px) {
      .filters-and-actions {
        grid-template-columns: 1fr;
      }
      .action-buttons-group {
        margin-top: 0;
      }
    }

    /* === TABLE & TAGS === */
    .user-table-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    }
    .user-table-card .ant-card-body {
      padding: 0;
    }
    .table-cell-image .image-preview {
      object-fit: cover;
      border-radius: 4px;
    }
    .role-tag, .status-tag {
      border-radius: 12px;
      font-weight: 500;
      padding: 2px 10px;
      border-width: 1px;
      border-style: solid;
    }
    .role-tag.doctor { /* Blue for categories */
      background-color: #e6f7ff;
      border-color: #91d5ff;
      color: #096dd9;
    }
    .status-tag.active { /* Green for active */
        background-color: #f6ffed;
        border-color: #b7eb8f;
        color: #389e0d;
    }
    .status-tag.inactive { /* Red for inactive */
        background-color: #fff1f0;
        border-color: #ffa39e;
        color: #cf1322;
    }

    /* === MODAL STYLING === */
    .form-section {
      padding: 20px;
      margin-bottom: 24px;
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      background-color: #fafafa;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
    }
    .section-title i {
      color: #1890ff;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
    
.treatment-step {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  background: #ffffff;
}

.step-inputs {
  display: grid;
  grid-template-columns: 80px 1fr; /* Cột cho số thứ tự và tiêu đề */
  gap: 8px;
}
  .step-inputs {
      display: grid;
      grid-template-columns: 80px 1fr; /* Cột cho số thứ tự và tiêu đề */
      gap: 8px;
    }

   .status-checkbox {
  appearance: none;
  position: relative;
  width: 30px; /* 50px * 0.6 */
  height: 17px; /* 28px * 0.6 */
  background-color: #bfbfbf;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  vertical-align: middle;
}

/* Đây là phần núm tròn của công tắc */
.status-checkbox::after {
  content: '';
  position: absolute;
  top: 1.5px; /* 2px * 0.6, làm tròn */
  left: 1.5px; /* 2px * 0.6, làm tròn */
  width: 14px; /* 24px * 0.6 */
  height: 14px; /* 24px * 0.6 */
  background-color: white;
  border-radius: 50%;
  transition: left 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* Khi được bật (checked) */
.status-checkbox:checked {
  background-color: #1890ff; 
}

/* Di chuyển núm tròn sang phải khi được bật */
.status-checkbox:checked::after {
  left: 14.5px; /* (30px - 14px - 1.5px) */
}
`}</style>
);

const emptyService = {
  name: "",
  description: "",
  category: "",
  price: 0,
  duration: undefined,
  thumbnail: "",
  isActive: true,
  image: null,
};

const ServicesManager = () => {
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [processSteps, setProcessSteps] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await adminService.getServiceCategories();
      if (res.success) setCategories(res.data || []);
    } catch (e) {
      // silent
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = {
        limit: "all", 
        category: categoryFilter === "all" ? undefined : categoryFilter,
        isActive: statusFilter === "all" ? undefined : statusFilter, 
        search: searchTerm,
      };
      const res = await adminService.getServices(params);
      if (res.success) setServices(res.data || []);
      else throw new Error(res.message || "Failed");
    } catch (e) {
      message.error(e.message || "Failed to load services");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter]);

  const filtered = useMemo(() => {
    if (!searchTerm) return services;
    const lower = searchTerm.toLowerCase();
    return services.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(lower) ||
        (s.description || "").toLowerCase().includes(lower)
    );
  }, [services, searchTerm]);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(emptyService);
    setImageFile(null);
    setImagePreview(null);
    setProcessSteps([]);
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      category: record.category,
      price: record.price,
      duration: record.duration,
      isActive: record.isActive,
    });
    setImageFile(null);
    setImagePreview(
      record.image
        ? record.image.url ||
            `http://localhost:5000/uploads/${record.image.filename}`
        : null
    );
    setProcessSteps(
      Array.isArray(record.process)
        ? record.process
            .slice()
            .sort((a, b) => (a.step || 0) - (b.step || 0))
            .map((s, idx) => ({
              step: s.step || idx + 1,
              title: s.title || "",
              description: s.description || "",
            }))
        : []
    );
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("category", values.category);
      formData.append("price", values.price);
      formData.append("duration", values.duration || "");
      formData.append("isActive", String(values.isActive));

      if (imageFile) {
        formData.append("image", imageFile, imageFile.name || "upload.png");
      }

      if (Array.isArray(processSteps) && processSteps.length > 0) {
        const cleaned = processSteps
          .map((s, idx) => ({
            step: Number(s.step) || idx + 1,
            title: (s.title || "").trim(),
            description: (s.description || "").trim(),
          }))
          .filter((s) => s.title || s.description);
        if (cleaned.length > 0) {
          formData.append("process", JSON.stringify(cleaned));
        }
      }

      if (editing) {
        await adminService.updateService(editing._id || editing.id, formData);
        message.success("Service updated");
      } else {
        await adminService.createService(formData);
        message.success("Service created");
      }
      setModalOpen(false);
      fetchServices();
    } catch (e) {
      if (e?.errorFields) return;
      message.error(e.message || "Failed to save service");
    }
  };

  const handleToggle = async (record) => {
    try {
      await adminService.toggleServiceStatus(record._id || record.id);
      message.success(record.isActive ? "Deactivated" : "Activated");
      fetchServices();
    } catch (e) {
      message.error(e.message || "Failed to toggle");
    }
  };

  const handleDelete = async (record) => {
    try {
      await adminService.deleteService(record._id || record.id);
      message.success("Service deleted");
      fetchServices();
    } catch (e) {
      message.error(e.message || "Failed to delete");
    }
  };

  const openView = (record) => {
    setViewing(record);
    setViewOpen(true);
  };

  const handleImageChange = (info) => {
    if (info.file) {
      const fileObj = info.file.originFileObj || info.file;
      setImageFile(fileObj);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      if (fileObj instanceof Blob) {
        reader.readAsDataURL(fileObj);
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const uploadProps = {
    name: "image",
    listType: "picture-card",
    showUploadList: false,
    beforeUpload: (file) => false, // Prevent auto upload
    onChange: handleImageChange,
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 80,
      align: "center",
      render: (image) => (
        <div className="table-cell-image">
          {image && (image.url || image.filename) ? (
            <Image
              width={40}
              height={40}
              src={image.url || `http://localhost:5000/uploads/${image.filename}`}
              className="image-preview"
            />
          ) : (
            <div className="image-placeholder">
              <i className="fas fa-image" style={{ fontSize: "16px" }}></i>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Service Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag className="role-tag doctor">{category}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) =>
        `₫${(typeof price === "number" ? price : 0).toLocaleString("vi-VN")}`,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive) => (
        <Tag className={isActive ? "status-tag active" : "status-tag inactive"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 280, // Increased width to fit all buttons comfortably
      render: (_, record) => (
        <Space size="small">
          <Button icon={<EyeOutlined />} onClick={() => openView(record)} size="small">
            View
          </Button>
          <Button type="primary" icon={<EditOutlined />} onClick={() => openEdit(record)} size="small">
            Edit
          </Button>
          <Popconfirm
            title={`Are you sure you want to ${record.isActive ? 'deactivate' : 'activate'} this service?`}
            onConfirm={() => handleToggle(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small">
              {record.isActive ? "Deactivate" : "Activate"}
            </Button>
          </Popconfirm>
          
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Styles />

      {/* Header Section */}
      <div className="user-header">
        <div>
          <h2 className="services-title">
            <div className="services-icon">
              <i className="fas fa-tooth"></i>
            </div>
            Services Management
          </h2>
          <p className="services-subtitle">
            Manage dental services, pricing, and availability
          </p>
        </div>

        {/* Search and Action Bar */}
        <div className="filters-and-actions">
          <Search
            placeholder="Search services..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={fetchServices}
          />
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="All Categories"
          >
            <Option value="all">All Categories</Option>
            {categories.map((c) => (
              <Option key={c} value={c}>
                {c}
              </Option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="All Status"
          >
            <Option value="all">All Status</Option>
            <Option value="true">Active</Option>
            <Option value="false">Inactive</Option>
          </Select>

          <div className="action-buttons-group">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
            >
              Create Service
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchServices}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <Card className="user-table-card">
        <Table
          rowKey={(r) => r._id || r.id}
          dataSource={filtered}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} services`,
          }}
        />
      </Card>
      
      {/* --- MODALS --- */}
      {/* View Service Modal */}
      <Modal
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        title="Service Detail"
        width={700}
      >

        {/* Dán đoạn mã này vào bên trong Modal "Service Detail" */}

{viewing && (
  <div className="form-grid-single" style={{ paddingTop: '24px' }}>
    {/* General Information */}
    <div className="form-section">
      <h4 className="section-title">
        <i className="fas fa-info-circle"></i> General
      </h4>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ display: "block", color: "#8c8c8c" }}>Category</div>
          <Tag className="role-tag doctor">{viewing.category}</Tag>
        </div>
        <div>
          <div style={{ display: "block", color: "#8c8c8c" }}>Price</div>
          <div>
            ₫{(typeof viewing.price === "number" ? viewing.price : 0).toLocaleString("vi-VN")}
          </div>
        </div>
        <div>
          <div style={{ display: "block", color: "#8c8c8c" }}>Status</div>
          <Tag className={viewing.isActive ? "status-tag active" : "status-tag inactive"}>
            {viewing.isActive ? "Active" : "Inactive"}
          </Tag>
        </div>
      </div>
    </div>

    {/* Description */}
    <div className="form-section">
      <h4 className="section-title">
        <i className="fas fa-file-alt"></i> Description
      </h4>
      <div style={{ whiteSpace: "pre-wrap", color: "#262626" }}>
        {viewing.description || "No description provided."}
      </div>
    </div>

    {/* Treatment Process */}
    {Array.isArray(viewing.process) && viewing.process.length > 0 && (
      <div className="form-section">
        <h4 className="section-title">
          <i className="fas fa-procedures"></i> Treatment Process
        </h4>
        <div>
          {viewing.process.slice().sort((a, b) => (a.step || 0) - (b.step || 0)).map((p, idx) => (
            <div key={idx} className="treatment-step">
              <div className="step-inputs">
                <div style={{ fontWeight: 'bold' }}>Step {p.step || idx + 1}</div>
                <div>{p.title || "Untitled step"}</div>
              </div>
              <div style={{ marginTop: 8, color: '#595959', whiteSpace: 'pre-wrap' }}>
                {p.description || "No description"}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Image */}
    {viewing.image && (
      <div className="form-section">
        <h4 className="section-title">
          <i className="fas fa-image"></i> Image
        </h4>
        <Image
          width={120}
          height={120}
          src={viewing.image.url || `http://localhost:5000/uploads/${viewing.image.filename}`}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
        />
      </div>
    )}
  </div>
)}
      </Modal>

      {/* Create/Edit Service Modal */}
      <Modal
        title={editing ? "Edit Service" : "Create New Service"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Update Service" : "Create Service"}
        cancelText="Cancel"
        width={800}
      >
       
     <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
    {/* Service Basic Information */}
    <div className="form-section">
      <h4 className="section-title">
        <i className="fas fa-info-circle"></i>
        Basic Information
      </h4>

      <div className="form-grid">
        <Form.Item
          label="Service Name"
          name="name"
          rules={[
            { required: true, message: "Please input service name" },
          ]}
        >
          <Input
            placeholder="Enter service name"
            size="large"
            prefix={
              <i
                className="fas fa-tooth"
                style={{ color: "#1890ff" }}
              ></i>
            }
          />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please input category" }]}
        >
          <AutoComplete
            options={categories.map((c) => ({ value: c }))}
            placeholder="Type or select a category"
            size="large"
            filterOption={(inputValue, option) =>
              (option?.value || "")
                .toLowerCase()
                .includes(inputValue.toLowerCase())
            }
          />
        </Form.Item>
      </div>

      <div className="form-grid">
        <Form.Item
          label="Price (VND)"
          name="price"
          rules={[{ required: true, message: "Please input price" }]}
        >
          <InputNumber
            placeholder="Enter price"
            size="large"
            min={0}
            style={{ width: "100%" }}
            formatter={(v) =>
              `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(v) => v.replace(/,/g, "")}
            prefix="₫"
          />
        </Form.Item>

        <Form.Item label="Duration (minutes)" name="duration">
          <InputNumber
            placeholder="Enter duration"
            size="large"
            min={0}
            style={{ width: "100%" }}
            suffix="mins"
          />
        </Form.Item>
      </div>
    </div>

    {/* Service Image Section */}
    <div className="form-section">
      <h4 className="section-title">
        <i className="fas fa-image"></i>
        Service Image
      </h4>

      <div className="upload-section">
<div className="upload-button">
    <Upload {...uploadProps}>
        <Button
            icon={<UploadOutlined />}
            size="large"
            style={{
                width: "100%",
                height: "120px",
                borderStyle: "dashed",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div className="upload-icon" style={{ fontSize: "24px", color: "#1890ff" }}>
                <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="upload-text" style={{ fontWeight: 300  }}>Click to upload image</div>
            <div className="upload-hint" style={{ fontSize: "10px", color: "#8c8c8c" }}>
                JPG, PNG, WEBP (Max 5MB)
            </div>
        </Button>
    </Upload>
</div>

{imagePreview && (
    <div className="image-preview-container">
        <div className="image-preview-wrapper">
            <div className="preview-label" style={{ fontSize: "12px", color: "#8c8c8c", textAlign: "center" }}>Preview</div>
            <Image
                width={120}
                height={100}
                src={imagePreview}
                style={{ objectFit: "cover", borderRadius: "4px" }}
            />
            <Button
                type="text"
                danger
                icon={<DeleteIcon />}
                onClick={handleRemoveImage}
                className="remove-image-btn"
                size="small"
            />
        </div>
    </div>
)}
      </div>
    </div>

    {/* Service Details */}
    <div className="form-section">
      <h4 className="section-title">
        <i className="fas fa-file-alt"></i>
        Service Details
      </h4>

      <Form.Item
        label="Description"
        name="description"
        help="Detailed description of the service"
      >
        <Input.TextArea
          rows={4}
          placeholder="Enter detailed service description..."
          size="large"
        />
      </Form.Item>

      {/* Treatment Process */}
      <div style={{ marginTop: 16 }}>
        <h4 className="section-title">
            <i className="fas fa-procedures"></i>
            Treatment Process
        </h4>

{processSteps.length === 0 && (
    <div style={{ color: "#8c8c8c", marginBottom: 12 }}>
        No steps added yet. Click "+ Add Step" to begin.
    </div>
)}

{/* Lặp qua và hiển thị các bước đã có */}
{processSteps.map((step, index) => (
    <div key={index} className="treatment-step">
        <div className="step-inputs">
            <InputNumber
                placeholder="Step No."
                min={1}
                value={step.step}
                onChange={(value) => {
                    const next = [...processSteps];
                    next[index] = { ...next[index], step: value };
                    setProcessSteps(next);
                }}
            />
            <Input
                placeholder="Step title (e.g., Consultation, X-Ray)"
                value={step.title}
                onChange={(e) => {
                    const next = [...processSteps];
                    next[index] = { ...next[index], title: e.target.value };
                    setProcessSteps(next);
                }}
            />
        </div>
        <Input.TextArea
            rows={2}
            placeholder="Step description..."
            style={{ marginTop: 8 }}
            value={step.description}
            onChange={(e) => {
                const next = [...processSteps];
                next[index] = { ...next[index], description: e.target.value };
                setProcessSteps(next);
            }}
        />
        <div style={{ textAlign: "right", marginTop: 8 }}>
            <Button
                danger
                type="dashed"
                size="small"
                onClick={() => {
                    const next = processSteps.filter((_, i) => i !== index);
                    setProcessSteps(next);
                }}
            >
                Remove Step
            </Button>
        </div>
    </div>
))}

{/* Nút thêm bước mới */}
<Button
    type="dashed"
    icon={<PlusOutlined />}
    onClick={() =>
        setProcessSteps([
            ...processSteps,
            {
                step: processSteps.length + 1,
                title: "",
                description: "",
            },
        ])
    }
>
    Add Step
</Button>
      </div>
    </div>

    {/* Service Status */}
    <div className="form-section">
    <h4 className="section-title">
        <i className="fas fa-toggle-on"></i>
        Service Status
    </h4>
    <Form.Item name="isActive" valuePropName="checked" style={{ margin: 0 }}>
        <label htmlFor="service-status-toggle" className="status-section">
            <input 
              type="checkbox" 
              className="status-checkbox" 
              id="service-status-toggle" 
            />
            <div className="status-info">
                <div className="status-title">Active Service</div>
                <div className="status-description">
                    Make this service available for booking
                </div>
            </div>
        </label>
    </Form.Item>
</div>
</Form>
      </Modal>
    </div>
  );
};

export default ServicesManager;