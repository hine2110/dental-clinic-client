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
      message.warning('Please enter email!');
      return;
    }

    try {
      setLoading(true);
      await sendVerificationCode(sendCodeData.email);
      setEmail(sendCodeData.email);
      setResetData(prev => ({ ...prev, email: sendCodeData.email }));
      setCodeSent(true);
      setIsActive(true);
      message.success('Verification code has been sent to your email!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmPassword) {
      message.error('Confirm password does not match!');
      return;
    }

    try {
      setLoading(true);
      await resetPassword({
        email: resetData.email,
        code: resetData.code,
        newPassword: resetData.newPassword
      });
      message.success('Password reset successful! Please login again.');
      setSuccess(true);
    } catch (err) {
      message.error(err.response?.data?.message || 'Password reset failed');
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
              Success!
            </h1>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
              Your password has been reset successfully.
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
              Login Now
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
            <h1>Send Verification Code</h1>
            <span>Enter email to receive verification code</span>
            
            <input
              type="email"
              placeholder="Registered email"
              value={sendCodeData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            
            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        </div>

        {/* Reset Password Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleResetPassword}>
            <h1>Reset Password</h1>
            <span>Enter verification code and new password</span>
            
            <input
              type="email"
              placeholder="Email"
              value={resetData.email}
              disabled
              style={{ backgroundColor: '#f5f5f5', color: '#999' }}
            />
            
            <input
              type="text"
              placeholder="Verification Code"
              value={resetData.code}
              onChange={(e) => handleResetInputChange('code', e.target.value)}
              required
              disabled={!codeSent}
            />
            
            <input
              type="password"
              placeholder="New Password"
              value={resetData.newPassword}
              onChange={(e) => handleResetInputChange('newPassword', e.target.value)}
              required
            />
            
            <input
              type="password"
              placeholder="Confirm New Password"
              value={resetData.confirmPassword}
              onChange={(e) => handleResetInputChange('confirmPassword', e.target.value)}
              required
            />
            
            <button type="submit" disabled={loading || !codeSent}>
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Forgot Password?</h1>
              <p>Enter email to receive verification code and reset new password</p>
              <button className="hidden" id="send-code" onClick={() => setIsActive(false)}>
                Send Code
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Reset Password</h1>
              <p>Enter verification code and new password to complete the process</p>
              <button className="hidden" id="reset-password" onClick={() => setIsActive(true)}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
