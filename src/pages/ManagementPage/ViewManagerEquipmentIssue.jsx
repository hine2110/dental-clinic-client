// src/pages/management/ViewManagerEquipmentIssue.jsx

import React, { useState, useEffect } from 'react';
import { Spin, Alert, Table, Select, Tag, Tooltip } from 'antd'; // Sử dụng Ant Design
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const getToken = () => localStorage.getItem('token');

// Enum các trạng thái (lấy từ model)
const STATUS_OPTIONS = [
  { value: "reported", label: "Mới báo cáo" },
  { value: "under_review", label: "Đang xem xét" },
  { value: "in_repair", label: "Đang sửa chữa" },
  { value: "resolved", label: "Đã giải quyết" },
  { value: "rejected", label: "Bị từ chối" }
];

const ViewManagerEquipmentIssue = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({}); 
  const [locations, setLocations] = useState([]);

  const fetchIssues = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/management/equipment/issues`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi tải dữ liệu');
      setIssues(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = getToken();
      // Giả sử manager cũng dùng API /locations (giống StoreKeeper)
      const response = await fetch(`${API_BASE}/locations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setLocations(data.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách cơ sở:", err.message);
      // Không block UI nếu lỗi tải location
    }
  };


  useEffect(() => {
    fetchIssues();
    fetchLocations(); // <-- THÊM: Gọi hàm fetch locations
  }, []);
  const handleStatusChange = async (issueId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [issueId]: true })); // Bắt đầu loading cho dòng này
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/management/equipment/issues/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Lỗi cập nhật trạng thái');
      
      // Cập nhật lại list issues trong state để UI thay đổi
      setIssues(prevIssues => 
        prevIssues.map(issue => 
          issue._id === issueId ? { ...issue, status: newStatus } : issue
        )
      );
      // alert('Cập nhật trạng thái thành công!'); // Có thể bỏ alert nếu không muốn làm phiền

    } catch (err) {
      setError(`Lỗi cập nhật sự cố ${issueId}: ${err.message}`);
      // Không thay đổi trạng thái nếu lỗi
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [issueId]: false })); // Kết thúc loading cho dòng này
    }
  };
  
  // Helper lấy màu tag
  const getStatusColor = (status) => {
    switch (status) {
      case 'reported': return 'warning';
      case 'under_review': return 'processing';
      case 'in_repair': return 'blue';
      case 'resolved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  // Định nghĩa cột cho bảng Ant Design
  const columns = [
    {
      title: 'Ngày báo cáo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => dayjs(text).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thiết bị',
      dataIndex: ['equipment', 'name'], // Truy cập lồng
      key: 'equipment',
      render: (text, record) => text || `(ID: ${record.equipment?._id || 'N/A'})`, // Hiển thị ID nếu tên null
    },
    {
      title: 'Cơ sở',
      key: 'location',
      dataIndex: ['equipment', 'location'], // Lấy object location
      render: (location) => location?.name || 'N/A', // Hiển thị tên
      filters: locations.map(loc => ({ text: loc.name, value: loc._id })),
      onFilter: (value, record) => record.equipment?.location?._id === value,
    },
    {
      title: 'Người báo cáo',
      dataIndex: ['reporter', 'user', 'fullName'], // Truy cập lồng
      key: 'reporter',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Mô tả',
      dataIndex: 'issueDescription',
      key: 'description',
      ellipsis: true, // Rút gọn nếu quá dài
      render: (text) => <Tooltip title={text}>{text}</Tooltip>
    },
    {
      title: 'Mức độ',
      dataIndex: 'severity',
      key: 'severity',
      filters: [
        { text: 'Low', value: 'low' },
        { text: 'Medium', value: 'medium' },
        { text: 'High', value: 'high' },
        { text: 'Critical', value: 'critical' },
      ],
      onFilter: (value, record) => record.severity === value,
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      filters: [
        { text: 'Low', value: 'low' },
        { text: 'Medium', value: 'medium' },
        { text: 'High', value: 'high' },
        { text: 'Urgent', value: 'urgent' },
      ],
       onFilter: (value, record) => record.priority === value,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: STATUS_OPTIONS.map(s => ({ text: s.label, value: s.value })),
      filters: STATUS_OPTIONS.map(s => ({ text: s, value: s })),
      onFilter: (value, record) => record.status === value,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(newStatus) => handleStatusChange(record._id, newStatus)}
          style={{ width: 130 }}
          loading={updatingStatus[record._id]} // Loading cho select này
          disabled={updatingStatus[record._id]} // Disable khi đang loading
        >
          {STATUS_OPTIONS.map(option => (
            <Select.Option key={option.value} value={option.value}>
              <Tag color={getStatusColor(option.value)}>{option.label}</Tag>
            </Select.Option>
          ))}
        </Select>
      ),
    },
  ];

  if (loading) return <Spin tip="Đang tải danh sách sự cố..." />;

  return (
    <div className="content-card">
      <h2>Quản lý Sự cố Thiết bị</h2>
      {error && <Alert message="Lỗi" description={error} type="error" showIcon closable style={{ marginBottom: 16 }} />}
      
      <Table
        columns={columns}
        dataSource={issues}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1300 }} // Cho phép cuộn ngang nếu cần
      />
    </div>
  );
};

export default ViewManagerEquipmentIssue;