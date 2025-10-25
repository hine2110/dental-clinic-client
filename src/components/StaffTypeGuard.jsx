// src/components/StaffTypeGuard.jsx
import React from "react";
import { useAuth } from "../context/authContext"; // Cập nhật đường dẫn nếu cần
import { Navigate, Outlet } from "react-router-dom";

// Component này nhận vào một prop là 'allowedType'
// (ví dụ: "receptionist" hoặc "storeKepper")
function StaffTypeGuard({ allowedType }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Đang tải dữ liệu...</h2>
      </div>
    );
  }

  // Nếu không có user (chưa đăng nhập) hoặc user không phải staff
  if (!user || user.role !== "staff") {
    return <Navigate to="/" replace />;
  }

  // Nếu staffType của user không khớp với loại được cho phép
  if (user.staffType !== allowedType) {
    // Chuyển hướng họ về trang dashboard chung của staff
    return <Navigate to="/staff" replace />;
  }

  // Nếu mọi thứ đều ổn, hiển thị trang con (route lồng nhau)
  return <Outlet />;
}

export default StaffTypeGuard;