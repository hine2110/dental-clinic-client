// src/pages/ManagementPage/LocationsPage.jsx

import React, { useState, useEffect } from 'react';
import LocationForm from '../../components/management/LocationForm'; // Đảm bảo đường dẫn đúng
import { FaEdit, FaTrash } from 'react-icons/fa';
import './LocationsPage.css';

function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/management/locations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch locations');
      setLocations(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (savedLocation) => {
    if (editingLocation) {
      setLocations(locations.map(loc => loc._id === savedLocation._id ? savedLocation : loc));
    } else {
      setLocations([...locations, savedLocation]);
    }
    setShowForm(false);
    setEditingLocation(null);
    // Cân nhắc reload lại để Sidebar cập nhật
    // window.location.reload(); 
  };

  const handleDelete = async (locationId) => {
    if (window.confirm('Bạn có chắc muốn vô hiệu hóa cơ sở này không?')) {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/management/locations/${locationId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Lỗi khi vô hiệu hóa');
        
        setLocations(locations.map(loc => 
          loc._id === locationId ? { ...loc, isActive: false } : loc
        ));
        // Cân nhắc reload lại để Sidebar cập nhật
        // window.location.reload();
      } catch (err) {
        setError('Lỗi khi xóa cơ sở. Vui lòng thử lại.');
      }
    }
  };

  const openCreateForm = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const openEditForm = (location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  if (isLoading) return <div>Đang tải dữ liệu...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div className="locations-page content-card">
      <h1>Quản lý Cơ sở</h1>
      
      {!showForm && (
         <button onClick={openCreateForm} className="btn-add-new">
            + Thêm Cơ sở mới
         </button>
      )}

      {showForm && (
        <LocationForm 
          initialData={editingLocation}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}

      <table className="locations-table">
        <thead>
          <tr>
            <th>Tên Cơ Sở</th>
            <th>Địa chỉ</th>
            <th>Điện thoại</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {locations.map(location => (
            <tr key={location._id}>
              <td>{location.name}</td>
              <td>
                {[location.address?.street, location.address?.state, location.address?.city]
                  .filter(Boolean)
                  .join(', ')}
              </td>
              <td>{location.phone}</td>
              <td>
                <span className={`status ${location.isActive ? 'active' : 'inactive'}`}>
                  {location.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                </span>
              </td>
              <td className="actions">
                <button onClick={() => openEditForm(location)} className="icon-btn edit">
                  <FaEdit />
                </button>
                {/* Chỉ hiển thị nút xóa cho các cơ sở đang hoạt động */}
                {location.isActive && (
                  <button onClick={() => handleDelete(location._id)} className="icon-btn delete">
                    <FaTrash />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LocationsPage;