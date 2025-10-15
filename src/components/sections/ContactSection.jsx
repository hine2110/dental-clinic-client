import React, { useState, useEffect } from 'react';
import ContactService from '../../services/contactService';
import './ContactSection.css';

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
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setNotification({ message: "Please fill in all required fields.", type: 'error' });
      return;
    }
    
    setLoading(true);
    setNotification({ message: '', type: '' });

    try {
      const response = await ContactService.submitForm(formData);
      setNotification({ message: response.message, type: 'success' });
      setFormData({ name: '', email: '', subject: '', message: '' });
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
           {/* Phần tiêu đề và thông tin địa chỉ giữ nguyên */}
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
