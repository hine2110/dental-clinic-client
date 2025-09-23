import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext.jsx';
import { logout as logoutAPI } from '../../services/patientService';

function AuthButtons({ onOpenLogin, onOpenRegister }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?.role === 'patient') {
      navigate('/profile');
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await logoutAPI(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and update UI
      logout();
      window.location.reload(); // Refresh page to update UI
    }
  };

  if (user) {
    // User is logged in - show profile and logout
    return (
      <div className="auth-buttons d-none d-md-flex align-items-center" style={{ gap: '20px', marginLeft: 'auto' }}>
        <div 
          className="user-profile d-flex align-items-center" 
          style={{ gap: '12px', cursor: 'pointer' }}
          onClick={handleProfileClick}
          title="Xem profile"
        >
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            backgroundColor: '#1977cc',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease'
          }}>
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
          </div>
          <span style={{ 
            fontSize: '14px', 
            color: '#333',
            fontWeight: '500',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {user.fullName || user.email}
          </span>
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #dc3545',
            backgroundColor: 'transparent',
            color: '#dc3545',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dc3545';
            e.target.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#dc3545';
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  // User is not logged in - show login and register
  return (
    <div className="auth-buttons d-none d-md-flex align-items-center" style={{ gap: '12px', marginLeft: 'auto' }}>
      <button 
        onClick={onOpenLogin}
        style={{ 
          padding: '8px 16px', 
          fontSize: '13px',
          borderRadius: '6px',
          border: '1px solid #1977cc',
          backgroundColor: 'transparent',
          color: '#1977cc',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#1977cc';
          e.target.style.color = '#fff';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#1977cc';
        }}
      >
        Login
      </button>
      <button 
        onClick={onOpenRegister}
        style={{ 
          padding: '8px 16px', 
          fontSize: '13px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: '#1977cc',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#1666b3';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#1977cc';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        Register
      </button>
    </div>
  );
}

export default AuthButtons;
