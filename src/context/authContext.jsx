// src/context/authContext.jsx
// (ĐÃ CẬP NHẬT HOÀN CHỈNH)

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getCurrentUser } from '../services/patientService';

const AuthContext = createContext();

// Định nghĩa API_BASE ở đây
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api'; 

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Thêm state đếm thông báo vào context
  const [unreadCount, setUnreadCount] = useState(0); 
  const token = localStorage.getItem('token');

  // 2. Tạo hàm fetch (để dùng ở nhiều nơi)
  const fetchUnreadCount = useCallback(async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return; 

    try {
      const response = await fetch(`${API_BASE}/contact/unread-count`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, []); // Hàm này ổn định

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser(token)
      .then(res => {
        const fetchedUser = res.data.data.user;
        setUser(fetchedUser);
        
        // 3. Tải số đếm lần đầu khi user là receptionist
        if (fetchedUser && fetchedUser.staffType === 'receptionist') {
          fetchUnreadCount(); 
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      })
      .finally(() => {
         setLoading(false);
      });
  }, [token, fetchUnreadCount]); // Thêm fetchUnreadCount vào dependency

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUnreadCount(0); // Reset số đếm khi logout
  };

  // 4. Cung cấp (expose) các giá trị mới ra context
  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      logout, 
      unreadCount,      // <-- Cung cấp state
      setUnreadCount,   // <-- Cung cấp hàm set (cho socket)
      fetchUnreadCount  // <-- Cung cấp hàm fetch (cho reply)
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);