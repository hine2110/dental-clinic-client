// src/pages/AuthPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register, sendVerificationCode } from '../../services/patientService';
import { useAuth } from '../../context/authContext';
import { message } from 'antd';
import './AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [isActive, setIsActive] = useState(false);

  // Set initial state based on route
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [location.pathname]);
  
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form data
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form data
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: ''
    },
    code: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(loginData);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      setUser(res.data.data.user);
      message.success('Đăng nhập thành công!');
      
      // Redirect based on user role
      const redirect = localStorage.getItem("redirectAfterLogin");
      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirect);
      } else {
        if (res.data.data.user.role === "patient") {
          navigate("/patient/dashboard");
        } else if (res.data.data.user.role === "doctor") {
          navigate("/doctor/dashboard");
        } else if (res.data.data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else if (res.data.data.user.role === "receptionist") {
          navigate("/receptionist/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await register({
        ...registerData,
        dateOfBirth: registerData.dateOfBirth ? new Date(registerData.dateOfBirth).toISOString().split('T')[0] : undefined
      });
      message.success(res.data.message || 'Đăng ký thành công!');
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const handleSendCode = async () => {
    if (!registerData.email) {
      message.warning('Vui lòng nhập email trước!');
      return;
    }

    try {
      setLoading(true);
      await sendVerificationCode(registerData.email);
      setCodeSent(true);
      message.success('Mã xác thực đã được gửi đến email của bạn!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Gửi mã xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRegisterData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setRegisterData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleLoginInputChange = (field, value) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${isActive ? 'active' : ''}`} id="container">
        {/* Register Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h1>Tạo tài khoản</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>hoặc sử dụng email để đăng ký</span>
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Họ"
                value={registerData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Tên"
                value={registerData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
            
            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
            
            <input
              type="password"
              placeholder="Mật khẩu"
              value={registerData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              required
            />
            
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={registerData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
            
            <input
              type="date"
              placeholder="Ngày sinh"
              value={registerData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            />
            
            <div className="form-row">
              <input
                type="text"
                placeholder="Địa chỉ"
                value={registerData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
              />
              <input
                type="text"
                placeholder="Thành phố"
                value={registerData.address.city}
                onChange={(e) => handleInputChange('address.city', e.target.value)}
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Mã xác thực"
                value={registerData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                required
                disabled={!codeSent}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={!registerData.email || codeSent || loading}
                style={{ 
                  padding: '10px 15px', 
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  minWidth: '120px'
                }}
              >
                {loading ? 'Đang gửi...' : codeSent ? 'Đã gửi' : 'Gửi mã'}
              </button>
            </div>
            
            <button type="submit">Đăng ký</button>
          </form>
        </div>

        {/* Login Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Đăng nhập</h1>
            <div className="social-icons">
              <a href="#" className="icon">
                <i className="fa-brands fa-google-plus-g"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="icon">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
            <span>hoặc sử dụng email và mật khẩu</span>
            
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => handleLoginInputChange('email', e.target.value)}
              required
            />
            
            <input
              type="password"
              placeholder="Mật khẩu"
              value={loginData.password}
              onChange={(e) => handleLoginInputChange('password', e.target.value)}
              required
            />
            
            <a href="/forgot-password">Quên mật khẩu?</a>
            <button type="submit">Đăng nhập</button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Chào mừng trở lại!</h1>
              <p>Nhập thông tin cá nhân để sử dụng tất cả tính năng của trang web</p>
              <button className="hidden" id="login" onClick={() => {
                setIsActive(false);
                navigate('/login');
              }}>
                Đăng nhập
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Xin chào!</h1>
              <p>Đăng ký với thông tin cá nhân để sử dụng tất cả tính năng của trang web</p>
              <button className="hidden" id="register" onClick={() => {
                setIsActive(true);
                navigate('/register');
              }}>
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
