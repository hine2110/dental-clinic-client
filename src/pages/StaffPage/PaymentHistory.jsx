// [File: src/pages/StaffPage/PaymentHistory.jsx]

import React, { useState, useEffect } from 'react';

// ... (các hàm formatCurrency, formatDateTime) ...
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'N/A';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
// ...

function PaymentHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    totalPages: 1,
    totalInvoices: 0
  });

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: 'all' // <-- Đặt giá trị mặc định là 'all'
  });

  // (MỚI) Thêm state cho summary
  const [summary, setSummary] = useState({ totalRevenue: 0 });

  // useEffect để gọi API
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          page: currentPage,
          limit: 10
        });

        if (filters.startDate && filters.endDate) {
          params.append('startDate', filters.startDate);
          params.append('endDate', filters.endDate);
        }
        if (filters.paymentMethod && filters.paymentMethod !== 'all') {
          params.append('paymentMethod', filters.paymentMethod);
        }

        const response = await fetch(`${API_BASE}/staff/receptionist/invoices/history?${params.toString()}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to fetch history');
        }
        
        setInvoices(data.data);
        setPaginationInfo(data.pagination);
        
        // (MỚI) Lưu dữ liệu summary vào state
        if (data.summary) {
          setSummary(data.summary);
        }

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [currentPage, filters]);

  // ... (hàm handleFilterChange và handlePageChange) ...
const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [name]: value
      };
      const { startDate, endDate } = newFilters;
      if (startDate && endDate && (new Date(startDate) > new Date(endDate))) {
        newFilters.startDate = endDate;
        newFilters.endDate = startDate;
      }
      return newFilters;
    });
    
    setCurrentPage(1);
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= paginationInfo.totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Lịch sử hóa đơn</h1>
      
      <div className="row">
        {/* === CỘT 1: BỘ LỌC === */}
        <div className="col-lg-3">
          <div className="card shadow mb-4">
            {/* ... (Code của card Bộ lọc) ... */}
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Bộ lọc</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="startDate" className="form-label">Từ ngày</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="startDate"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="endDate" className="form-label">Đến ngày</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="endDate"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="paymentMethod" className="form-label">Phương thức</label>
                <select 
                  className="form-select" 
                  id="paymentMethod"
                  name="paymentMethod"
                  value={filters.paymentMethod}
                  onChange={handleFilterChange}
                >
                  <option value="all">Tất cả</option>
                  <option value="cash">Tiền mặt</option>
                  <option value="transfer">Chuyển khoản</option>
                  
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* === CỘT 2: BẢNG DỮ LIỆU === */}
        <div className="col-lg-9">

          {/* === (MỚI) THÊM CARD TỔNG QUAN === */}
          <div className="card shadow mb-4">
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Tổng quan (dựa trên bộ lọc)</h6>
            </div>
            <div className="card-body">
              {loading ? (
                <p>Đang tính toán...</p>
              ) : (
                <div>
                  <h4 className="font-weight-bold text-success mb-0">
                    Tổng doanh thu: {formatCurrency(summary.totalRevenue)}
                  </h4>
                  <small className="text-muted">
                    Tính trên {paginationInfo.totalInvoices || 0} hóa đơn phù hợp
                  </small>
                </div>
              )}
            </div>
          </div>
          {/* === KẾT THÚC CARD MỚI === */}

          <div className="card shadow mb-4">
            {/* ... (Code của card Bảng dữ liệu) ... */}
            <div className="card-header py-3">
              <h6 className="m-0 font-weight-bold text-primary">Danh sách hóa đơn</h6>
            </div>
            <div className="card-body">
              {/* ... (Phần table, pagination) ... */}
              {loading && <p>Đang tải danh sách...</p>}
              {error && <div className="alert alert-danger">{error}</div>}
              
              {!loading && !error && (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Mã HĐ</th>
                          <th>Thời gian</th>
                          <th>Khách hàng</th>
                          <th>Tổng tiền</th>
                          <th>Giảm giá</th>
                          <th>Thành tiền</th>
                          <th>PTTT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.length > 0 ? invoices.map((invoice) => (
                          <tr key={invoice._id}>
                            <td>{invoice.invoiceId || invoice._id.slice(-6)}</td>
                            <td>{formatDateTime(invoice.invoiceDate)}</td>
                            <td>{invoice.patient?.basicInfo?.fullName || 'N/A'}</td>
                            <td>{formatCurrency(invoice.totalAmount)}</td>
                            <td>{formatCurrency(invoice.discountAmount)}</td>
                            <td><strong>{formatCurrency(invoice.finalAmount)}</strong></td>
                            <td>
                              {invoice.paymentMethod === 'cash' ? (
                                <span className="badge bg-success">Tiền mặt</span>
                              ) : (
                                <span className="badge bg-primary">Chuyển khoản</span>
                              )}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="7" className="text-center">Không có hóa đơn nào phù hợp.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Phân trang */}
                  {paginationInfo && paginationInfo.totalPages > 1 && (
                    <nav className="d-flex justify-content-between align-items-center mt-3">
                      <div className="text-muted small">
                        Hiển thị {invoices.length} trên tổng số {paginationInfo.totalInvoices} hóa đơn
                      </div>
                      <ul className="pagination mb-0">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentHistory;