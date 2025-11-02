// src/pages/staff/InventoryManagement.jsx

import React, { useState, useEffect } from "react";
import './StoreManagement.css'; 
import Toast from '../../components/common/Toast';

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

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

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
    // Thêm 'currentStock' vào danh sách chuyển đổi sang Number
    const val = (name === 'price' || name === 'minimumStock' || name === 'currentStock') 
                ? Number(value) 
                : value;
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
      // Sửa 1: Gửi 'addStock' để backend biết đây là CỘNG DỒN
      const body = { addStock: addStock }; 
      
      // Sửa 2: Thêm locationId vào URL
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

    // (Validation giữ nguyên)
    if (!editData.name || editData.name.trim() === "") {
        alert("Tên thuốc không được để trống.");
        return;
    }
    if (editData.price === undefined || editData.price < 0) {
        alert("Giá thuốc không hợp lệ.");
        return;
    }
    if (editData.currentStock === undefined || editData.currentStock < 0) {
        alert("Tồn kho không hợp lệ.");
        return;
    }
      
    // Sửa 1: Chỉ lấy _id ra, giữ mọi thứ khác (bao gồm cả currentStock)
    const { _id, ...updateData } = editData;
    
    // Sửa 2: Xử lý 'location' object (giống như logic ta đã sửa)
    const updateBody = {
      ...updateData,
      location: updateData.location._id || updateData.location
    };
    
    try {
      const token = getToken();
      // Sửa 3: Đảm bảo URL có ?locationId (code của bạn đã có)
      const res = await fetch(`${API_BASE}/staff/store/inventory/${_id}?locationId=${selectedLocation}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateBody) // Gửi body chứa currentStock
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

      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(prev => ({ ...prev, show: false }))} 
        />
      )}

      <h3>Quản Lý Thuốc</h3>

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
        <div className="form-box">
          <h4>Tạo thuốc mới</h4>
          <form onSubmit={handleCreate} className="store-form">
            {/* ... (các input của form tạo mới giữ nguyên) ... */}
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
          </div>
          <hr />
      
      {/* === FORM CẬP NHẬT === */}
      {editData && (
        <div className="form-box">
          
        {/* === BOX 1: CẬP NHẬT THÔNG TIN === */}
        <h4>Cập nhật thông tin: {editData.name}</h4>
        <form onSubmit={handleUpdateInfo} className="store-form">
          <div className="form-group">
            <label>Tên thuốc</label>
            <input name="name" value={editData.name} onChange={handleEditFormChange} placeholder="Tên thuốc" required />
          </div>
          <div className="form-group">
            <label>Giá</label>
            <input name="price" type="number" value={editData.price} onChange={handleEditFormChange} placeholder="Giá" required />
          </div>
          
          {/* Thêm input cho "Số lượng tồn kho (Tổng)" */}
          <div className="form-group">
              <label>Số lượng tồn kho (Tổng)</label>
              <input 
                  name="currentStock" 
                  type="number" 
                  value={editData.currentStock} 
                  onChange={handleEditFormChange} 
                  placeholder="Tồn kho" 
                  required
              />
          </div>

          <div className="form-group">
            <label>Loại thuốc</label>
            <input name="category" value={editData.category || ''} onChange={handleEditFormChange} placeholder="Loại thuốc" />
          </div>
          <div className="form-group">
            <label>Mô tả</label>
            <input name="description" value={editData.description || ''} onChange={handleEditFormChange} placeholder="Mô tả" />
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Cập nhật thông tin</button>
        </form>

        <hr style={{margin: '20px 0', borderStyle: 'dashed'}} />

        {/* === BOX 2: NHẬP KHO (CỘNG THÊM) === */}
        <h4>Nhập kho (Cộng thêm)</h4>
        <form onSubmit={handleAddStock} className="store-form stock-add-form" style={{justifyContent: 'flex-start'}}>
          <div className="form-group">
            <label>Số lượng nhập thêm</label>
            <input 
              type="number" 
              value={addStock} 
              onChange={e => setAddStock(Number(e.target.value))} 
              placeholder="Ví dụ: 50" 
            />
          </div>
          <button type="submit" className="btn btn-secondary">Nhập kho</button>
        </form>
        
        <hr style={{margin: '20px 0'}} />

        <button onClick={() => setEditData(null)} className="btn btn-secondary" style={{marginTop: '0'}}>Hủy</button>
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