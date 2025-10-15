// src/pages/StaffPage/StaffContacts.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import './staff.css'; // We will create this file in the next step

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
  
  // State for the reply modal
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    const fetchContacts = async (page) => {
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
    };

    if (user) {
      fetchContacts(currentPage);
    }
  }, [user, currentPage]);

  const handleOpenReplyModal = (contact) => {
    setSelectedContact(contact);
    setReplyMessage('');
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

      // Update the contact list in the UI without a full refresh
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
                    <td colSpan="7" className="text-center">Không có tin nhắn nào.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Khối Phân trang */}
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

      {/* Modal Trả lời Tin nhắn */}
      {selectedContact && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Trả lời tin nhắn</h5>
              <button type="button" className="btn-close" onClick={handleCloseReplyModal}></button>
            </div>
            <div className="modal-body">
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