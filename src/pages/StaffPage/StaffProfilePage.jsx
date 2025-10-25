import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEdit, FaSave, FaSpinner, FaBriefcase } from 'react-icons/fa';
// Import context của bạn để lấy thông tin staff
import { useAuth } from '../../context/authContext'; 
import './StaffProfilePage.css'; // Sẽ tạo ở dưới

const getToken = () => localStorage.getItem('token');

function StaffProfilePage() {
  // Giả sử useAuth() trả về thông tin user VÀ staff (staffType)
  // Bạn cần đảm bảo context của bạn cung cấp 'user' và 'staff' (hoặc 'user.staffType')
  const { user, staff } = useAuth(); //

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // === State cho các trường có thể chỉnh sửa ===
  // 1. Từ User model
  const [editablePhone, setEditablePhone] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  // Xác định API endpoint dựa trên staffType
  const staffType = staff?.staffType || user?.staffType; // Lấy từ staff hoặc user context
  const API_SUFFIX = staffType === 'storeKepper' ? 'store' : 'receptionist';
  const GET_URL = `${API_BASE_URL}/staff/${API_SUFFIX}/profile/self`;
  const PUT_URL = `${API_BASE_URL}/staff/${API_SUFFIX}/profile`;

  // 1. Tải dữ liệu
  useEffect(() => {
    if (!staffType) {
      setError("Không thể xác định loại nhân viên.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = getToken();

        const response = await fetch(GET_URL, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();

        if (!response.ok) throw new Error(result.message || 'Không thể tải hồ sơ');

        setProfileData(result.data);
        
        // Gán state cho User fields
        setEditablePhone(result.data.user?.phone || '');
        if (result.data.user?.avatar) {
          setAvatarPreview(`${API_BASE_URL}/${result.data.user.avatar.replace(/\\/g, '/')}`);
        }
        
        

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [GET_URL, staffType, API_BASE_URL]);

  // 2. Xử lý chọn Avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // 3. Xử lý Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();

    // Thêm User fields
    formData.append('phone', editablePhone);
    if (selectedAvatarFile) {
      formData.append('avatar', selectedAvatarFile);
    }

    

    try {
      const token = getToken();
      const response = await fetch(PUT_URL, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Lỗi khi cập nhật');

      alert('Cập nhật hồ sơ thành công!');
      
      // Cập nhật lại state với dữ liệu mới
      setProfileData(result.data);
      if (result.data.user?.avatar) {
         setAvatarPreview(`${API_BASE_URL}/${result.data.user.avatar.replace(/\\/g, '/')}`);
      }
      setSelectedAvatarFile(null);

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

  // ----- Render -----
  if (loading) return <div className="profile-page content-card">Đang tải hồ sơ...</div>;
  if (error) return <div className="profile-page content-card error-message">{error}</div>;
  if (!profileData || !profileData.user) return <div className="profile-page content-card">Không tìm thấy dữ liệu.</div>;
  
  const { user: userData, profile: staffProfile } = profileData;

  return (
    <div className="profile-page content-card">
      <h1>Hồ sơ cá nhân</h1>
      
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
            {isSaving ? <FaSpinner className="spin-icon" /> : <FaSave />}
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>

        {/* === PHẦN BÊN PHẢI (THÔNG TIN) === */}
        <div className="profile-details">
          
          {/* --- Phần thông tin chung (Từ User model) --- */}
          <h2><FaUserCircle /> Thông tin chung</h2>
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
             <div className="form-group editable">
              <label htmlFor="phone">Điện thoại</label>
              <input 
                type="tel"
                id="phone"
                value={editablePhone}
                onChange={(e) => setEditablePhone(e.target.value)}
              />
            </div>
            <div className="form-group read-only">
              <label>Ngày sinh</label>
              <span>{formatDate(userData.dateOfBirth)}</span>
            </div>
          </div>
          
          {/* --- Phần thông tin chuyên môn (Từ Staff model) --- */}
          <h2 className="section-title"><FaBriefcase /> Hồ sơ chuyên môn</h2>
          
          <div className="form-group read-only"> {/* <-- THAY ĐỔI */}
            <label>Kinh nghiệm làm việc</label>
            <span>{staffProfile?.workExperience || 'N/A'}</span> {/* <-- THAY ĐỔI */}
          </div>

          <div className="form-group read-only"> {/* <-- THAY ĐỔI */}
            <label>Nơi làm việc cũ</label>
            <span>{staffProfile?.previousWorkplace || 'N/A'}</span> {/* <-- THAY ĐỔI */}
          </div>

          <div className="form-group-grid">
            <div className="form-group read-only"> {/* <-- THAY ĐỔI */}
              <label>Bằng cao đẳng</label>
              <span>{staffProfile?.collegeDegree || 'N/A'}</span> {/* <-- THAY ĐỔI */}
            </div>
            <div className="form-group read-only"> {/* <-- THAY ĐỔI */}
              <label>Bằng đại học</label>
              <span>{staffProfile?.universityDegree || 'N/A'}</span> {/* <-- THAY ĐỔI */}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default StaffProfilePage;