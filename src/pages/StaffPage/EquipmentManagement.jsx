// src/pages/staff/EquipmentManagement.jsx

import React, { useState, useEffect } from "react";
import './StoreManagement.css'; 
import Toast from '../../components/common/Toast';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const getToken = () => localStorage.getItem('token');

function EquipmentManagement() {
  const [equipmentList, setEquipmentList] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    status: "operational",
    description: "",
    serialNumber: "",
  });
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false); // Sửa: chỉ loading khi fetch
  const [error, setError] = useState(null);

  // === PHẦN MỚI: QUẢN LÝ LOCATION ===
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  // ==================================

  // === MỚI: Fetch danh sách locations ===
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const token = getToken();
        // Giả sử bạn có API này để lấy tất cả location
        const res = await fetch(`${API_BASE}/locations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setLocations(data.data);
          // Tùy chọn: tự động chọn location đầu tiên
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
  }, []); // Chạy 1 lần khi component mount
  // ==================================

  // 1. Fetch danh sách (CẬP NHẬT)
  const fetchEquipment = async () => {
    // Chỉ fetch nếu đã chọn location
    if (!selectedLocation) {
      setEquipmentList([]); // Xóa danh sách cũ nếu đổi location
      return;
    }
    
    setLoading(true);
    setError(null); // Xóa lỗi cũ
    try {
      const token = getToken();
      // Thêm locationId vào query string
      const res = await fetch(`${API_BASE}/staff/store/equipment?locationId=${selectedLocation}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEquipmentList(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // CẬP NHẬT: fetch lại khi 'selectedLocation' thay đổi
  useEffect(() => {
    fetchEquipment();
  }, [selectedLocation]);

  // 2. Xử lý form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Tạo mới (CẬP NHẬT)
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
        alert("Vui lòng chọn cơ sở trước khi tạo.");
        return;
    }
    try {
      const token = getToken();
      
      // Thêm location vào body
      const body = { ...formData, location: selectedLocation };

      const res = await fetch(`${API_BASE}/staff/store/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body) // Gửi body đã có location
      });
      const data = await res.json();
      if (data.success) {
        fetchEquipment(); // Tải lại danh sách cho location hiện tại
        setFormData({ name: "", category: "", status: "operational", description: "", serialNumber: "", });
      } else {
        console.error("Lỗi từ server:", data);
        alert("Lỗi khi tạo: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // 4. Cập nhật (Không cần đổi - vì dùng _id)
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editData) return;
    
    const { _id, location, ...updateBody } = editData; // Bỏ location ra nếu có
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment/${_id}?locationId=${selectedLocation}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateBody)
      });
      const data = await res.json();
      if (data.success) {
        fetchEquipment();
        setEditData(null);
      } else {
        alert("Lỗi khi cập nhật: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // 5. Xóa (Không cần đổi - vì dùng _id)
  const handleDelete = async (equipmentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa thiết bị này?")) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment/${equipmentId}?locationId=${selectedLocation}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchEquipment();
      } else {
        alert("Lỗi khi xóa: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const equipmentStatusOptions = [
    { value: "operational",   label: "Đang hoạt động" },
    { value: "maintenance",   label: "Đang bảo trì" },
    { value: "repair",        label: "Đang sửa chữa" },
    { value: "out_of_order",  label: "Hỏng (Ngưng sử dụng)" }
  ];

  // if (loading) return <div>Đang tải...</div>; // Tạm bỏ
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="store-page-container">

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))} 
        />
      )}

      <h3>Quản Lý Thiết Bị</h3>

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
      
      {/* Chỉ hiển thị form và bảng nếu đã chọn location */}
      {selectedLocation ? (
        <>

        <div className="form-box">
          {/* === FORM TẠO/CẬP NHẬT === */}
          <h4>{editData ? "Cập nhật thiết bị" : "Tạo thiết bị mới (cho cơ sở đang chọn)"}</h4>
          <form onSubmit={editData ? handleUpdate : handleCreate} className="store-form">
            {/* ... (Các input không đổi) ... */}
            <div className="form-group">
              <input 
                name="name" 
                value={editData ? editData.name : formData.name}
                onChange={editData ? handleEditFormChange : handleFormChange}
                placeholder="Tên thiết bị" 
                required 
              />
            </div>
            <div className="form-group">
              <input 
                name="category" 
                value={editData ? editData.category : formData.category}
                onChange={editData ? handleEditFormChange : handleFormChange}
                placeholder="Loại thiết bị" 
              />
            </div>
             <div className="form-group">
              <select 
                name="status" 
                value={editData ? editData.status : formData.status}
                onChange={editData ? handleEditFormChange : handleFormChange}
              >
                {/* === DÒNG NÀY ĐÃ ĐƯỢC THAY ĐỔI === */}
                                {equipmentStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
                <input 
                    name="serialNumber" 
                    value={editData ? editData.serialNumber : formData.serialNumber}
                    onChange={editData ? handleEditFormChange : handleFormChange}
                    placeholder="Số Serial" 
                />
            </div>
            <div className="form-group" style={{width: '100%'}}>
              <input 
                name="description" 
                value={editData ? editData.description : formData.description}
                onChange={editData ? handleEditFormChange : handleFormChange}
                placeholder="Mô tả" 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{editData ? "Cập nhật" : "Tạo mới"}</button>
            {editData && <button type="button" className="btn btn-secondary" onClick={() => setEditData(null)}>Hủy</button>}
          </form>
            </div>
          <hr />

          {/* === DANH SÁCH THIẾT BỊ === */}
          <h4>Danh sách thiết bị (tại cơ sở đang chọn)</h4>
          {loading && <div>Đang tải danh sách...</div>}
          <div className="store-table-wrapper">
            <table className="store-table">
              {/* ... (Phần <thead> không đổi) ... */}
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Loại</th>
                  <th>Trạng thái</th>
                  <th>Serial</th>
                  <th>Mô tả</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {equipmentList.map(eq => (
                  <tr key={eq._id}>
                    <td>{eq.name}</td>
                    <td>{eq.category}</td>
                    <td>{eq.status}</td>
                    <td>{eq.serialNumber}</td>
                    <td>{eq.description}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-secondary" onClick={() => setEditData(eq)}>Sửa</button>
                        <button className="btn btn-delete" onClick={() => handleDelete(eq._id)}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>Vui lòng chọn một cơ sở để bắt đầu quản lý.</p>
      )}
    </div>
  );
}

export default EquipmentManagement;