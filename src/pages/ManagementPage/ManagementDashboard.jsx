import React from "react";
import "./management.css";

function ManagementDashboard() {
  return (
    <div className="content-card">
      <h2>Management Dashboard</h2>
      <p>Chào mừng đến với trang quản lý!</p>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Tổng quan</h3>
          <p>Thống kê tổng quan hệ thống</p>
        </div>
        <div className="stat-card">
          <h3>Tài chính</h3>
          <p>Quản lý tài chính và doanh thu</p>
        </div>
        <div className="stat-card">
          <h3>Nhân viên</h3>
          <p>Quản lý nhân viên và lịch làm việc</p>
        </div>
        <div className="stat-card">
          <h3>Báo cáo</h3>
          <p>Xem và tạo báo cáo</p>
        </div>
      </div>
    </div>
  );
}

export default ManagementDashboard;
