import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/authContext';
import PaymentModal from './PaymentModal'; // Chúng ta sẽ tạo file này tiếp theo

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function StaffInvoices() {
  const { user } = useAuth();
  const [paymentQueue, setPaymentQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Hàm gọi API lấy danh sách chờ thanh toán
  const fetchPaymentQueue = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff/receptionist/payment-queue`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch payment queue');
      }
      setPaymentQueue(data.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Tải danh sách chờ khi component được render
  useEffect(() => {
    if (user) {
      fetchPaymentQueue();
    }
  }, [user]);

  // Hàm mở modal khi bấm nút "Thanh toán"
  const handleOpenPaymentModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // Hàm đóng modal
  const handleClosePaymentModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(false);
  };

  // Hàm này được gọi từ Modal sau khi thanh toán thành công
  const handlePaymentSuccess = () => {
    handleClosePaymentModal();
    fetchPaymentQueue(); // Tải lại danh sách chờ
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4">Hóa đơn & Thanh toán</h1>

      <div className="card shadow mb-4">
        <div className="card-header py-3">
          <h6 className="m-0 font-weight-bold text-primary">Hàng đợi thanh toán</h6>
        </div>
        <div className="card-body">
          {loading && <p>Đang tải danh sách...</p>}
          {error && <div className="alert alert-danger">{error}</div>}
          
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Bệnh nhân</th>
                    <th>Số điện thoại</th>
                    <th>Bác sĩ</th>
                    <th>Giờ hoàn thành</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentQueue.length > 0 ? paymentQueue.map((apt) => (
                    <tr key={apt._id}>
                      <td>{apt.patient?.basicInfo?.fullName || 'N/A'}</td>
                      <td>{apt.patient?.contactInfo?.phone || 'N/A'}</td>
                      <td>{apt.doctor?.user?.fullName || 'N/A'}</td>
                      <td>{new Date(apt.updatedAt).toLocaleTimeString('vi-VN')}</td>
                      <td>
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleOpenPaymentModal(apt)}
                        >
                          Thanh toán
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center">Không có bệnh nhân nào đang chờ thanh toán.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Render Modal Thanh toán */}
      {isModalOpen && selectedAppointment && (
        <PaymentModal
          appointment={selectedAppointment}
          onClose={handleClosePaymentModal}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

export default StaffInvoices;