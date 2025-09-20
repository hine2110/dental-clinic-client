// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendVerificationCode, resetPassword } from '../../services/patientService';
import { message } from 'antd';
import './ForgotPage.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Send code form data
  const [sendCodeData, setSendCodeData] = useState({
    email: ''
  });

  // Reset password form data
  const [resetData, setResetData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!sendCodeData.email) {
      message.warning('Vui lòng nhập email!');
      return;
    }

    try {
      setLoading(true);
      await sendVerificationCode(sendCodeData.email);
      setEmail(sendCodeData.email);
      setResetData(prev => ({ ...prev, email: sendCodeData.email }));
      setCodeSent(true);
      setIsActive(true);
      message.success('Mã xác thực đã được gửi đến email của bạn!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Gửi mã xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        email: resetData.email,
        code: resetData.code,
        newPassword: resetData.newPassword
      });
      message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      setSuccess(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSendCodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetInputChange = (field, value) => {
    setResetData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="container success-container">
          <div style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: '80px', color: '#52c41a', marginBottom: '20px' }}>
              ✓
            </div>
            <h1 style={{ color: '#52c41a', marginBottom: '16px', fontSize: '32px' }}>
              Thành công!
            </h1>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
              Mật khẩu của bạn đã được đặt lại thành công.
            </p>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: 'linear-gradient(to right, #5c6bc0, #512da8)',
                color: '#fff',
                border: 'none',
                padding: '12px 30px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className={`container ${isActive ? 'active' : ''}`} id="container">
        {/* Send Code Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleSendCode}>
            <h1>Gửi mã xác thực</h1>
            <span>Nhập email để nhận mã xác thực</span>
            
            <input
              type="email"
              placeholder="Email đã đăng ký"
              value={sendCodeData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            
            <button type="submit" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </button>
          </form>
        </div>

        {/* Reset Password Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleResetPassword}>
            <h1>Đặt lại mật khẩu</h1>
            <span>Nhập mã xác thực và mật khẩu mới</span>
            
            <input
              type="email"
              placeholder="Email"
              value={resetData.email}
              disabled
              style={{ backgroundColor: '#f5f5f5', color: '#999' }}
            />
            
            <input
              type="text"
              placeholder="Mã xác thực"
              value={resetData.code}
              onChange={(e) => handleResetInputChange('code', e.target.value)}
              required
              disabled={!codeSent}
            />
            
            <input
              type="password"
              placeholder="Mật khẩu mới"
              value={resetData.newPassword}
              onChange={(e) => handleResetInputChange('newPassword', e.target.value)}
              required
            />
            
            <input
              type="password"
              placeholder="Xác nhận mật khẩu mới"
              value={resetData.confirmPassword}
              onChange={(e) => handleResetInputChange('confirmPassword', e.target.value)}
              required
            />
            
            <button type="submit" disabled={loading || !codeSent}>
              {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Quên mật khẩu?</h1>
              <p>Nhập email để nhận mã xác thực và đặt lại mật khẩu mới</p>
              <button className="hidden" id="send-code" onClick={() => setIsActive(false)}>
                Gửi mã
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Đặt lại mật khẩu</h1>
              <p>Nhập mã xác thực và mật khẩu mới để hoàn tất quá trình</p>
              <button className="hidden" id="reset-password" onClick={() => setIsActive(true)}>
                Đặt lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
