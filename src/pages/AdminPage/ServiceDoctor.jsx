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
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleTwoTone,
  StopTwoTone,
} from "@ant-design/icons";
import { adminService } from "../../services/adminService";
const { Search } = Input;
const { Option } = Select;
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
      /* Cập nhật: 2fr 1fr auto (Bỏ cột Category) */
      grid-template-columns: 2fr 1fr auto; 
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
    .status-tag {
      border-radius: 12px;
      font-weight: 500;
      padding: 2px 10px;
      border-width: 1px;
      border-style: solid;
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
   
    /* CSS cho công tắc (toggle) */
    .status-checkbox {
      appearance: none;
      position: relative;
      width: 30px; 
      height: 17px;
      background-color: #bfbfbf;
      border-radius: 25px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      vertical-align: middle;
    }
    .status-checkbox::after {
      content: '';
      position: absolute;
      top: 1.5px;
      left: 1.5px;
      width: 14px;
      height: 14px;
      background-color: white;
      border-radius: 50%;
      transition: left 0.3s ease;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .status-checkbox:checked {
      background-color: #1890ff; 
    }
    .status-checkbox:checked::after {
      left: 14.5px;
    }
  `}</style>
);

// Dữ liệu rỗng cho form
const emptyServiceDoctor = {
  serviceName: "",
  price: 0,
  isActive: true,
};

const ServiceDoctorManager = () => {
  const [loading, setLoading] = useState(false);
  const [serviceDoctors, setServiceDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = Create, object = Edit
  const [form] = Form.useForm();

  // Hàm gọi API lấy danh sách ServiceDoctors
  const fetchServiceDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        limit: "all",
        isActive: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm,
      };
      // Giả sử bạn có hàm này trong adminService
      const res = await adminService.getServiceDoctors(params); 
      if (res.success) setServiceDoctors(res.data || []);
      else throw new Error(res.message || "Failed");
    } catch (e) {
      message.error(e.message || "Failed to load doctor services");
      setServiceDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy dữ liệu khi filter thay đổi
  useEffect(() => {
    fetchServiceDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]); 
  // Chỉ fetch lại khi filter, search sẽ fetch khi nhấn onSearch

  // Lọc dữ liệu dựa trên searchTerm (FE search)
  const filteredData = useMemo(() => {
    if (!searchTerm) return serviceDoctors;
    const lower = searchTerm.toLowerCase();
    return serviceDoctors.filter(
      (s) => (s.serviceName || "").toLowerCase().includes(lower)
    );
  }, [serviceDoctors, searchTerm]);

  // Mở modal để tạo mới
  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue(emptyServiceDoctor);
    setModalOpen(true);
  };

  // Mở modal để chỉnh sửa
  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      serviceName: record.serviceName,
      price: record.price,
      isActive: record.isActive,
    });
    setModalOpen(true);
  };

  // Xử lý submit form (Tạo mới hoặc Cập nhật)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Không dùng FormData vì không có file
      const payload = {
        serviceName: values.serviceName,
        price: values.price,
        isActive: values.isActive,
      };

      if (editing) {
        // Chế độ Cập nhật
        await adminService.updateServiceDoctor(editing._id || editing.id, payload);
        message.success("Doctor Service updated");
      } else {
        // Chế độ Tạo mới
        await adminService.createServiceDoctor(payload);
        message.success("Doctor Service created");
      }
      setModalOpen(false);
      fetchServiceDoctors(); // Tải lại dữ liệu
    } catch (e) {
      if (e?.errorFields) return; // Lỗi validation của Antd
      message.error(e.response?.data?.message || e.message || "Failed to save service");
    }
  };

  // Xử lý Toggle Status (Xoá mềm)
  const handleToggle = async (record) => {
    try {
      await adminService.toggleServiceDoctorStatus(record._id || record.id);
      message.success(record.isActive ? "Deactivated" : "Activated");
      fetchServiceDoctors(); // Tải lại
    } catch (e) {
      message.error(e.message || "Failed to toggle");
    }
  };

  // Xử lý Xoá cứng
  const handleDelete = async (record) => {
    try {
      await adminService.hardDeleteServiceDoctor(record._id || record.id);
      message.success("Service permanently deleted");
      fetchServiceDoctors(); // Tải lại
    } catch (e) {
      message.error(e.message || "Failed to delete");
    }
  };

  // Định nghĩa cột cho bảng
  const columns = [
    {
      title: "Service Name",
      dataIndex: "serviceName",
      key: "serviceName",
      sorter: (a, b) => a.serviceName.localeCompare(b.serviceName),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      sorter: (a, b) => a.price - b.price,
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
      width: 280, 
      render: (_, record) => (
        <Space size="small">
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
          <Popconfirm
            title="Delete permanently?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record)}
            okText="Delete"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
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
              {/* Thay đổi icon */}
              <i className="fas fa-user-md"></i> 
            </div>
            Doctor Services Management
          </h2>
          <p className="services-subtitle">
            Manage services performed by doctors
          </p>
        </div>

        {/* Search and Action Bar */}
        <div className="filters-and-actions">
          <Search
            placeholder="Search services..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            // onSearch={fetchServiceDoctors} // Bỏ onSearch để dùng filter động
          />
          {/* Bỏ Filter Category */}
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
              onClick={fetchServiceDoctors}
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
          dataSource={filteredData} // Dùng data đã filter
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} services`,
          }}
        />
      </Card>
      
      {/* Create/Edit Service Modal */}
      <Modal
        title={editing ? "Edit Doctor Service" : "Create New Doctor Service"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Update Service" : "Create Service"}
        cancelText="Cancel"
        width={600} // Thu nhỏ modal
      >
        
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          {/* Service Basic Information */}
          <div className="form-section">
            <h4 className="section-title">
              <i className="fas fa-info-circle"></i>
              Basic Information
            </h4>

            {/* Đổi thành 1 cột */}
            <div className="form-grid-single"> 
              <Form.Item
                label="Service Name"
                name="serviceName" // Đổi tên trường
                rules={[
                  { required: true, message: "Please input service name" },
                ]}
              >
                <Input
                  placeholder="Enter service name"
                  size="large"
                  prefix={
                    <i
                      className="fas fa-user-md" // Đổi icon
                      style={{ color: "#1890ff" }}
                    ></i>
                  }
                />
              </Form.Item>

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
            </div>
          </div>
          
          {/* Bỏ Section Image, Description, Process */}

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

export default ServiceDoctorManager;