import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './Sidebar.css';


const Sidebar = () => {
  const { user } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [locations, setLocations] = useState([]);

  // Định nghĩa menu items dựa trên role và staffType
  const getMenuItems = (role, staffType) => {
    

    const roleSpecificItems = {
      staff: [
        {
          path: 'work-schedule',
          icon: 'fas fa-user-injured',
          label: 'Lịch làm việc',
          roles: ['staff'],
          staffTypes: ['receptionist', 'storeKepper']
        },
        {
          path: 'appointments',
          icon: 'fas fa-table',
          label: 'Lịch hẹn',
          roles: ['staff'],
          staffTypes: ['receptionist']
        },
        
        {
          path: 'invoices',
          icon: 'fas fa-file-invoice',
          label: 'Hóa đơn',
          roles: ['staff'],
          staffTypes: ['receptionist']
        },
        {
          path: 'inventory',
          icon: 'fas fa-boxes',
          label: 'Quản lý kho thuốc',
          roles: ['staff'],
          staffTypes: ['storeKepper']
        },
        {
          path: 'equipment',
          icon: 'fas fa-tools',
          label: 'Thiết bị',
          roles: ['staff'],
          staffTypes: ['storeKepper']
        }
      ],
      management: [
          {
            path: 'doctor',
            icon: 'fas fa-user-tie',
            label: 'Doctor',
            roles: ['management'],
            hasSubmenu: true,
            submenu: [
              {
                path: 'doctor/information',
                icon: 'fas fa-info-circle',
                label: 'Doctor Information',
                roles: ['management']
              },
              {
                path: 'doctor/schedule',
                icon: 'fas fa-calendar-alt',
                label: "Doctor's Schedule",
                roles: ['management'],
                hasSubmenu: true,
                submenu: [
                {
                  path: 'doctor/schedule/fulltime',
                  icon: 'fas fa-user-nurse',
                  label: 'Fulltime Doctor',
                  roles: ['management']
                },
                {
                  path: 'doctor/schedule/parttime',
                  icon: 'fas fa-user-nurse',
                  label: 'Parttime Doctor',
                  roles: ['management']
                }
              ]
              }
            ]
          },
        {
          path: 'staff',
          icon: 'fas fa-user-tie',
          label: 'Staff',
          roles: ['management'],
          hasSubmenu: true,
          submenu: [
            {
              path: 'staff/information',
              icon: 'fas fa-info-circle',
              label: 'Staff Information',
              roles: ['management']
            },
            {
              path: 'staff/schedule',
              icon: 'fas fa-calendar-alt',
              label: "Staff's Schedule",
              roles: ['management'],
              hasSubmenu: true,
              submenu: [
                {
                  path: 'staff/schedule/fulltime',
                  icon: 'fas fa-user-nurse',
                  label: 'Fulltime Staff',
                  roles: ['management']
                },
                {
                  path: 'staff/schedule/parttime',
                  icon: 'fas fa-user-nurse',
                  label: 'Parttime Staff',
                  roles: ['management']
                }
              ]
            }
          ]
        },
        {
          path: 'reports',
          icon: 'fas fa-chart-line',
          label: 'Report',
          roles: ['management']
        },
        {
          path: 'revenue',
          icon: 'fas fa-dollar-sign',
          label: 'Revenue',
          roles: ['management']
        }
      ]
    };

    const allItems = [
      ...(roleSpecificItems[role] || [])
    ];

    // Lọc menu items dựa trên role và staffType
    return allItems.filter(item => {
      // Nếu item không có staffTypes, áp dụng cho tất cả staffType của role đó
      if (!item.staffTypes) {
        return true;
      }
      
      // Nếu có staffType, kiểm tra xem user có staffType phù hợp không
      if (role === 'staff' && staffType) {
        return item.staffTypes.includes(staffType);
      }
      
      // Các role khác không cần kiểm tra staffType
      return true;
    });
  };

  const menuItems = getMenuItems(user?.role, user?.staffType);
  console.log('Menu items:', menuItems);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/management/locations`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (response.ok) {
          const data = await response.json();
          setLocations(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    // Chỉ fetch khi user là management
    if (user?.role === 'management') {
      fetchLocations();
    }
  }, [user?.role]);

  const toggleDropdown = (itemPath) => {
    console.log('Toggling dropdown for:', itemPath);
    setOpenDropdowns(prev => ({
      ...prev,
      [itemPath]: !prev[itemPath]
    }));
  };

  const scheduleSubmenu = (locationId) => ([
    {
      path: `location/${locationId}/doctor/schedule`,
      icon: 'fas fa-user-md',
      label: "Lịch Bác sĩ",
      hasSubmenu: true,
      submenu: [
        { path: `location/${locationId}/doctor/schedule/fulltime`, icon: 'fas fa-business-time', label: 'Full-time' },
        { path: `location/${locationId}/doctor/schedule/parttime`, icon: 'fas fa-hourglass-half', label: 'Part-time' }
      ]
    },
    {
      path: `location/${locationId}/staff/schedule`,
      icon: 'fas fa-users',
      label: "Lịch Nhân viên",
      hasSubmenu: true,
      submenu: [
        { path: `location/${locationId}/staff/schedule/fulltime`, icon: 'fas fa-business-time', label: 'Full-time' },
        { path: `location/${locationId}/staff/schedule/parttime`, icon: 'fas fa-hourglass-half', label: 'Part-time' }
      ]
    }
  ]);

  const renderMenuItems = () => {
    if (user?.role !== 'management') {
      // Logic render menu cho các role khác (nếu có)
      return null;
    }
    
    return locations.map(location => (
      <li key={location._id} className="menu-item">
        <div 
          className="menu-link dropdown-toggle"
          onClick={() => toggleDropdown(location._id)}
        >
          <i className="fas fa-hospital menu-icon"></i>
          <span className="menu-label">{location.name}</span>
          <i className={`fas fa-chevron-${openDropdowns[location._id] ? 'up' : 'down'} dropdown-arrow`}></i>
        </div>
        {openDropdowns[location._id] && (
          <ul className="submenu">
            {scheduleSubmenu(location._id).map((subItem, subIndex) => (
              <li key={subIndex} className="submenu-item">
                <div 
                  className="submenu-link dropdown-toggle"
                  onClick={() => toggleDropdown(subItem.path)}
                >
                  <i className={`${subItem.icon} submenu-icon`}></i>
                  <span className="submenu-label">{subItem.label}</span>
                  <i className={`fas fa-chevron-${openDropdowns[subItem.path] ? 'up' : 'down'} dropdown-arrow`}></i>
                </div>
                {openDropdowns[subItem.path] && (
                  <ul className="submenu">
                    {subItem.submenu.map((nestedItem, nestedIndex) => (
                      <li key={nestedIndex} className="submenu-item">
                        <NavLink 
                          to={`/management/${nestedItem.path}`}
                          className={({ isActive }) => `submenu-link ${isActive ? 'active' : ''}`}
                        >
                          <i className={`${nestedItem.icon} submenu-icon`}></i>
                          <span className="submenu-label">{nestedItem.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  };


  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {renderMenuItems()}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
