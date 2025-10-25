// src/pages/StaffPage/StaffContacts.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import { io } from "socket.io-client"; // THÊM MỚI
import './staff.css'; 

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function StaffContacts() {
  const { user } = useAuth();
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

  // === BƯỚC 1: Tách hàm fetchContacts ra ngoài ===
  // Gói trong useCallback để nó ổn định và có thể được sử dụng trong các useEffect khác
  const fetchContacts = useCallback(async (page) => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      // API endpoint này không đổi, backend sẽ tự động lọc
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
  }, []); // Hàm này không phụ thuộc vào gì (vì token lấy từ localStorage)

  // === BƯỚC 2: useEffect gốc, chỉ gọi fetchContacts ===
  useEffect(() => {
    if (user) {
      fetchContacts(currentPage);
    }
  }, [user, currentPage, fetchContacts]); // Thêm fetchContacts vào dependency

  // === BƯỚC 3: useEffect MỚI cho Socket.io ===
  useEffect(() => {
    if (!user) return; // Chỉ chạy khi user đã đăng nhập

    const token = localStorage.getItem('token');
    
    // 1. Kết nối tới Socket server
    const socket = io(API_BASE.replace("/api", ""), { // Kết nối tới root (vd: http://localhost:5000)
      auth: { token: token } // Gửi token để xác thực (nếu backend có)
    });

    // 2. Lấy danh sách cơ sở làm việc HÔM NAY của nhân viên
    const fetchLocationsAndJoinRooms = async () => {
      try {
        // Gọi API mới (Giả định là /api/staff/my-locations-today)
        const response = await fetch(`${API_BASE}/staff/my-locations-today`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // 3. Tham gia vào "room" của từng cơ sở
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

    // 4. Lắng nghe sự kiện "new_contact_received"
    socket.on('new_contact_received', () => {
      console.log("Socket: New contact received! Refetching...");
      // Khi có tin nhắn mới, tải lại danh sách ở trang hiện tại
      fetchContacts(currentPage); 
      // (Bạn cũng có thể gọi API đếm số tin chưa đọc ở đây)
    });

    // 5. Cleanup: Ngắt kết nối socket khi component unmount
    return () => {
      socket.disconnect();
    };

  }, [user, currentPage, fetchContacts]); // Chạy lại nếu user, trang, hoặc hàm fetch thay đổi

  // === CÁC HÀM KHÁC (giữ nguyên) ===

  const handleOpenReplyModal = (contact) => {
    setSelectedContact(contact);
    setReplyMessage('');
    
    // (Tùy chọn: Đánh dấu là 'read' ở đây nếu cần)
  };

  const handleCloseReplyModal = () => {
    setSelectedContact(null);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) {
      alert('Vui lòng nhập nội dung trả lời.');
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

      alert('Gửi trả lời thành công!');
      handleCloseReplyModal();

    } catch (e) {
      setError(e.message);
      alert(`Lỗi: ${e.message}`);
    } finally {
      setIsReplying(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="badge bg-primary">Mới</span>;
      case 'replied':
        return <span className="badge bg-success">Đã trả lời</span>;
      case 'archived':
        return <span className="badge bg-secondary">Đã lưu trữ</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };
  
   return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Hộp thư liên hệ</h1>

      {loading && <p>Đang tải danh sách...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      
      {!loading && !error && (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Cơ sở</th> {/* THÊM MỚI */}
                  <th>Ngày gửi</th>
                  <th>Người gửi</th>
                  <th>Email</th>
                  <th>Chủ đề</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {contacts.length > 0 ? contacts.map((contact, index) => (
                  <tr key={contact._id}>
                    <td>{(currentPage - 1) * 10 + index + 1}</td>
                    {/* THÊM MỚI: Hiển thị tên cơ sở */}
                    <td>{contact.location?.name || 'N/A'}</td>
                    <td>{new Date(contact.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>{contact.name}</td>
                    <td>{contact.email}</td>
                    <td>{contact.subject}</td>
                    <td>{getStatusBadge(contact.status)}</td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleOpenReplyModal(contact)}
                        disabled={contact.status === 'replied'}
                      >
                        {contact.status === 'replied' ? 'Đã trả lời' : 'Xem & Trả lời'}
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    {/* CẬP NHẬT: Tăng colSpan */}
                    <td colSpan="8" className="text-center">Không có tin nhắn nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
               {/* THÊM MỚI: Hiển thị cơ sở */}
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
                  <button type="button" className="btn btn-secondary" onClick={handleCloseReplyModal}>Hủy</button>
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