// src/pages/StaffPage/StaffContacts.jsx
// (ĐÃ CẬP NHẬT GIAO DIỆN)

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import { io } from "socket.io-client";
import './staff.css'; 
import './StaffContacts.css'; // <-- BƯỚC 1: IMPORT FILE CSS MỚI
import Toast from '../../components/common/Toast';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function StaffContacts() {
  // Lấy hàm fetchUnreadCount từ context
  const { user, fetchUnreadCount } = useAuth(); 
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalContacts: 0
  });
  
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [toast, setToast] = useState(null); 

  // ... (Toàn bộ logic: fetchContacts, useEffects, handleOpenReplyModal, handleCloseReplyModal giữ nguyên) ...
  const fetchContacts = useCallback(async (page) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contact?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch contacts');
      }
      setContacts(data.data);
      setPaginationInfo(data.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []); 

  useEffect(() => {
    if (user) {
      fetchContacts(currentPage);
    }
  }, [user, currentPage, fetchContacts]); 

  useEffect(() => {
    if (!user) return; 
    const token = localStorage.getItem('token');
    const socket = io(API_BASE.replace("/api", ""), { 
      auth: { token: token } 
    });
    const fetchLocationsAndJoinRooms = async () => {
      try {
        const response = await fetch(`${API_BASE}/staff/my-locations-today`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          data.data.forEach(location => {
            if(location._id) {
              socket.emit('join_location_room', location._id);
            }
          });
        }
      } catch (err) {
        console.error("Failed to fetch locations for socket rooms:", err);
      }
    };
    fetchLocationsAndJoinRooms();
    socket.on('new_contact_received', () => {
      console.log("Socket: New contact received! Refetching...");
      fetchContacts(currentPage); 
    });
    return () => {
      socket.disconnect();
    };
  }, [user, currentPage, fetchContacts]); 

  const handleOpenReplyModal = (contact) => {
    setSelectedContact(contact);
    setReplyMessage('');
  };

  const handleCloseReplyModal = () => {
    setSelectedContact(null);
  };
  
  // Logic gửi trả lời (đã cập nhật không reload trang)
  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      setToast({ message: 'Vui lòng nhập nội dung trả lời.', type: 'error' });
      return;
    }

    setIsReplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/contact/${selectedContact._id}/reply`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Gửi trả lời thất bại');
      }

      setContacts(prevContacts => 
        prevContacts.map(c => 
          c._id === selectedContact._id ? data.data : c
        )
      );
      setToast({ message: 'Gửi trả lời thành công!', type: 'success' });
      handleCloseReplyModal();

      if (fetchUnreadCount) {
        fetchUnreadCount();
      }
    } catch (e) {
      setToast({ message: `Lỗi: ${e.message}`, type: 'error' });
    } finally {
      setIsReplying(false);
    }
  };
  
  // Hàm `getStatusBadge` không còn cần thiết nữa

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };
  
   return (
    <div className="container-fluid">
      {/* (Toast giữ nguyên) */}
      {toast && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="h3 mb-4">Hộp thư liên hệ</h1>

      {loading && <p>Đang tải danh sách...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && !error && (
        <>
          {/* ===== BƯỚC 2: THAY THẾ TABLE BẰNG CARD LIST ===== */}
          <div className="contact-list-container">
            {contacts.length > 0 ? contacts.map((contact) => (
              <div 
                key={contact._id} 
                // Thêm class 'status-new' hoặc 'status-replied'
                className={`contact-item-card status-${contact.status}`}
              >
                {/* Phần nội dung chính (Tên, Chủ đề, Cơ sở) */}
                <div className="contact-info">
                  <div className="contact-header">
                    <span className="contact-sender">{contact.name}</span>
                    <span className="contact-date">
                      {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="contact-subject">
                    {contact.subject}
                  </div>
                  <div className="contact-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {contact.location?.name || 'N/A'} - ({contact.email})
                  </div>
                </div>

                {/* Phần nút hành động */}
                <div className="contact-actions">
                  <button 
                    className={`btn btn-sm ${contact.status === 'replied' ? 'btn-outline-secondary' : 'btn-primary'}`}
                    onClick={() => handleOpenReplyModal(contact)}
                    disabled={contact.status === 'replied'}
                  >
                    {contact.status === 'replied' ? 'Đã trả lời' : 'Xem & Trả lời'}
                  </button>
                </div>
              </div>
            )) : (
              <div className="text-center p-5">
                <h4>Không có tin nhắn nào.</h4>
              </div>
            )}
          </div>
          {/* ============================================== */}


          {/* (Phần Phân trang giữ nguyên) */}
          {paginationInfo && paginationInfo.totalPages > 1 && (
            <nav className="d-flex justify-content-end mt-3">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                    Trang trước
                  </button>
                </li>
                <li className="page-item disabled">
                  <span className="page-link">
                    Trang {currentPage} / {paginationInfo.totalPages}
                  </span>
                </li>
                <li className={`page-item ${currentPage === paginationInfo.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                    Trang sau
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}

      {/* (Phần Modal giữ nguyên) */}
      {selectedContact && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Trả lời tin nhắn</h5>
              <button type="button" className="btn-close" onClick={handleCloseReplyModal}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label"><strong>Cơ sở:</strong> {selectedContact.location?.name || 'N/A'}</label>
              </div>
              <div className="mb-3">
                <label className="form-label"><strong>Từ:</strong> {selectedContact.name} ({selectedContact.email})</label>
              </div>
              <div className="mb-3">
                <label className="form-label"><strong>Nội dung tin nhắn:</strong></label>
                <div className="p-2 bg-light border rounded">
                  {selectedContact.message}
                </div>
              </div>
              <hr />
              <form onSubmit={handleReplySubmit}>
                <div className="mb-3">
                  <label htmlFor="replyMessage" className="form-label"><strong>Nội dung trả lời của bạn:</strong></label>
                  <textarea
                    id="replyMessage"
                    className="form-control"
                    rows="5"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={handleCloseReplyModal}>Hủy</button>
                  <button type="submit" className="btn btn-primary" disabled={isReplying}>
                    {isReplying ? 'Đang gửi...' : 'Gửi trả lời'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffContacts;