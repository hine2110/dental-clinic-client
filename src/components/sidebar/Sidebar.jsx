// src/components/Sidebar.jsx

import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [activeLocations, setActiveLocations] = useState([]); // Đổi tên để rõ ràng hơn

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/management/locations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // ✅ SỬA LỖI QUAN TRỌNG: Chỉ lấy những cơ sở đang hoạt động
          const active = (data.data || []).filter(location => location.isActive);
          setActiveLocations(active);
        }
      } catch (error) {
        console.error("Failed to fetch locations for sidebar:", error);
      }
    };

    if (user?.role === 'management') {
      fetchLocations();
    }
  }, [user?.role]); // Phụ thuộc vào user, sẽ fetch lại nếu user thay đổi

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderMenuItems = () => {
    if (user?.role !== 'management') return null;

    // Lặp qua danh sách các cơ sở ĐÃ ĐƯỢC LỌC
    const locationItems = activeLocations.map(location => (
      <li key={location._id} className="menu-item">
        <div className="menu-link dropdown-toggle" onClick={() => toggleDropdown(location._id)}>
          <i className="fas fa-hospital menu-icon"></i>
          <span className="menu-label">{location.name}</span>
          <i className={`fas fa-chevron-${openDropdowns[location._id] ? 'up' : 'down'} dropdown-arrow`}></i>
        </div>
        {openDropdowns[location._id] && (
          <ul className="submenu">
            {/* Submenu cho Lịch Bác sĩ */}
            <li className="submenu-item">
              <div className="submenu-link dropdown-toggle" onClick={() => toggleDropdown(`${location._id}-doctor`)}>
                <i className="fas fa-user-md submenu-icon"></i><span>Lịch Bác sĩ</span>
                <i className={`fas fa-chevron-${openDropdowns[`${location._id}-doctor`] ? 'up' : 'down'} dropdown-arrow`}></i>
              </div>
              {openDropdowns[`${location._id}-doctor`] && (
                <ul className="submenu">
                  <li><NavLink to={`/management/location/${location._id}/doctor/schedule/fulltime`} className="submenu-link">Full-time</NavLink></li>
                  <li><NavLink to={`/management/location/${location._id}/doctor/schedule/parttime`} className="submenu-link">Part-time</NavLink></li>
                </ul>
              )}
            </li>
            {/* Submenu cho Lịch Nhân viên */}
            <li className="submenu-item">
               <div className="submenu-link dropdown-toggle" onClick={() => toggleDropdown(`${location._id}-staff`)}>
                <i className="fas fa-users submenu-icon"></i><span>Lịch Nhân viên</span>
                <i className={`fas fa-chevron-${openDropdowns[`${location._id}-staff`] ? 'up' : 'down'} dropdown-arrow`}></i>
              </div>
              {openDropdowns[`${location._id}-staff`] && (
                 <ul className="submenu">
                  <li><NavLink to={`/management/location/${location._id}/staff/schedule/fulltime`} className="submenu-link">Full-time</NavLink></li>
                  <li><NavLink to={`/management/location/${location._id}/staff/schedule/parttime`} className="submenu-link">Part-time</NavLink></li>
                </ul>
              )}
            </li>
          </ul>
        )}
      </li>
    ));

    return (
      <>
        {/* === PHẦN CÁC LINK TĨNH === */}
        {/* <li className="menu-item">
          <NavLink to="/management" end className="menu-link">
            <i className="fas fa-tachometer-alt menu-icon"></i>
            <span className="menu-label">Tổng quan</span>
          </NavLink>
        </li> */}

        {/* === ĐÂY LÀ LINK BẠN CẦN THÊM === */}
        <li className="menu-item">
          <NavLink to="/management/information" className="menu-link">
            <i className="fas fa-users-cog menu-icon"></i>
            <span className="menu-label">Thông tin Nhân sự</span>
          </NavLink>
        </li>
        
        <li className="menu-item">
          <NavLink to="/management/locations" className="menu-link">
            <i className="fas fa-plus-circle menu-icon"></i>
            <span className="menu-label">Quản lý Cơ sở</span>
          </NavLink>
        </li>

        <li className="menu-item">
          <NavLink to="/management/revenue" className="menu-link">
            {/* Bạn có thể chọn icon khác nếu muốn */}
            <i className="fas fa-chart-line menu-icon"></i> 
            <span className="menu-label">Thống kê Doanh thu</span>
          </NavLink>
        </li>

        <li className="menu-item">
          <NavLink to="/management/equipment-issues" className="menu-link">
            <i className="fas fa-wrench nav-icon menu-icon"></i> {/* Icon for issues/repairs */}
              Sự cố Thiết bị
          </NavLink>
        </li>

        

        {/* Vạch kẻ phân cách giữa link tĩnh và link động */}
        <hr className="sidebar-divider" />

        {/* === PHẦN CÁC LINK ĐỘNG (THEO CƠ SỞ) === */}
        {locationItems}
      </>
    );
  };



  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">{renderMenuItems()}</ul>
      </nav>
    </aside>
  );
};

export default Sidebar;