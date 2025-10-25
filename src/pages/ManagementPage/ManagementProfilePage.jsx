import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEdit, FaSave, FaSpinner } from 'react-icons/fa';
import './ManagementProfilePage.css'; // Chúng ta sẽ tạo tệp này ở dưới

// Hàm tiện ích để lấy token (giả định bạn có)
const getToken = () => localStorage.getItem('token');

function ManagementProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // State cho các trường có thể chỉnh sửa
  const [editablePhone, setEditablePhone] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // API Base URL (đảm bảo nó trỏ đến backend của bạn)
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  // 1. Tải dữ liệu khi component được mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) throw new Error("Bạn chưa đăng nhập.");

        // Gọi API backend
        const response = await fetch(`${API_BASE_URL}/management/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Không thể tải hồ sơ');
        }

        setUserData(result.data);
        setEditablePhone(result.data.phone || '');
        
        // Nếu avatar có đường dẫn, tạo URL đầy đủ
        if (result.data.avatar) {
           // Đường dẫn này dựa trên cấu hình 'uploads/' của bạn
           setAvatarPreview(`${API_BASE_URL}/${result.data.avatar.replace(/\\/g, '/')}`);
        } else {
           setAvatarPreview(null);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [API_BASE_URL]);

  // 2. Xử lý khi chọn tệp avatar mới
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAvatarFile(file);
      // Tạo link xem trước tạm thời
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // 3. Xử lý khi lưu thay đổi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Sử dụng FormData vì chúng ta có upload file
    const formData = new FormData();
    formData.append('phone', editablePhone);
    
    if (selectedAvatarFile) {
      // Tên field 'avatar' phải khớp với upload.single('avatar') ở backend
      formData.append('avatar', selectedAvatarFile); 
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/management/profile`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}` 
          // Không cần 'Content-Type', FormData tự xử lý
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Lỗi khi cập nhật');
      }
      
      alert('Cập nhật hồ sơ thành công!'); 
      
      // Cập nhật lại state với dữ liệu mới từ server
      setUserData(result.data);
      if (result.data.avatar) {
         setAvatarPreview(`${API_BASE_URL}/${result.data.avatar.replace(/\\/g, '/')}`);
      }
      setSelectedAvatarFile(null); // Reset file đã chọn

    } catch (err) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ----- Hàm hỗ trợ định dạng -----
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    // Lấy các trường từ schema
    return [address.street, address.city, address.state, address.country]
      .filter(Boolean) 
      .join(', ');
  };

  // ----- Render -----
  if (loading) {
    return <div className="profile-page content-card">Đang tải hồ sơ...</div>;
  }

  if (error) {
    return <div className="profile-page content-card error-message">{error}</div>;
  }

  if (!userData) {
    return <div className="profile-page content-card">Không tìm thấy dữ liệu.</div>;
  }

  return (
    <div className="profile-page content-card">
      <h1>Hồ sơ Quản lý</h1>
      
      <form onSubmit={handleSubmit} className="profile-form">
        
        {/* === PHẦN BÊN TRÁI (AVATAR) === */}
        <div className="profile-sidebar">
          <div className="avatar-uploader">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="avatar-image" />
            ) : (
              <FaUserCircle className="avatar-placeholder" />
            )}
            <label htmlFor="avatar-input" className="avatar-edit-button">
              <FaEdit /> Thay đổi
            </label>
            <input 
              id="avatar-input"
              type="file" 
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <button 
            type="submit" 
            className="save-button"
            disabled={isSaving}
          >
            {isSaving ? (
              <FaSpinner className="spin-icon" />
            ) : (
              <FaSave />
            )}
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {/* === PHẦN BÊN PHẢI (THÔNG TIN) === */}
        <div className="profile-details">
          {/* --- Trường có thể chỉnh sửa --- */}
          <div className="form-group-grid">
            <div className="form-group editable">
              <label htmlFor="phone">Điện thoại</label>
              <input 
                type="tel"
                id="phone"
                value={editablePhone}
                onChange={(e) => setEditablePhone(e.target.value)}
              />
            </div>
          </div>
          
          {/* --- Các trường chỉ đọc (từ User model) --- */}
          <div className="form-group-grid">
            <div className="form-group read-only">
              <label>Họ và tên</label>
              <span>{userData.fullName}</span>
            </div>
            <div className="form-group read-only">
              <label>Email</label>
              <span>{userData.email}</span>
            </div>
          </div>

          <div className="form-group-grid">
            <div className="form-group read-only">
              <label>Vai trò</label>
              <span>{userData.role}</span>
            </div>
            <div className="form-group read-only">
              <label>Ngày sinh</label>
              <span>{formatDate(userData.dateOfBirth)}</span>
            </div>
          </div>
          
          <div className="form-group read-only">
            <label>Địa chỉ</label>
            <span>{formatAddress(userData.address)}</span>
          </div>
          
          <div className="form-group-grid">
            <div className="form-group read-only">
              <label>Trạng thái</label>
              <span className={`status ${userData.isActive ? 'active' : 'inactive'}`}>
                {userData.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
              </span>
            </div>
            <div className="form-group read-only">
              <label>Đăng nhập lần cuối</label>
              <span>{formatDate(userData.lastLogin)}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ManagementProfilePage;