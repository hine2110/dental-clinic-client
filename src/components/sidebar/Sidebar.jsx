import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const [openDropdowns, setOpenDropdowns] = useState({});

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
                roles: ['management']
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
              roles: ['management'],
              hasSubmenu: true,
              submenu: [
                {
                  path: 'staff/information/receptionist',
                  icon: 'fas fa-user-nurse',
                  label: 'Receptionist Staff',
                  roles: ['management']
                },
                {
                  path: 'staff/information/storekeeper',
                  icon: 'fas fa-warehouse',
                  label: 'Store Keeper Staff',
                  roles: ['management']
                }
              ]
            },
            {
              path: 'staff/schedule',
              icon: 'fas fa-calendar-alt',
              label: "Staff's Schedule",
              roles: ['management']
              
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

  const toggleDropdown = (itemPath) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemPath]: !prev[itemPath]
    }));
  };

  return (
    <aside className="sidebar">
      
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item, index) => (
            <li key={index} className="menu-item">
              {item.hasSubmenu ? (
                <>
                  <div 
                    className="menu-link dropdown-toggle"
                    onClick={() => toggleDropdown(item.path)}
                  >
                    <i className={`${item.icon} menu-icon`}></i>
                    <span className="menu-label">{item.label}</span>
                    <i className={`fas fa-chevron-${openDropdowns[item.path] ? 'up' : 'down'} dropdown-arrow`}></i>
                  </div>
                  {openDropdowns[item.path] && (
                    <ul className="submenu">
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex} className="submenu-item">
                          {subItem.hasSubmenu ? (
                            <>
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
                                        to={nestedItem.path}
                                        className={({ isActive }) => 
                                          `submenu-link ${isActive ? 'active' : ''}`
                                        }
                                      >
                                        <i className={`${nestedItem.icon} submenu-icon`}></i>
                                        <span className="submenu-label">{nestedItem.label}</span>
                                      </NavLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          ) : (
                            <NavLink 
                              to={subItem.path}
                              className={({ isActive }) => 
                                `submenu-link ${isActive ? 'active' : ''}`
                              }
                            >
                              <i className={`${subItem.icon} submenu-icon`}></i>
                              <span className="submenu-label">{subItem.label}</span>
                            </NavLink>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink 
                  to={item.path} 
                  end={item.path === '.'}
                  className={({ isActive }) => 
                    `menu-link ${isActive ? 'active' : ''}`
                  }
                >
                  <i className={`${item.icon} menu-icon`}></i>
                  <span className="menu-label">{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
