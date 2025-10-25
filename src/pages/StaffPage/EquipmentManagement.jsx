// src/pages/staff/EquipmentManagement.jsx

import React, { useState, useEffect } from "react";
import './StoreManagement.css'; // <<< THÊM DÒNG NÀY

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'; // Đã sửa API_BASE
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Fetch danh sách
  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment`, {
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

  useEffect(() => {
    fetchEquipment();
  }, []);

  // 2. Xử lý form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // 3. Tạo mới
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        fetchEquipment();
        setFormData({ name: "", category: "", status: "operational", description: "", serialNumber: "", });
      } else {
        console.error("Lỗi từ server:", data);
        alert("Lỗi khi tạo: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // 4. Cập nhật
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editData) return;
    
    const { _id, ...updateBody } = editData; 
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment/${_id}`, {
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

  // 5. Xóa
  const handleDelete = async (equipmentId) => {
    if (!window.confirm("Bạn có chắc muốn xóa thiết bị này?")) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/equipment/${equipmentId}`, {
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

  const equipmentStatusOptions = ["operational", "maintenance", "repair", "out of order"];

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="store-page-container">
      <h3>Quản lý Thiết bị</h3>

      {/* === FORM TẠO/CẬP NHẬT === */}
      <h4>{editData ? "Cập nhật thiết bị" : "Tạo thiết bị mới"}</h4>
      <form onSubmit={editData ? handleUpdate : handleCreate} className="store-form">
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
            {equipmentStatusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
            <input 
                name="serialNumber" 
                value={formData.serialNumber}
                onChange={handleFormChange}
                placeholder="Số Serial (Bắt buộc)" 
                required 
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
        <button type="submit" className="btn btn-primary">{editData ? "Cập nhật" : "Tạo mới"}</button>
        {editData && <button type="button" className="btn btn-secondary" onClick={() => setEditData(null)}>Hủy</button>}
      </form>
      
      <hr />

      {/* === DANH SÁCH THIẾT BỊ === */}
      <h4>Danh sách thiết bị</h4>
      <div className="store-table-wrapper">
        <table className="store-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Loại</th>
              <th>Trạng thái</th>
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
    </div>
  );
}

export default EquipmentManagement;