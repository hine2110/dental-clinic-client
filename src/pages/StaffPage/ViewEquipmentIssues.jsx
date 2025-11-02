// src/pages/staff/ViewEquipmentIssues.jsx

import React, { useState, useEffect } from "react";
import './StoreManagement.css'; // Dùng chung CSS

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

// Hàm helper để format ngày tháng
const formatDateTime = (isoDate) => {
  if (!isoDate) return 'N/A';
  return new Date(isoDate).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

function ViewEquipmentIssues() {
  const [issuesList, setIssuesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/locations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setLocations(data.data);
          if (data.data.length > 0) {
            setSelectedLocation(data.data[0]._id);
          }
        } else {
          setError("Không thể tải danh sách cơ sở: " + data.message);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchLocations();
  }, []);
  // 1. Lấy danh sách báo cáo
  useEffect(() => {
    const fetchIssues = async () => {
      if (!selectedLocation) {
        setIssuesList([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        // Gọi API mới chúng ta đã tạo (GET)
        const res = await fetch(`${API_BASE}/staff/store/equipment/issues?locationId=${selectedLocation}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || `Lỗi ${res.status}`);
        }
        if (data.success) {
          setIssuesList(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchIssues();
  }, [selectedLocation]);

  if (loading) return <div className="store-page-container">Đang tải danh sách báo cáo...</div>;
  if (error) return <div className="store-page-container">Lỗi: {error}</div>;

  // Helper để lấy class badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'reported': return 'badge bg-warning text-dark';
      case 'under_review': return 'badge bg-info';
      case 'in_repair': return 'badge bg-primary';
      case 'resolved': return 'badge bg-success';
      case 'rejected': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  };

  const formatStatus = (status) => {
      switch (status) {
        case 'reported': return 'Báo cáo';
        case 'under_review': return 'Đang xem xét';
        case 'in_repair': return 'Đang sửa chữa';
        case 'resolved': return 'Đã giải quyết';
        case 'rejected': return 'Đã từ chối';
        default: return status; 
      }
    };

  return (
    <div className="store-page-container">
      <h3>Danh sách Báo cáo Sự cố</h3>

      {/* === MỚI: DROPDOWN LOCATION === */}
      <div className="location-selector-wrapper">
        <label htmlFor="location-select">Chọn cơ sở:</label>
        <select 
          id="location-select"
          value={selectedLocation}
          onChange={e => setSelectedLocation(e.target.value)}
          disabled={loading}
        >
          <option value="">-- Chọn một cơ sở --</option>
          {locations.map(loc => (
            <option key={loc._id} value={loc._id}>{loc.name}</option>
          ))}
        </select>
      </div>
      <hr />

      {loading && <div>Đang tải danh sách báo cáo...</div>}
      
      {!loading && !selectedLocation && (
        <p>Vui lòng chọn một cơ sở để xem báo cáo.</p>
      )}
      
      {selectedLocation && (
      <div className="store-table-wrapper">
        <table className="store-table">
          <thead>
            <tr>
              <th>Ngày báo cáo</th>
              <th>Thiết bị</th>
              <th>Mô tả sự cố</th>
              <th>Người báo cáo</th>
              <th>Mức độ</th>
              <th>Trạng thái</th>
              {/* Thêm cột HÀNH ĐỘNG nếu bạn muốn Cập nhật trạng thái */}
            </tr>
          </thead>
          <tbody>
            {issuesList.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>Chưa có báo cáo nào.</td>
              </tr>
            ) : (
              issuesList.map(issue => (
                <tr key={issue._id}>
                  <td>{formatDateTime(issue.createdAt)}</td>
                  <td>{issue.equipment?.name || '(Thiết bị đã xóa)'}</td>
                  <td>{issue.issueDescription}</td>
                  {/* Dùng optional chaining (?.) để tránh lỗi nếu user bị xóa */}
                  <td>{issue.reporter?.user?.fullName || 'N/A'}</td>
                  <td>{issue.severity || 'N/A'}</td>
                  <td>
                    <span className={getStatusBadge(issue.status)}>
                      {formatStatus(issue.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

export default ViewEquipmentIssues;