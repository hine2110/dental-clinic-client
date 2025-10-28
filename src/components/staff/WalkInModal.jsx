// src/components/staff/WalkInModal.jsx (ĐÃ TỐI ƯU HOÀN TOÀN)
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import StaffService from '../../services/staffService';
import AppointmentService from '../../services/appointmentService'; // Vẫn dùng để lấy Cơ sở
import './WalkInModal.css'; // File CSS tôi đã cung cấp

// Helper (ngoài component)
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + (d.getDate());
  const year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
};

function WalkInModal({ onClose, onSuccess }) {
  // === STATE QUẢN LÝ QUY TRÌNH ===
  const [step, setStep] = useState(1); // 1: Tìm CCCD, 2: Xác nhận/Nhập mới, 3: Xếp hàng
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({}); // Lỗi validation

  // === STATE DỮ LIỆU ===
  const [idCardSearch, setIdCardSearch] = useState('');
  const [foundPatient, setFoundPatient] = useState(null); // Lưu bệnh nhân tìm thấy
  const [patientData, setPatientData] = useState({
    fullName: '',
    dateOfBirth: '',
    phone: '',
    gender: 'male',
    idCard: '',
    email: '',
  });
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  // Tải danh sách cơ sở
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await AppointmentService.getLocations();
        if (res.success) {
          setLocations(res.data);
          if (res.data.length > 0) {
            setSelectedLocation(res.data[0]._id); // Chọn mặc định
          }
        }
      } catch (err) {
        setError('Lỗi khi tải cơ sở. ' + err.message);
      }
    };
    fetchLocations();
  }, []);

  // === HÀM XỬ LÝ ===

  // Reset form
  const resetForm = () => {
    setPatientData({ fullName: '', dateOfBirth: '', phone: '', gender: 'male', idCard: '', email: '' });
    setFoundPatient(null);
    setErrors({});
    setError('');
  };

  // Bước 1: Tìm kiếm CCCD
  const handleSearch = async (e) => {
    e.preventDefault();
    if (idCardSearch.length !== 12 || !/^[0-9]+$/.test(idCardSearch)) {
      setErrors({ idCardSearch: 'CCCD phải là 12 chữ số.' });
      return;
    }
    
    setLoading(true);
    setError('');
    setErrors({});
    try {
      const res = await StaffService.findPatientByIdCard(idCardSearch);
      
      // TÌM THẤY
      setFoundPatient(res.data);
      setPatientData({
        fullName: res.data.basicInfo.fullName,
        dateOfBirth: formatDate(res.data.basicInfo.dateOfBirth),
        phone: res.data.contactInfo.phone,
        gender: res.data.basicInfo.gender,
        idCard: res.data.basicInfo.idCard.idNumber,
        email: res.data.contactInfo.email,
      });
      setStep(2); // Chuyển sang bước 2 (Xác nhận)

    } catch (err) {
      if (err.message.includes('Không tìm thấy')) {
        // KHÔNG TÌM THẤY
        resetForm();
        setPatientData(prev => ({ ...prev, idCard: idCardSearch }));
        setStep(2); // Chuyển sang bước 2 (Tạo mới)
      } else {
        setError(err.message); // Lỗi server
      }
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xử lý thay đổi form (nếu tạo mới)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Bước 2 -> 3: Nhấn "Tiếp tục"
  const handleContinue = (e) => {
    e.preventDefault();
    
    // Nếu là tạo mới, validate
    if (!foundPatient) {
      const newErrors = {};
      if (!patientData.fullName.trim()) newErrors.fullName = 'Họ tên là bắt buộc';
      if (!patientData.dateOfBirth) newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
      if (patientData.phone.length !== 10 || !/^[0-9]+$/.test(patientData.phone)) {
        newErrors.phone = 'SĐT phải là 10 chữ số.';
      }
      
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) return;
    }
    
    setStep(3); // Chuyển sang Bước 3 (Xếp hàng)
  };

  // Bước 3: Xếp hàng tự động
  const handleQueuePatient = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      setError('Vui lòng chọn một cơ sở.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const payload = {
      locationId: selectedLocation,
    };

    if (foundPatient) {
      payload.existingPatientId = foundPatient._id;
    } else {
      payload.patientData = patientData; // Gửi toàn bộ thông tin đã nhập
    }

    try {
      const res = await StaffService.queueWalkInPatient(payload);
      onSuccess(res.message); // Kích hoạt Toast (ví dụ: "Xếp hàng thành công!...")
      
    } catch (err) {
      setError(err.message || 'Lỗi khi xếp hàng.');
    } finally {
      setLoading(false);
    }
  };

  // Nút quay lại
  const handleBack = () => {
    if (step === 3) setStep(2);
    if (step === 2) {
      setStep(1);
      resetForm();
    }
  };

  // === RENDER ===
  return ReactDOM.createPortal(
    <div className="walkin-modal-overlay">
      <div className="walkin-modal">
        <div className="walkin-modal-header">
          <h2>Tạo Lịch Hẹn Vãng Lai</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>×</button>
        </div>

        {/* Thanh báo lỗi chung */}
        {error && <div className="error-message">{error}</div>}

        {/* --- BƯỚC 1: TÌM KIẾM CCCD --- */}
        {step === 1 && (
          <form onSubmit={handleSearch} className="walkin-modal-form">
            <h3 className="form-section-title">Bước 1: Tìm Bệnh Nhân</h3>
            <div className="form-group">
              <label htmlFor="idCardSearch">Nhập CCCD Bệnh nhân *</label>
              <input
                type="text"
                id="idCardSearch" name="idCardSearch"
                className={`form-control ${errors.idCardSearch ? 'error' : ''}`}
                value={idCardSearch}
                onChange={(e) => setIdCardSearch(e.target.value)}
                placeholder="12 chữ số"
                autoFocus
              />
              {errors.idCardSearch && <span className="error-text">{errors.idCardSearch}</span>}
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Hủy</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang tìm...' : 'Tìm kiếm'}
              </button>
            </div>
          </form>
        )}

        {/* --- BƯỚC 2: XÁC NHẬN / TẠO MỚI --- */}
        {step === 2 && (
          <form onSubmit={handleContinue} className="walkin-modal-form">
            <h3 className="form-section-title">
              Bước 2: {foundPatient ? 'Xác nhận Thông tin' : 'Tạo Hồ sơ mới'}
            </h3>
            
            {/* Form Thông tin Bệnh nhân */}
            <div className="form-row">
              <div className="form-group">
                <label>Họ tên *</label>
                <input type="text" name="fullName" value={patientData.fullName} onChange={handleChange}
                  disabled={!!foundPatient} className={errors.fullName ? 'error' : ''} />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>
              <div className="form-group">
                <label>Điện thoại *</label>
                <input type="tel" name="phone" value={patientData.phone} onChange={handleChange}
                  disabled={!!foundPatient} className={errors.phone ? 'error' : ''} />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Ngày sinh *</label>
                <input type="date" name="dateOfBirth" value={patientData.dateOfBirth} onChange={handleChange}
                  disabled={!!foundPatient} className={errors.dateOfBirth ? 'error' : ''} />
                {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
              </div>
              <div className="form-group">
                <label>Giới tính *</label>
                <select name="gender" value={patientData.gender} onChange={handleChange}
                  disabled={!!foundPatient} className={errors.gender ? 'error' : ''}>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CCCD *</label>
                <input type="text" name="idCard" value={patientData.idCard} disabled />
              </div>
              <div className="form-group">
                <label>Email (Nếu có)</label>
                <input type="email" name="email" value={patientData.email} onChange={handleChange}
                  disabled={!!foundPatient} />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleBack}>Quay lại</button>
              <button type="submit" className="btn-primary">Tiếp tục</button>
            </div>
          </form>
        )}

        {/* --- BƯỚC 3: XẾP HÀNG TỰ ĐỘNG --- */}
        {step === 3 && (
          <form onSubmit={handleQueuePatient} className="walkin-modal-form">
            <h3 className="form-section-title">Bước 3: Chọn Cơ sở</h3>
            
            <p>Đang xếp hàng cho bệnh nhân: <strong>{patientData.fullName}</strong></p>
            <div className="form-group">
              <label>Cơ sở Khám *</label>
              <select 
                name="locationId" 
                className="form-control"
                value={selectedLocation} 
                onChange={(e) => setSelectedLocation(e.target.value)} 
                required
              >
                <option value="" disabled>Chọn cơ sở</option>
                {locations.map(loc => (
                  <option key={loc._id} value={loc._id}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Ngày khám</label>
              <input type="text" value={new Date().toLocaleDateString('vi-VN')} disabled />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleBack} disabled={loading}>Quay lại</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Đang xếp hàng...' : 'Xếp hàng ngay'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>,
    document.getElementById('modal-root')
  );
}

export default WalkInModal;