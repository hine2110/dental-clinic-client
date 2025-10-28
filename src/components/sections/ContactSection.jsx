import React, { useState, useEffect } from 'react';
import ContactService from '../../services/contactService';
import './ContactSection.css';
import { useAuth } from '../../context/authContext';
import { getPatientProfile } from '../../services/patientService';
// Lấy API_BASE từ biến môi trường
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// (Component Notification giữ nguyên, không đổi)
const Notification = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isError = type === 'error';
  
  const icon = isError ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill';
  const backgroundColor = isError ? '#f8d7da' : '#d1e7dd';
  const color = isError ? '#58151c' : '#0f5132';
  const borderColor = isError ? '#f5c2c7' : '#badbcc';

  return (
    <div className="custom-notification" style={{ backgroundColor, color, borderColor }}>
      <i className={`bi ${icon}`} style={{ marginRight: '10px', fontSize: '1.2rem' }}></i>
      {message}
      <button className="dismiss-button" onClick={onDismiss} style={{ color }}>&times;</button>
      <div className="progress-bar" style={{ backgroundColor: color }}></div>
    </div>
  );
};
// ------------------------------------

function ContactSection() {
  // CẬP NHẬT: Thêm 'locationId' vào state
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', locationId: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
  // THÊM MỚI: State cho danh sách cơ sở
  const [locations, setLocations] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);

  const { user } = useAuth();

  // THÊM MỚI: useEffect để tải danh sách cơ sở
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true); // Bắt đầu loading

        // === SỬA LỖI Ở ĐÂY ===
        // Đường dẫn API đúng (lấy từ appointmentService.js)
        const response = await fetch(`${API_BASE}/patient/locations`); 
        // === KẾT THÚC SỬA LỖI ===

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setLocations(data.data);
        } else {
          // Ném lỗi nếu response.ok là false hoặc data.success là false
          throw new Error(data.message || 'Failed to fetch locations');
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        // Hiển thị lỗi ra cho người dùng (nếu bạn muốn)
        // setNotification({ message: err.message, type: 'error' });
      } finally {
        setLocationsLoading(false); // Dừng loading
      }
    };
    fetchLocations();
  }, []); // Chạy 1 lần khi component mount

  useEffect(() => {
    const fetchProfileAndPopulateForm = async () => {
      if (user) {
        // Nếu người dùng đăng nhập, lấy profile
        try {
          const profileData = await getPatientProfile();
          if (profileData && profileData.success && profileData.data) {
            const profile = profileData.data;
            setFormData(prev => ({
              ...prev,
              name: profile.basicInfo?.fullName || '',
              email: profile.contactInfo?.email || user.email || ''
            }));
          } else {
            // Nếu không có profile, dùng email từ 'user'
             setFormData(prev => ({
              ...prev,
              name: '', // Không có tên
              email: user.email || ''
            }));
          }
        } catch (err) {
          console.error('Error fetching profile for contact form:', err);
          // Nếu lỗi, vẫn điền email từ 'user'
           setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } else {
        // Nếu người dùng đăng xuất, xóa trường name và email
        setFormData(prev => ({
          ...prev,
          name: '',
          email: ''
        }));
      }
    };

    fetchProfileAndPopulateForm();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // CẬP NHẬT: Kiểm tra cả 'locationId'
    if (!formData.name || !formData.email || !formData.subject || !formData.message || !formData.locationId) {
      setNotification({ message: "Please fill in all required fields, including location.", type: 'error' });
      return;
    }
    
    setLoading(true);
    setNotification({ message: '', type: '' });

    try {
      // formData đã bao gồm locationId, gửi đi như bình thường
      const response = await ContactService.submitForm(formData); 
      setNotification({ message: response.message, type: 'success' });
      
      // CẬP NHẬT: Reset cả 'locationId'
      setFormData({ 
        name: user ? formData.name : '', 
        email: user ? formData.email : '', 
        subject: '', 
        message: '', 
        locationId: '' 
      });
      
      // Chỉnh sửa logic reset tốt hơn:
      setFormData(prev => ({
        ...prev, // Giữ lại name và email đã được auto-fill
        subject: '',
        message: '',
        locationId: ''
      }));
    } catch (err) {
      setNotification({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {notification.message && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onDismiss={() => setNotification({ message: '', type: '' })}
        />
      )}

      <section id="contact" className="contact section">
        <div className="container">
           {/* (Phần thông tin địa chỉ giữ nguyên) */}
           <div className="row">
             <div className="col-12">
               <div className="section-title" data-aos="fade-up" data-aos-delay="100">
                 <h2>Contact</h2>
                 <p>If you have any questions or would like to book an appointment, our team is here to help you. Contact us today and let us take care of your smile.</p>
               </div>
             </div>
           </div>
           <div className="row gy-4">
             <div className="col-lg-6">
                <div className="row gy-4">
                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="200">
                    <div className="info-box">
                      <i className="bi bi-geo-alt"></i>
                      <h3>Address</h3>
                      <p>K47/32 Hoang Van Thai<br />Da Nang</p>
                    </div>
                  </div>
                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="300">
                    <div className="info-box">
                      <i className="bi bi-telephone"></i>
                      <h3>Call Us</h3>
                      <p>+84 935 655 266<br />+84 888 708 368</p>
                    </div>
                  </div>
                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="400">
                    <div className="info-box">
                      <i className="bi bi-envelope"></i>
                      <h3>Email Us</h3>
                      <p>huy26102101@gmail.com<br />huyntgde170695@fpt.edu.vn</p>
                    </div>
                  </div>
                  <div className="col-md-6" data-aos="fade-up" data-aos-delay="500">
                    <div className="info-box">
                      <i className="bi bi-clock"></i>
                      <h3>Open Hours</h3>
                      <p>Monday - Friday<br />9:00AM - 05:00PM</p>
                    </div>
                  </div>
                </div>
             </div>
          
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <form onSubmit={handleSubmit} className="php-email-form">
                <div className="row gy-4">
                  <div className="col-md-6">
                    <input type="text" name="name" className="form-control" placeholder="Your Name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="col-md-6">
                    <input type="email" className="form-control" name="email" placeholder="Your Email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  
                  {/* === THÊM MỚI: Dropdown chọn cơ sở === */}
                  <div className="col-md-12">
                    <select 
                      name="locationId" 
                      className="form-control" 
                      value={formData.locationId} 
                      onChange={handleInputChange} 
                      required
                    >
                      <option value="">-- Select a Clinic Location --</option>
                      {locationsLoading ? (
                        <option value="" disabled>Loading locations...</option>
                      ) : (
                        locations.map(loc => (
                          <option key={loc._id} value={loc._id}>{loc.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                  {/* === KẾT THÚC PHẦN MỚI === */}

                  <div className="col-md-12">
                    <select name="subject" className="form-control" value={formData.subject} onChange={handleInputChange} required>
                      <option value="">-- Select a Subject --</option>
                      <option value="Service Consultation">Service Consultation</option>
                      <option value="Appointment Support">Appointment Support</option>
                      <option value="Feedback/Complaints">Feedback/Complaints</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-12">
                    <textarea className="form-control" name="message" rows="6" placeholder="Message" value={formData.message} onChange={handleInputChange} required></textarea>
                  </div>
                  <div className="col-md-12 text-center">
                    <button type="submit" disabled={loading}>
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactSection;