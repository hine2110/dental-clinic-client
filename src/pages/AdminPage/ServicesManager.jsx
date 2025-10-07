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
import "./ServicesManager.css";

const { Search } = Input;
const { Option } = Select;

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
      const res = await adminService.getServices({
        limit: "all",
        category: categoryFilter,
        isActive: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm,
      });
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

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("category", values.category);
      formData.append("price", values.price);
      formData.append("duration", values.duration || "");
      formData.append("isActive", String(values.isActive));

      // Add image file if selected
      if (imageFile) {
        formData.append("image", imageFile, imageFile.name || "upload.png");
      }

      // Add treatment process (as JSON string)
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
        console.log("Updating service with data:", {
          id: editing._id || editing.id,
          formData: Object.fromEntries(formData.entries()),
          imageFile: imageFile ? imageFile.name : null,
        });
        await adminService.updateService(editing._id || editing.id, formData);
        message.success("Service updated");
      } else {
        console.log("Creating service with data:", {
          formData: Object.fromEntries(formData.entries()),
          imageFile: imageFile ? imageFile.name : null,
        });
        await adminService.createService(formData);
        message.success("Service created");
      }
      setModalOpen(false);
      fetchServices();
    } catch (e) {
      if (e?.errorFields) return; // form error
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

  // Handle image upload
  const handleImageChange = (info) => {
    if (info.file) {
      const fileObj = info.file.originFileObj || info.file;
      setImageFile(fileObj);
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      if (fileObj instanceof Blob) {
        reader.readAsDataURL(fileObj);
      }
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Upload props
  const uploadProps = {
    name: "image",
    listType: "picture-card",
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ có thể upload file ảnh!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Kích thước ảnh phải nhỏ hơn 5MB!");
        return false;
      }
      return false; // Prevent auto upload
    },
    onChange: handleImageChange,
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 80,
      align: "center",
      render: (image) => {
        if (image && (image.url || image.filename)) {
          const imageUrl =
            image.url || `http://localhost:5000/uploads/${image.filename}`;
          return (
            <div className="table-cell-image">
              <Image
                width={40}
                height={40}
                src={imageUrl}
                className="image-preview"
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
            </div>
          );
        }
        return (
          <div className="image-placeholder">
            <i className="fas fa-image" style={{ fontSize: "16px" }}></i>
          </div>
        );
      },
    },
    {
      title: "Service Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <div className="service-name">{text}</div>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag className="category-tag">{category}</Tag>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (price) => (
        <div className="price-display">
          ₫{(typeof price === "number" ? price : 0).toLocaleString("vi-VN")}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      align: "center",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"} className="status-tag">
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            icon={<EyeOutlined />}
            onClick={() => openView(record)}
            size="small"
            className="action-btn"
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
            size="small"
            className="action-btn"
          >
            Edit
          </Button>
          <Button
            type={record.isActive ? "default" : "primary"}
            icon={
              record.isActive ? (
                <StopTwoTone twoToneColor="#ff4d4f" />
              ) : (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              )
            }
            onClick={() => handleToggle(record)}
            size="small"
            className="action-btn"
          >
            {record.isActive ? "Deactivate" : "Activate"}
          </Button>
          {/* Delete action removed by request */}
        </Space>
      ),
    },
  ];

  return (
    <div className="services-manager">
      {/* Header Section - Matching Users page format */}
      <div className="services-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
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
        </div>

        {/* Search and Action Bar - Matching Users page */}
        <div className="filters-grid">
          <div className="filter-group">
            <Search
              placeholder="Search services..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={() => fetchServices()}
              style={{ width: "100%" }}
            />
          </div>

          <div className="filter-group">
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: "100%" }}
              placeholder="All Categories"
            >
              <Option value="all">All Categories</Option>
              {categories.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </div>

          <div className="filter-group">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
              placeholder="All Status"
            >
              <Option value="all">All Status</Option>
              <Option value="true">Active</Option>
              <Option value="false">Inactive</Option>
            </Select>
          </div>

          <div className="action-buttons">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreate}
              className="btn-primary-custom"
            >
              Create Service
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchServices}
              className="btn-secondary-custom"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <Card className="services-table-card">
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
          style={{ borderRadius: "8px" }}
        />
      </Card>

      <Modal
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        title={
          viewing ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#13c2c2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 18,
                }}
              >
                <i className="fas fa-eye"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  Service Detail
                </h3>
                <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                  {viewing?.name}
                </p>
              </div>
            </div>
          ) : null
        }
        width={700}
      >
        {viewing && (
          <div className="form-grid-single">
            <div className="form-section">
              <h4 className="section-title">
                <i className="fas fa-info-circle"></i>
                General
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}
              >
                <div>
                  <div
                    className="filter-label"
                    style={{ display: "block", color: "#8c8c8c" }}
                  >
                    Category
                  </div>
                  <Tag className="category-tag">{viewing.category}</Tag>
                </div>
                <div>
                  <div
                    className="filter-label"
                    style={{ display: "block", color: "#8c8c8c" }}
                  >
                    Price
                  </div>
                  <div className="price-display">
                    ₫
                    {(typeof viewing.price === "number"
                      ? viewing.price
                      : 0
                    ).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div>
                  <div
                    className="filter-label"
                    style={{ display: "block", color: "#8c8c8c" }}
                  >
                    Status
                  </div>
                  <Tag
                    color={viewing.isActive ? "green" : "red"}
                    className="status-tag"
                  >
                    {viewing.isActive ? "Active" : "Inactive"}
                  </Tag>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4 className="section-title">
                <i className="fas fa-file-alt"></i>
                Description
              </h4>
              <div style={{ whiteSpace: "pre-wrap", color: "#262626" }}>
                {viewing.description || "No description"}
              </div>
            </div>

            {Array.isArray(viewing.process) && viewing.process.length > 0 && (
              <div className="form-section">
                <h4 className="section-title">
                  <i className="fas fa-procedures"></i>
                  Treatment Process
                </h4>
                <div>
                  {viewing.process
                    .slice()
                    .sort((a, b) => (a.step || 0) - (b.step || 0))
                    .map((p, idx) => (
                      <div
                        key={`${p.step || idx}-${p.title || "t"}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "60px 1fr",
                          gap: 12,
                          alignItems: "start",
                          padding: 12,
                          border: "1px solid #e8e8e8",
                          borderRadius: 8,
                          marginBottom: 8,
                          background: "#fafafa",
                        }}
                      >
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            background: "#1890ff",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                          }}
                        >
                          {p.step || idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            {p.title || "Untitled step"}
                          </div>
                          <div
                            style={{ color: "#595959", whiteSpace: "pre-wrap" }}
                          >
                            {p.description || "No description"}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {viewing.image && (
              <div className="form-section">
                <h4 className="section-title">
                  <i className="fas fa-image"></i>
                  Image
                </h4>
                <div className="table-cell-image">
                  <Image
                    width={120}
                    height={120}
                    src={
                      viewing.image.url ||
                      `http://localhost:5000/uploads/${viewing.image.filename}`
                    }
                    className="image-preview"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#1890ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
              }}
            >
              <i className="fas fa-tooth"></i>
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>
                {editing ? "Edit Service" : "Create New Service"}
              </h3>
              <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
                {editing
                  ? "Update service information"
                  : "Add a new dental service"}
              </p>
            </div>
          </div>
        }
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Update Service" : "Create Service"}
        cancelText="Cancel"
        width={800}
        style={{ top: 20 }}
        className="service-modal"
      >
        <div style={{ padding: "20px 0" }}>
          <Form form={form} layout="vertical">
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
                      }}
                    >
                      <div className="upload-icon">
                        <i className="fas fa-cloud-upload-alt"></i>
                      </div>
                      <div className="upload-text">Click to upload image</div>
                      <div className="upload-hint">
                        JPG, PNG, GIF, WEBP (Max 5MB)
                      </div>
                    </Button>
                  </Upload>
                </div>

                {imagePreview && (
                  <div className="image-preview-container">
                    <div className="image-preview-wrapper">
                      <div className="preview-label">Preview</div>
                      <Image
                        width={120}
                        height={100}
                        src={imagePreview}
                        className="preview-image"
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

              {/* Thumbnail URL removed as requested */}

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

              {/* Treatment Process - dynamic list */}
              <div className="form-section" style={{ marginTop: 16 }}>
                <h4 className="section-title">
                  <i className="fas fa-procedures"></i>
                  Treatment Process
                </h4>

                {processSteps.length === 0 && (
                  <div style={{ color: "#8c8c8c", marginBottom: 12 }}>
                    No steps added yet.
                  </div>
                )}

                {processSteps.map((step, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #e8e8e8",
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 12,
                      background: "#fafafa",
                    }}
                  >
                    <div className="form-grid">
                      <Input
                        placeholder="Step number"
                        type="number"
                        min={1}
                        value={step.step}
                        onChange={(e) => {
                          const next = [...processSteps];
                          next[index] = {
                            ...next[index],
                            step: Number(e.target.value),
                          };
                          setProcessSteps(next);
                        }}
                      />
                      <Input
                        placeholder="Step title"
                        value={step.title}
                        onChange={(e) => {
                          const next = [...processSteps];
                          next[index] = {
                            ...next[index],
                            title: e.target.value,
                          };
                          setProcessSteps(next);
                        }}
                      />
                    </div>
                    <Input.TextArea
                      rows={3}
                      placeholder="Step description"
                      style={{ marginTop: 8 }}
                      value={step.description}
                      onChange={(e) => {
                        const next = [...processSteps];
                        next[index] = {
                          ...next[index],
                          description: e.target.value,
                        };
                        setProcessSteps(next);
                      }}
                    />
                    <div style={{ textAlign: "right", marginTop: 8 }}>
                      <Button
                        danger
                        size="small"
                        onClick={() => {
                          const next = processSteps.filter(
                            (_, i) => i !== index
                          );
                          setProcessSteps(next);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="dashed"
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
                  + Add Step
                </Button>
              </div>
            </div>

            {/* Service Status */}
            <div className="form-section">
              <h4 className="section-title">
                <i className="fas fa-toggle-on"></i>
                Service Status
              </h4>

              <Form.Item
                name="isActive"
                valuePropName="checked"
                style={{ margin: 0 }}
              >
                <div className="status-section">
                  <input type="checkbox" className="status-checkbox" />
                  <div className="status-info">
                    <div className="status-title">Active Service</div>
                    <div className="status-description">
                      Make this service available for booking
                    </div>
                  </div>
                </div>
              </Form.Item>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

// tôi hôm nay đấ rất ngu giờ tôi muốn sao 
//  huy be ti bi ngu vlllllll

export default ServicesManager;
