import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { message } from "antd";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const user = urlParams.get("user");
    const error = urlParams.get("error");

    if (error) {
      // Handle error
      message.error("Google login failed. Please try again.");
      setTimeout(() => {
        navigate("/");
      }, 2000);
      return;
    }

    if (token && user) {
      try {
        // Parse user data
        const userData = JSON.parse(decodeURIComponent(user));

        // Save to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update AuthContext
        setUser(userData);

        // Show success message

        // Redirect by role
        const role = userData?.role;
        const target = role === 'doctor' ? '/doctor' : role === 'admin' ? '/admin' : '/';
        setTimeout(() => {
          navigate(target);
        }, 1500);
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        message.error("Error processing login data.");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } else {
      // No token or user data
      message.warning("No login data found.");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  }, [navigate, setUser]);

  return (
    <div style={{ 
      textAlign: "center", 
      padding: "50px",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white"
    }}>
      <div style={{
        background: "white",
        color: "#333",
        padding: "40px",
        borderRadius: "20px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        maxWidth: "400px",
        width: "90%"
      }}>
        <div style={{
          fontSize: "48px",
          marginBottom: "20px"
        }}>
          🔄
        </div>
        <h2 style={{ 
          marginBottom: "20px",
          color: "#1977cc"
        }}>
          Processing login...
        </h2>
        <p style={{ 
          marginBottom: "30px",
          color: "#666"
        }}>
          Please wait a moment.
        </p>
        <div style={{
          width: "100%",
          height: "4px",
          background: "#f0f0f0",
          borderRadius: "2px",
          overflow: "hidden"
        }}>
          <div style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, #1977cc, #4a9eff)",
            borderRadius: "2px",
            animation: "loading 2s ease-in-out infinite"
          }}></div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AuthSuccess;
