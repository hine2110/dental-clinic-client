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

const emptyService = {
  name: "",
  description: "",
  category: "",
  price: 0,
  duration: undefined,
  thumbnail: "",
  isActive: true,
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
      thumbnail: record.thumbnail,
      isActive: record.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await adminService.updateService(editing._id || editing.id, values);
        message.success("Service updated");
      } else {
        await adminService.createService(values);
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

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (v) => (typeof v === "number" ? v.toLocaleString() : v),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) =>
        v ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Button
            icon={
              record.isActive ? (
                <StopTwoTone twoToneColor="#ff4d4f" />
              ) : (
                <CheckCircleTwoTone twoToneColor="#52c41a" />
              )
            }
            onClick={() => handleToggle(record)}
          >
            {record.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Popconfirm
            title="Delete service?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="services-toolbar">
        <Search
          placeholder="Search services"
          allowClear
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={() => fetchServices()}
          style={{ maxWidth: 280 }}
        />
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
          style={{ width: 160 }}
        >
          <Option value="all">All categories</Option>
          {categories.map((c) => (
            <Option key={c} value={c}>
              {c}
            </Option>
          ))}
        </Select>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 160 }}
        >
          <Option value="all">All status</Option>
          <Option value="true">Active</Option>
          <Option value="false">Inactive</Option>
        </Select>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New Service
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchServices}>
            Refresh
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          rowKey={(r) => r._id || r.id}
          dataSource={filtered}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editing ? "Edit Service" : "New Service"}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editing ? "Save" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            className="service-form-item"
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input name" }]}
          >
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item
            className="service-form-item"
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select showSearch allowClear placeholder="Select category">
              {categories.map((c) => (
                <Option key={c} value={c}>
                  {c}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            className="service-form-item"
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please input price" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(v) => v.replace(/,/g, "")}
            />
          </Form.Item>
          <Form.Item
            className="service-form-item"
            label="Duration (mins)"
            name="duration"
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            className="service-form-item"
            label="Thumbnail URL"
            name="thumbnail"
          >
            <Input />
          </Form.Item>
          <Form.Item
            className="service-form-item"
            label="Description"
            name="description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ServicesManager;
