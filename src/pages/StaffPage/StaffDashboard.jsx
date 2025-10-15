import React, { useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { useNavigate, NavLink } from "react-router-dom"; // Import NavLink
import "./staff.css";

function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "staff") {
      navigate("/");
    }

    document.body.classList.add('dashboard-active');

    return () => {
      document.body.classList.remove('dashboard-active');
    };
  }, [user, navigate]);

  if (!user || user.role !== "staff") return null;


  return (
    <div className="staff-layout">
      <div className="background-glow"></div>

      <header className="staff-header">
        <div className="header-main">
          <div className="header-brand">
            <h3>Beauty Smile</h3>
          </div>
          <div className="user-profile">
            <i className="fas fa-envelope fa-lg"></i>
            <i className="fas fa-bell fa-lg"></i>
            <span>Xin chào, Staff!</span>
            <img src="https://via.placeholder.com/40" alt="User Avatar" />
          </div>
        </div>
      </header>

      <div className="layout-body">
        <aside className="staff-sidebar">
          <ul className="staff-sidebar-nav">
            <li>
              <NavLink to="/staff/work-schedule">
                <i className="fas fa-tachometer-alt nav-icon"></i>
                Lịch làm việc
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/appointments">
                <i className="fas fa-table nav-icon"></i>
                Lịch hẹn
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/patients">
                <i className="fas fa-user-injured nav-icon"></i>
                Bệnh nhân
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/invoices">
                <i className="fas fa-file-invoice nav-icon"></i>
                Hóa đơn
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/inventory">
                <i className="fas fa-file-invoice nav-icon"></i>
                Quản lý kho thuốc
              </NavLink>
            </li>
            <li>
              <NavLink to="/staff/equipment">
                <i className="fas fa-file-invoice nav-icon"></i>
                Quản lý thiết bị
              </NavLink>
            </li>
          </ul>
        </aside>

        
      </div>
    </div>
  );
}

export default StaffDashboard;