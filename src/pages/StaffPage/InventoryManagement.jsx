// src/pages/staff/InventoryManagement.jsx

import React, { useState, useEffect } from "react";
import './StoreManagement.css'; // <<< THÊM DÒNG NÀY

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'; // Đã sửa API_BASE

// Hàm helper để lấy token
const getToken = () => localStorage.getItem('token');

function InventoryManagement() {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category: "",
    currentStock: 0, 
    description: "",
    medicineId: "",
  });
  const [editData, setEditData] = useState(null); 
  const [addStock, setAddStock] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    const fetchLocations = async () => {
      // (Bạn có thể đưa hàm này ra một file utils.js để dùng chung)
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

  // 1. Fetch danh sách thuốc
  const fetchMedicines = async () => {
    if (!selectedLocation) {
      setMedicines([]); // Xóa danh sách cũ
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/inventory?locationId=${selectedLocation}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMedicines(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedicines();
  }, [selectedLocation]);

  // 2. Xử lý thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'price' || name === 'currentStock' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'price' ? Number(value) : (name === 'minimumStock' ? Number(value) : value);
    setEditData(prev => ({ ...prev, [name]: val }));
  };
  
  // 3. Xử lý Tạo mới
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Vui lòng chọn cơ sở trước khi tạo.");
      return;
  }
    try {
      const token = getToken();
      const body = { ...formData, location: selectedLocation };
      const res = await fetch(`${API_BASE}/staff/store/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        fetchMedicines(); 
        setFormData({ name: "", price: 0, category: "", currentStock: 0, description: "", medicineId: "" });
      } else {
        alert("Lỗi khi tạo: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };
  
  // 4. Xử lý Cập nhật (Nhập kho)
  const handleAddStock = async (e) => {
    e.preventDefault();
    if (addStock <= 0 || !editData) {
        alert("Vui lòng chọn thuốc và nhập số lượng > 0");
        return;
    }
    
    try {
      const token = getToken();
      const body = { currentStock: addStock };
      
      const res = await fetch(`${API_BASE}/staff/store/inventory/${editData._id}?locationId=${selectedLocation}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      
      const data = await res.json();
      if (data.success) {
        fetchMedicines();
        setEditData(null);
        setAddStock(0);
      } else {
        alert("Lỗi khi nhập kho: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // 5. Xử lý Cập nhật (Thông tin)
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!editData) return;

    if (!editData.name || editData.name.trim() === "") {
                      alert("Tên thuốc không được để trống.");
                      return;
                  }
                  if (editData.price === undefined || editData.price < 0) {
                      alert("Giá thuốc không hợp lệ.");
                      return;
                  }
      
        const { _id, currentStock, ...updateData } = editData;
    
        // Tạo body mới và xử lý 'location'
        const updateBody = {
          ...updateData,
          location: updateData.location._id || updateData.location
        };
    

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/inventory/${_id}?locationId=${selectedLocation}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateBody) 
      });
      const data = await res.json();
      if (data.success) {
        fetchMedicines();
        setEditData(null);
      } else {
        alert("Lỗi khi cập nhật: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  // 6. Xử lý Xóa
  const handleDelete = async (medicineId) => {
    if (!window.confirm("Bạn có chắc muốn xóa thuốc này?")) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/staff/store/inventory/${medicineId}?locationId=${selectedLocation}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchMedicines();
      } else {
        alert("Lỗi khi xóa: " + data.message);
      }
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="store-page-container">
      <h3>Quản lý Thuốc</h3>

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

      {selectedLocation ? (
        <>

      {/* === FORM TẠO MỚI === */}
      <h4>Tạo thuốc mới</h4>
      <form onSubmit={handleCreate} className="store-form">
        <div className="form-group">
          <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Tên thuốc" required />
        </div>
        <div className="form-group">
          <input name="price" type="number" value={formData.price} onChange={handleFormChange} placeholder="Giá" required />
        </div>
        <div className="form-group">
          <input name="currentStock" type="number" value={formData.currentStock} onChange={handleFormChange} placeholder="Số lượng ban đầu" />
        </div>
        <div className="form-group">
          <input name="category" value={formData.category} onChange={handleFormChange} placeholder="Loại thuốc" />
        </div>
        <div className="form-group">
          <input name="description" value={formData.description} onChange={handleFormChange} placeholder="Mô tả" />
        </div>
        <button type="submit" className="btn btn-primary">Tạo mới</button>
      </form>
      
      <hr />
      
      {/* === FORM CẬP NHẬT === */}
      {editData && (
        <div className="edit-form-container">
          <h4>Cập nhật thuốc: {editData.name} (Tồn kho: {editData.currentStock})</h4>
          
          {/* Form cập nhật thông tin */}
          <form onSubmit={handleUpdateInfo} className="store-form">
            <div className="form-group">
              <input name="name" value={editData.name} onChange={handleEditFormChange} placeholder="Tên thuốc" required />
            </div>
            <div className="form-group">
              <input name="price" type="number" value={editData.price} onChange={handleEditFormChange} placeholder="Giá" required />
            </div>
            <div className="form-group">
              <input name="category" value={editData.category || ''} onChange={handleEditFormChange} placeholder="Loại thuốc" />
            </div>
            <div className="form-group">
              <input name="description" value={editData.description || ''} onChange={handleEditFormChange} placeholder="Mô tả" />
            </div>
            <button type="submit" className="btn btn-primary">Cập nhật</button>
          </form>

          {/* Form nhập kho */}
          <form onSubmit={handleAddStock} className="store-form stock-add-form">
            <div className="form-group">
              <input type="number" value={addStock} onChange={e => setAddStock(Number(e.target.value))} placeholder="Số lượng nhập thêm" />
            </div>
            <button type="submit" className="btn btn-secondary">Nhập kho</button>
          </form>
          
          <button onClick={() => setEditData(null)} className="btn btn-secondary" style={{marginTop: '12px'}}>Hủy</button>
          <hr />
        </div>
      )}

      {/* === DANH SÁCH THUỐC === */}
      <h4>Danh sách thuốc</h4>
      {loading && <div>Đang tải danh sách...</div>}
          <div className="store-table-wrapper">
            <table className="store-table">
          <thead>
            <tr>
              <th>Mã thuốc</th>
              <th>Tên</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Loại</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map(med => (
              <tr key={med._id}>
                <td>{med.medicineId}</td>
                <td>{med.name}</td>
                <td>{med.price}</td>
                <td>{med.currentStock}</td>
                <td>{med.category}</td>
                <td>{med.description}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-secondary" onClick={() => setEditData(med)}>Sửa</button>
                    <button className="btn btn-delete" onClick={() => handleDelete(med._id)}>Xóa</button>
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

export default InventoryManagement;