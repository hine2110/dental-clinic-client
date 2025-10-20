// src/pages/AdminPage/DiscountsManager.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  message,
  Popconfirm,
  Tag,
  Card,
} from "antd";
// Thêm icon SyncOutlined để làm nút generate
import { PlusOutlined, EditOutlined, ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import { adminService } from "../../services/adminService";
import moment from "moment";
import './AdminDashboard.css';

const DiscountsManager = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [form] = Form.useForm();

  // ... (các hàm fetchDiscounts, handleOpenModal, useEffect, handleCancel, onFinish, handleToggleStatus không đổi) ...
  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllDiscounts();
      if (res.success) {
        const sortedData = (res.data || []).sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDiscounts(sortedData);
      } else {
        message.error(res.message || "Failed to fetch discounts");
        setDiscounts([]);
      }
    } catch (error) {
      message.error(error.message || "Failed to load discounts.");
      console.error("Fetch discounts error details:", error);
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleOpenModal = (discount = null) => {
    setEditingDiscount(discount);
    setModalVisible(true);
  };

  useEffect(() => {
    if (modalVisible) {
      if (editingDiscount) {
        form.setFieldsValue({
          ...editingDiscount,
          dateRange: [
            editingDiscount.startDate ? moment(editingDiscount.startDate) : null,
            editingDiscount.endDate ? moment(editingDiscount.endDate) : null
          ]
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ isActive: true });
      }
    }
  }, [modalVisible, editingDiscount, form]);

  const handleCancel = () => {
    setModalVisible(false);
  };

  const onFinish = async (values) => {
    setLoading(true);
    const payload = {
      ...values,
      startDate: values.dateRange && values.dateRange[0] ? values.dateRange[0].toISOString() : null,
      endDate: values.dateRange && values.dateRange[1] ? values.dateRange[1].toISOString() : null,
    };
    delete payload.dateRange;

    try {
      if (editingDiscount) {
        await adminService.updateDiscount(editingDiscount._id, payload);
        message.success("Discount updated successfully!");
      } else {
        await adminService.createDiscount(payload);
        message.success("Discount created successfully!");
      }
      handleCancel();
      fetchDiscounts();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "An error occurred.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (record) => {
    setLoading(true);
    try {
      const newStatus = !record.isActive;
      await adminService.updateDiscount(record._id, { isActive: newStatus });
      message.success(`Discount ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchDiscounts();
    } catch (error) {
      message.error(error.message || "Failed to update discount status.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeBlur = async (e) => {
    const code = e.target.value.trim();
    if (!code || editingDiscount) {
      return;
    }
    // Tách logic kiểm tra ra hàm riêng để tái sử dụng
    await checkCodeUniqueness(code);
  };

  // =================================================================
  // === HÀM HELPER MỚI: Dùng để kiểm tra tính duy nhất của mã      ===
  // =================================================================
  const checkCodeUniqueness = async (code) => {
    try {
      const result = await adminService.checkDiscountCode(code);
      if (result.exists) {
        form.setFields([{ name: 'code', errors: [`Code '${code.toUpperCase()}' already exists.`] }]);
        return false; // Mã đã tồn tại
      } else {
        form.setFields([{ name: 'code', errors: [] }]);
        return true; // Mã là duy nhất
      }
    } catch (error) {
      console.error("Error checking code:", error);
      return false; // Mặc định là false nếu có lỗi
    }
  };
  
  // =================================================================
  // === HÀM MỚI: Tạo mã ngẫu nhiên và tự động kiểm tra             ===
  // =================================================================
  const handleGenerateCode = async () => {
    let isUnique = false;
    let newCode = '';
    let attempts = 0; // Thêm biến đếm để tránh lặp vô hạn

    while (!isUnique && attempts < 10) {
      // 1. Tạo mã ngẫu nhiên
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      newCode = result;
      
      // 2. Tự động kiểm tra mã vừa tạo
      isUnique = await checkCodeUniqueness(newCode);
      attempts++;
    }

    // 3. Cập nhật giá trị vào form
    form.setFieldsValue({ code: newCode });
  };


  const columns = [
    { title: "Code", dataIndex: "code", key: "code", render: (text) => <Tag color="blue">{text}</Tag> },
    { title: "Description", dataIndex: "description", key: "description", width: '25%' },
    { title: "Percentage", dataIndex: "discountPercentage", key: "discountPercentage", render: (text) => `${text}%`, sorter: (a, b) => a.discountPercentage - b.discountPercentage },
    { title: "Effective Date", key: "effectiveDate", render: (_, record) => (<span>{record.startDate ? moment(record.startDate).format("DD/MM/YYYY") : 'N/A'} - {record.endDate ? moment(record.endDate).format("DD/MM/YYYY") : 'N/A'}</span>), sorter: (a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0) },
    { title: "Status", dataIndex: "isActive", key: "isActive", render: (isActive) => (<Tag className={isActive ? "status-tag active" : "status-tag inactive"}>{isActive ? "Active" : "Inactive"}</Tag>), filters: [{ text: 'Active', value: true }, { text: 'Inactive', value: false }], onFilter: (value, record) => record.isActive === value },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Edit</Button>
          <Popconfirm
            title={`Are you sure to ${record.isActive ? 'deactivate' : 'activate'} this discount?`}
            onConfirm={() => handleToggleStatus(record)}
            okText="Yes" cancelText="No">
            <Button danger={record.isActive}>{record.isActive ? "Deactivate" : "Activate"}</Button>
          </Popconfirm>
        </Space>
      ),
      width: 220
    },
  ];

  return (
    <div className="user-manager">
      <div className="user-header">
        <h2 className="services-title">Discount Management</h2>
        <div className="action-buttons-group" style={{ marginTop: '20px', justifyContent: 'flex-start' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Create Discount</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchDiscounts} loading={loading}>Refresh</Button>
        </div>
      </div>
      <Card className="user-table-card">
        <Table columns={columns} dataSource={discounts} rowKey="_id" loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal
        title={editingDiscount ? "Edit Discount" : "Create New Discount"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        confirmLoading={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
          {/* ========== PHẦN CODE ĐÃ ĐƯỢC CẬP NHẬT ========== */}
          <Form.Item
            name="code"
            label="Discount Code"
            rules={[{ required: true, message: 'Please input the discount code!' }]}
            hasFeedback>
            <Input
              placeholder="Click generate icon or type manually"
              onBlur={handleCodeBlur}
              disabled={!!editingDiscount}
              style={{ textTransform: 'uppercase' }}
              // Thêm nút Generate vào đây
              suffix={
                <Button
                  type="text"
                  icon={<SyncOutlined />}
                  onClick={handleGenerateCode}
                  disabled={!!editingDiscount} // Vô hiệu hóa nút khi edit
                />
              }
            />
          </Form.Item>
          {/* ==================================================== */}

          <Form.Item name="discountPercentage" label="Discount Percentage (%)" rules={[{ required: true }]}>
            <InputNumber min={1} max={100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
          <Form.Item name="dateRange" label="Effective Date Range" rules={[{ required: true, message: 'Please select the effective date range!' }]}>
            <DatePicker.RangePicker
              disabledDate={(current) => current && current < moment().startOf('day')}
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
            />
          </Form.Item>
          <Form.Item name="maxUsage" label="Maximum Usage (Optional)">
            <InputNumber min={1} style={{ width: "100%" }} placeholder="Leave blank for unlimited" />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginTop: 24 }}>
            <Space>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingDiscount ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscountsManager;