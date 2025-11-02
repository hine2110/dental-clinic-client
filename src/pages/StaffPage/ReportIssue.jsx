// src/pages/staff/ReportIssue.jsx

import React, { useState, useEffect } from "react";
import './StoreManagement.css'; // Dùng chung CSS

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

// (MỚI) Hàm helper để format ngày tháng (từ ViewEquipmentIssues.jsx)
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

function ReportIssue() {
  // === State cho Form (Phần 1) ===
  const [equipmentList, setEquipmentList] = useState([]);
  const [loadingForm, setLoadingForm] = useState(false); // Đổi tên
  const [errorForm, setErrorForm] = useState(null); // Đổi tên
  const [formData, setFormData] = useState({
    equipment: "", 
    issueDescription: "",
    severity: "medium",
    priority: "medium",
  });
  const [imageUrls, setImageUrls] = useState([]); 
  const [isUploading, setIsUploading] = useState(false);

  // === (MỚI) State cho Bảng (Phần 2) ===
  const [issuesList, setIssuesList] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [errorIssues, setErrorIssues] = useState(null);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loadingLocations, setLoadingLocations] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoadingLocations(true);
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/locations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setLocations(data.data);
          if (data.data.length > 0) {
            setSelectedLocation(data.data[0]._id); // Tự động chọn location đầu tiên
          }
        } else {
          setErrorForm("Lỗi tải cơ sở: " + data.message);
        }
      } catch (err) {
        setErrorForm(err.message);
      }
      setLoadingLocations(false);
    };
    fetchLocations();
  }, []);
  
  // 1a. (Form) Lấy danh sách thiết bị cho dropdown
  const fetchEquipment = async () => {
    if (!selectedLocation) {
      setEquipmentList([]);
      return;
  }
    setLoadingForm(true);
    setErrorForm(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment?isActive=true&locationId=${selectedLocation}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`);
      if (data.success) {
        setEquipmentList(data.data);
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, equipment: data.data[0]._id }));
        }
      } else {
        setErrorForm(data.message);
      }
    } catch (err) {
      setErrorForm(err.message);
    }
    setLoadingForm(false);
  };
  
  // 1b. (MỚI - Bảng) Lấy danh sách báo cáo
  const fetchIssues = async () => {
    if (!selectedLocation) {
      setIssuesList([]);
      return;
  }
    setLoadingIssues(true);
    setErrorIssues(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment/issues?locationId=${selectedLocation}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Lỗi ${res.status}`);
      if (data.success) {
        setIssuesList(data.data);
      } else {
        setErrorIssues(data.message);
      }
    } catch (err) {
      setErrorIssues(err.message);
    }
    setLoadingIssues(false);
  };

  // 1c. Chạy cả 2 hàm fetch khi component tải
  useEffect(() => {
        fetchEquipment();
        fetchIssues();
      }, [selectedLocation]);

  // 2. (Form) Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 3. (Form) Xử lý upload ảnh
  const handleImageUpload = async (e) => {
    // ... (Giữ nguyên hàm handleImageUpload của bạn) ...
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const uploadFormData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadFormData.append('images', files[i]);
    }
    try {
      const res = await fetch(`${API_BASE}/upload/equipment-images`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: uploadFormData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi server khi upload ảnh');
      setImageUrls(prevUrls => [...prevUrls, ...data.urls]);
    } catch (err) {
      alert("Lỗi khi tải ảnh lên: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // 4. (Form) Gửi báo cáo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipment || !formData.issueDescription) {
      alert("Vui lòng chọn thiết bị và mô tả sự cố");
      return;
    }
    
    const finalPayload = { ...formData, images: imageUrls };

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalPayload)
      });
      const data = await res.json();
      if (data.success) {
        alert("Báo cáo sự cố thành công!");
        // Reset form
        setFormData({
          equipment: equipmentList.length > 0 ? equipmentList[0]._id : "",
          issueDescription: "",
          severity: "medium",
          priority: "medium",
        });
        setImageUrls([]); 
        
        // === (MỚI) LÀM MỚI BẢNG ===
        fetchIssues(); 
        // =============================

      } else {
        alert("Lỗi khi báo cáo: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // 5. (MỚI - Bảng) Helper lấy class badge
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
      case 'reported': return 'Mới báo cáo';
      case 'under_review': return 'Đang xem xét';
      case 'in_repair': return 'Đang sửa chữa';
      case 'resolved': return 'Đã giải quyết';
      case 'rejected': return 'Bị từ chối';
      default: return status;
    }
  };

  // Lấy enum từ model
  const severityOptions = ["low", "medium", "high", "critical"];
  const priorityOptions = ["low", "medium", "high", "urgent"];

  return (
    <div className="store-page-container">

      {/* === (MỚI) DROPDOWN LOCATION === */}
      <div className="location-selector-wrapper" style={{marginBottom: '10px'}}>
        <label htmlFor="location-select">Chọn cơ sở:</label>
        <select 
          id="location-select"
          value={selectedLocation}
          onChange={e => setSelectedLocation(e.target.value)}
          disabled={loadingForm || loadingIssues}
        >
          <option value="">-- Chọn cơ sở --</option>
          {locations.map(loc => (
            <option key={loc._id} value={loc._id}>{loc.name}</option>
          ))}
        </select>
      </div>
      <hr />

      {selectedLocation ? (
        <>
          {/* === PHẦN 1: FORM TẠO BÁO CÁO === */}
          <h3>Báo cáo Sự cố Thiết bị</h3>
          
          {loadingForm && <p>Đang tải danh sách thiết bị...</p>}
          {errorForm && <div className="alert alert-danger">{errorForm}</div>}
          
          {!loadingForm && (
            <form onSubmit={handleSubmit} className="store-form" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
              
              <div className="form-group" style={{width: '100%'}}>
                <label>Chọn thiết bị (tại {locations.find(l => l._id === selectedLocation)?.name}):</label>
                <select name="equipment" value={formData.equipment} onChange={handleChange}>
                  {equipmentList.length > 0 ? (
                    equipmentList.map(eq => (
                      <option key={eq._id} value={eq._id}>{eq.name} {eq.model && `(Model: ${eq.model})`}</option>
                    ))
                  ) : (
                    <option value="">Không có thiết bị nào tại cơ sở này</option>
                  )}
                </select>
              </div>
              
              {/* ... (Các phần còn lại của Form giữ nguyên) ... */}
              <div className="form-group" style={{width: '100%'}}>
                <label>Mô tả sự cố:</label>
                <textarea 
                  name="issueDescription" 
                  value={formData.issueDescription} 
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>
              <div className="form-group" style={{width: '100%'}}>
                <label>Mức độ nghiêm trọng (Severity):</label>
                <select name="severity" value={formData.severity} onChange={handleChange}>
                  {severityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group" style={{width: '100%'}}>
                <label>Mức độ ưu tiên (Priority):</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  {priorityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              
              {/* Khối Upload Ảnh */}
              <button type="submit" className="btn btn-primary" style={{marginTop: '10px'}} disabled={isUploading || equipmentList.length === 0}>
                {isUploading ? "Đang xử lý..." : "Gửi báo cáo"}
              </button>
            </form>
          )}

          <hr />

      {/* === PHẦN 2: BẢNG DANH SÁCH BÁO CÁO === */}
      <h3>Danh sách Báo cáo Đã gửi</h3>

      {loadingIssues && <p>Đang tải danh sách báo cáo...</p>}
      {errorIssues && <div className="alert alert-danger">{errorIssues}</div>}

      {!loadingIssues && (
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
      </>
      ) : (
        <p>Vui lòng chọn một cơ sở để bắt đầu.</p>
      )}

    </div>
  );
}

export default ReportIssue;