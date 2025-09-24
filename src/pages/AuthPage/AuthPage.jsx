// src/pages/AuthPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, register, sendVerificationCode } from "../../services/patientService";
import { useAuth } from "../../context/authContext";
import { message } from "antd";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [isActive, setIsActive] = useState(false);

  // Set initial state based on route
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [location.pathname]);

  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

 // Login form data
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  // Register form data
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    dateOfBirth: "",
    address: {
      street: "",
      city: ""
    },
    code: ""
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(loginData);
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      setUser(res.data.data.user);
      message.success("Login successful!");
      
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
          navigate("/admin");
        } else if (res.data.data.user.role === "receptionist") {
          navigate("/receptionist/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await register({
        ...registerData,
        dateOfBirth: registerData.dateOfBirth ? new Date(registerData.dateOfBirth).toISOString().split("T")[0] : undefined
      });
      message.success(res.data.message || "Registration successful!");
      navigate("/login");
    } catch (err) {
      message.error(err.response?.data?.message || "Registration failed");
    }
  };

  const handleSendCode = async () => {
    if (!registerData.email) {
      message.warning("Please enter email first!");
      return;
    }

    try {
      setLoading(true);
      await sendVerificationCode(registerData.email);
      setCodeSent(true);
      message.success("Verification code has been sent to your email!");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setRegisterData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setRegisterData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleLoginInputChange = (field, value) => {
    setLoginData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${isActive ? "active" : ""}`} id="container">
        {/* Register Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
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
            <span>or use email to register</span>

            <div className="form-row">
              <input
                type="text"
                placeholder="First Name"
                value={registerData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={registerData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={registerData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={registerData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />

            <input
              type="tel"
              placeholder="Phone Number"
              value={registerData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              required
            />

            <input
              type="date"
              placeholder="Date of Birth"
              value={registerData.dateOfBirth}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            />

            <div className="form-row">
              <input
                type="text"
                placeholder="Address"
                value={registerData.address.street}
                onChange={(e) => handleInputChange("address.street", e.target.value)}
              />
              <input
                type="text"
                placeholder="City"
                value={registerData.address.city}
                onChange={(e) => handleInputChange("address.city", e.target.value)}
              />
            </div>

            <div className="form-row">
              <input
                type="text"
                placeholder="Verification Code"
                value={registerData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                required
                disabled={!codeSent}
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={!registerData.email || codeSent || loading}

                style={{ 
                  padding: "10px 15px", 
                  fontSize: "12px",
                  whiteSpace: "nowrap",
                  minWidth: "120px"
                }}
              >
                {loading ? "Sending..." : codeSent ? "Sent" : "Send Code"}
              </button>
            </div>

            <button type="submit">Register</button>
          </form>
        </div>

        {/* Login Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
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
            <span>or use email and password</span>

            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => handleLoginInputChange("email", e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => handleLoginInputChange("password", e.target.value)}
            />

            <a href="/forgot-password">Forgot Password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all features of our dental clinic</p>
              <button className="hidden" id="login" onClick={() => {
                setIsActive(false);
                navigate("/login");
              }}>
                Sign In
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello!</h1>
              <p>Register with your personal details to use all features of our dental clinic</p>
              <button className="hidden" id="register" onClick={() => {
                setIsActive(true);
                navigate("/register");
              }}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
