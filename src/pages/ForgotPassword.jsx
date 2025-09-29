import React, { useState, useEffect } from "react";
import { message } from "antd";
import forgotBg from "../assets/forgot-bg.jpg";
import emailLogo from "../assets/email-logo.jpg";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function ForgotPasswordPage() {
  const [mode, setMode] = useState("request"); // request | reset
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [token, setToken] = useState("");

  // Detect token from URL: /forgot-password?token=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setMode("reset");
      setToken(t);
      // validate token with backend
      fetch(`${API_BASE_URL}/auth/check-reset-token/${t}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success) {
            setTokenValid(true);
          } else {
            setTokenValid(false);
            message.error(res.message || "Invalid or expired reset link");
          }
        })
        .catch(() => {
          setTokenValid(false);
          message.error("Failed to verify reset link");
        });
    }
  }, []);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      message.warning("Please enter your registered email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        message.success("Reset link has been sent to your email");
      } else {
        throw new Error(data.message || "Failed to send reset email");
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      message.warning("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      message.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        message.success("Password reset successfully. You can now sign in.");
        window.location.href = "/";
      } else {
        throw new Error(data.message || "Failed to reset password");
      }
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "reset") {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundImage: `url(${forgotBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}>
        <div style={{ width: 420, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", padding: 24, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.6)" }}>
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <img src={emailLogo} alt="Email" style={{ width: 64, height: 64, objectFit: "contain" }} />
          </div>
          <h2 style={{ textAlign: "center" ,marginBottom: 16, color: "#1977cc" }}>Create New Password</h2>
          {!tokenValid ? (
            <p style={{ color: "#dc3545" }}>Invalid or expired reset link.</p>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", marginBottom: 6 }}>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} required />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 6 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 8,
                    border: confirmPassword && newPassword !== confirmPassword ? "1px solid #dc3545" : "1px solid #ddd"
                  }}
                  required
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <div style={{ color: "#dc3545", fontSize: 12, marginTop: 6 }}>
                    Passwords do not match
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || (confirmPassword && newPassword !== confirmPassword)}
                style={{ width: "100%", padding: 12, borderRadius: 8, background: "#1977cc", color: "#fff", border: 0, cursor: "pointer", opacity: loading || (confirmPassword && newPassword !== confirmPassword) ? 0.7 : 1 }}
              >
                {loading ? "Saving..." : "Reset Password"}
              </button>
              <div style={{ marginTop: 10, textAlign: "center" }}>
                <a href="/" style={{ color: "#1977cc", textDecoration: "none", fontSize: 13 }}>Back to login</a>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      backgroundImage: `url(${forgotBg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      <div style={{ width: 420, background: "rgba(255,255,255,0.7)", backdropFilter: "blur(6px)", padding: 24, borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.6)" }}>
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <img src={emailLogo} alt="Email" style={{ width: 64, height: 64, objectFit: "contain" }} />
        </div>
        <h2 style={{ marginBottom: 16, color: "#1977cc", textAlign: "center" }}>Forgot Password</h2>
        <p style={{ marginBottom: 16, color: "#555" }}>Enter your registered email. We will send you a link to create a new password.</p>
        <form onSubmit={handleSendEmail}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} required />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, borderRadius: 8, background: "#1977cc", color: "#fff", border: 0, cursor: "pointer" }}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <div style={{ marginTop: 10, textAlign: "center" }}>
            <a href="/" style={{ color: "#1977cc", textDecoration: "none", fontSize: 13 }}>Back to login</a>
          </div>
        </form>
      </div>
    </div>
  );
}
