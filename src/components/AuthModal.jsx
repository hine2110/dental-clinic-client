import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { login, register, sendVerificationCode } from "../services/patientService";
import { useAuth } from "../context/authContext";
import { message } from "antd";
import "./AuthModal.css";

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const modalRef = useRef();
  const [isActive, setIsActive] = useState(initialMode === "register");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsActive(initialMode === "register");
      setCodeSent(false);
      setLoading(false);
      setCodeError("");
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [loginError, setLoginError] = useState("");

  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
      onClose();
      // Redirect based on user role
      const role = res.data.data.user.role;
      if (role === "doctor") {
        navigate("/doctor");
      } else if (role === "admin") {
        navigate("/admin");
      } else if (role === "staff") {
        navigate("/staff");
      } else if (role === "patient") {
        navigate("/");
      } else if (role === "receptionist") {
        navigate("/receptionist/dashboard");
      } else {
        navigate("/");
      }
      setLoginData({ email: "", password: "" });
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || "Login failed";
      if (status === 401 || /invalid/i.test(msg)) {
        setLoginError("Invalid email or password");
        message.error("Invalid email or password");
      } else {
        message.error(msg);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setCodeError("");
    if (registerData.password !== registerData.confirmPassword) {
      message.error("Passwords do not match");
      return;
    }
    try {
      const res = await register({
        firstName: registerData.firstName,
        lastName: registerData.lastName,
        email: registerData.email,
        password: registerData.password,
        code: registerData.code
      });
      message.success(res.data.message || "Registration successful!");
      setIsActive(false);
      setRegisterData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        code: ""
      });
      setCodeSent(false);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data || {};
      const msg = (data.message || err.message || "Registration failed").toString();
      const errorTexts = [];
      if (Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          if (typeof e === "string") errorTexts.push(e);
          else if (e?.message) errorTexts.push(String(e.message));
        });
      }
      if (data.error) errorTexts.push(String(data.error));
      errorTexts.push(msg);
      const combined = errorTexts.join(" | ").toLowerCase();
      const looksLikeCodeError =
        status === 400 && (
          combined.includes("code") ||
          combined.includes("verification") ||
          combined.includes("otp") ||
          combined.includes("invalid") ||
          combined.includes("not match") ||
          combined.includes("incorrect")
        );
      if (looksLikeCodeError) {
        setCodeError("Verification code is invalid");
      }
      message.error(msg);
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
      message.success("Verification code sent to your email!");
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "code") {
      if (codeError) setCodeError("");
    }
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setRegisterData((prev) => ({
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
    if (loginError) setLoginError("");
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_BASE_URL}/auth/google`;
  };

  const isConfirmMismatch = Boolean(
    registerData.confirmPassword && registerData.password !== registerData.confirmPassword
  );
  const isRegisterDisabled =
    !registerData.firstName.trim() ||
    !registerData.lastName.trim() ||
    !registerData.email.trim() ||
    !registerData.password ||
    !registerData.confirmPassword ||
    isConfirmMismatch;

  if (!isOpen) return null;

  return createPortal(
    <div className="auth-modal-overlay">
      <div
        className={`auth-modal-container ${isActive ? "active" : ""}`}
        ref={modalRef}
      >
        <button className="auth-modal-close-btn" onClick={onClose}>
          &times;
        </button>
        {/* Register Form */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <h1>Create Account</h1>
            <div className="social-icons">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="icon google-btn"
                style={{
                  cursor: "pointer",
                  border: "2px solid #4285f4",
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  marginRight: "8px",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c .87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
            </div>
            <span>or use email to register</span>

            <div className="form-row">
              <input type="text" placeholder="First Name" value={registerData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} required />
              <input type="text" placeholder="Last Name" value={registerData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} required />
            </div>

            <input type="email" placeholder="Email" value={registerData.email} onChange={(e) => handleInputChange("email", e.target.value)} required />

            <input type="password" placeholder="Password" value={registerData.password} onChange={(e) => handleInputChange("password", e.target.value)} required />
            
            <input type="password" placeholder="Confirm Password" value={registerData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} required style={isConfirmMismatch ? { borderColor: "#dc3545" } : undefined} />
            {isConfirmMismatch && (
              <div style={{ color: "#dc3545", fontSize: 12, marginTop: 6 }}>Passwords do not match</div>
            )}

            <div className="form-row">
              <input
                type="text"
                placeholder="Verification Code"
                value={registerData.code}
                onChange={(e) => handleInputChange("code", e.target.value)}
                required
                disabled={!codeSent}
                style={codeError ? { borderColor: "#dc3545" } : undefined}
              />
              <button type="button" onClick={handleSendCode} disabled={!registerData.email || codeSent || loading} style={{ padding: "10px 15px", fontSize: "12px", whiteSpace: "nowrap", minWidth: "120px" }}>
                {loading ? "Sending..." : codeSent ? "Sent" : "Send Code"}
              </button>
            </div>
            {codeError && (
              <div style={{ color: "#dc3545", fontSize: 12, marginTop: -6, marginBottom: 10 }}>{codeError}</div>
            )}

            <button type="submit" disabled={isRegisterDisabled}>Register</button>
          </form>
        </div>

        {/* Login Form */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <h1>Sign In</h1>
            <div className="social-icons">
              <button type="button" onClick={handleGoogleLogin} className="icon google-btn" style={{ cursor: "pointer", border: "2px solid #4285f4", background: "#fff", borderRadius: "8px", padding: "8px", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", marginRight: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c .87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
            </div>
            <span>or use email and password</span>

            <input type="email" placeholder="Email" value={loginData.email} onChange={(e) => handleLoginInputChange("email", e.target.value)} required />
            <input type="password" placeholder="Password" value={loginData.password} onChange={(e) => handleLoginInputChange("password", e.target.value)} />
            {loginError && (
              <div style={{ color: "#dc3545", fontSize: 12, marginTop: 6 }}>{loginError}</div>
            )}

            <a href="/forgot-password">Forgot Password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Welcome Back!</h1>
              <p>Enter your personal details to use all features of our dental clinic</p>
              <button className="hidden" id="login" onClick={() => setIsActive(false)}>Sign In</button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Hello!</h1>
              <p>Register with your personal details to use all features of our dental clinic</p>
              <button className="hidden" id="register" onClick={() => setIsActive(true)}>Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
