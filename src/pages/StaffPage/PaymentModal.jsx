import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './PaymentModal.css'; // Đảm bảo tệp CSS này tồn tại

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

// Hàm helper định dạng tiền
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

function PaymentModal({ appointment, onClose, onPaymentSuccess }) {
  const [services, setServices] = useState([]); // Danh sách tất cả dịch vụ
  const [activeInvoice, setActiveInvoice] = useState(null); // Giỏ hàng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State cho thanh toán
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountGiven, setAmountGiven] = useState(0); // Tiền khách đưa
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrInfo, setQrInfo] = useState({ qrCodeUrl: '', memo: '', amount: 0 });
  const [isFetchingQR, setIsFetchingQR] = useState(false);

  // State cho Discount
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { code, discountAmount }
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // 1. Tải danh sách dịch vụ VÀ tạo/lấy hóa đơn nháp khi modal mở
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      try {
        // Tải song song cả 2 API
        const [servicesRes, invoiceRes] = await Promise.all([
          // API 1: Lấy danh sách dịch vụ
          fetch(`${API_BASE}/staff/receptionist/billing-services`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          // API 2: Tạo hoặc lấy hóa đơn nháp
          fetch(`${API_BASE}/staff/receptionist/invoices/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ appointmentId: appointment._id })
          })
        ]);

        const servicesData = await servicesRes.json();
        const invoiceData = await invoiceRes.json();

        if (!servicesData.success) throw new Error(servicesData.message);
        if (!invoiceData.success) throw new Error(invoiceData.message);

        setServices(servicesData.data);
        setActiveInvoice(invoiceData.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [appointment._id]);

  // === THÊM HOOK ĐỂ TỰ ĐỘNG LẤY MÃ QR ===
  useEffect(() => {
    // Chỉ chạy khi phương thức là 'transfer' VÀ đã có hóa đơn
    if (paymentMethod === 'transfer' && activeInvoice) {
      const fetchQrCode = async () => {
        setIsFetchingQR(true);
        setError(''); // Xóa lỗi cũ (nếu có)
        
        try {
          const token = localStorage.getItem('token');
          // 1. Gọi API mới mà chúng ta vừa tạo ở Backend
          const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/generate-qr`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.message);
          }
          
          // 2. Lưu thông tin QR vào state
          setQrInfo(data.data);

        } catch (e) {
          setError(e.message);
        } finally {
          setIsFetchingQR(false);
        }
      };
      
      fetchQrCode();

    } else {
      // Nếu chuyển về tiền mặt, xóa thông tin QR
      setQrInfo({ qrCodeUrl: '', memo: '', amount: 0 });
    }
  }, [paymentMethod, activeInvoice]); // Chạy lại khi 2 giá trị này thay đổi
  // ======================================

  // 2. Hàm gọi API cập nhật giỏ hàng
  const updateInvoiceItems = async (newItems) => {
    // QUAN TRỌNG: Nếu giỏ hàng thay đổi, xóa discount
    if (appliedDiscount) {
      handleRemoveDiscount(); // Gọi hàm xóa discount
      setError("Giỏ hàng đã thay đổi, vui lòng nhập lại mã giảm giá.");
    }
    
    // Cập nhật UI ngay lập tức
    const optimisticInvoice = { ...activeInvoice, items: newItems };
    setActiveInvoice(optimisticInvoice);

    // Chuẩn bị data cho API (chỉ cần itemId và quantity)
    const itemsPayload = newItems.map(item => ({
      itemId: item.item._id, // item.item là đối tượng service đầy đủ
      quantity: item.quantity
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/items`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: itemsPayload })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      // Cập nhật lại state với dữ liệu chính xác từ server (đã có totalAmount mới)
      setActiveInvoice(data.data);
    } catch (e) {
      setError(e.message);
    }
  };

  // 3. Hàm thêm dịch vụ vào giỏ hàng
  const handleAddItem = (service) => {
    const existingItem = activeInvoice.items.find(item => item.item._id === service._id);
    let newItems = [];
    if (existingItem) {
      // Tăng số lượng
      newItems = activeInvoice.items.map(item =>
        item.item._id === service._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      // Thêm mới
      newItems = [
        ...activeInvoice.items,
        {
          item: service, // Lưu tạm service object đầy đủ
          quantity: 1,
          priceAtPayment: service.price, // Dùng giá hiện tại
          nameAtPayment: service.name
        }
      ];
    }
    updateInvoiceItems(newItems);
  };

  // 4. Hàm cập nhật số lượng trong giỏ hàng
  const handleUpdateQuantity = (serviceId, newQuantity) => {
    let newItems;
    if (newQuantity <= 0) {
      // Xóa khỏi giỏ
      newItems = activeInvoice.items.filter(item => item.item._id !== serviceId);
    } else {
      // Cập nhật số lượng
      newItems = activeInvoice.items.map(item =>
        item.item._id === serviceId ? { ...item, quantity: newQuantity } : item
      );
    }
    updateInvoiceItems(newItems);
  };
  
  // 5. Hàm Áp dụng / Xóa Discount
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsApplyingDiscount(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      // API này bạn phải tạo ở backend
      const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/apply-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          code: discountCode,
          currentTotal: totalAmount // Gửi tổng tiền gốc
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
      
      // Giả định backend trả về: { data: { code: 'SAVE10', discountAmount: 110000 } }
      setAppliedDiscount(data.data); 

    } catch (e) {
      setError(e.message);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setError('');
  };

  // 6. Tính toán tiền
  // Tổng tiền gốc (Tạm tính)
  const totalAmount = useMemo(() => {
    return activeInvoice?.totalAmount || 0;
  }, [activeInvoice]);

  // Thành tiền (sau khi giảm giá)
  const finalTotal = useMemo(() => {
    if (appliedDiscount) {
      return Math.max(0, totalAmount - appliedDiscount.discountAmount);
    }
    return totalAmount;
  }, [totalAmount, appliedDiscount]);

  // Tiền thối (dựa trên Thành tiền)
  const changeAmount = useMemo(() => {
    if (paymentMethod === 'cash' && amountGiven > 0) {
      const change = amountGiven - finalTotal; // Dùng finalTotal
      return change >= 0 ? change : 0;
    }
    return 0;
  }, [amountGiven, finalTotal, paymentMethod]); // Dùng finalTotal

  // 7. Hàm chốt thanh toán
  const handleFinalizePayment = async () => {
    setIsSubmitting(true);
    setError('');
    if (paymentMethod === 'cash' && amountGiven < finalTotal) {
      setError(`Số tiền khách đưa không đủ. Cần ít nhất ${formatCurrency(finalTotal)}.`);
      setIsSubmitting(false);
      return; // Dừng lại
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Gửi đầy đủ thông tin thanh toán
        body: JSON.stringify({
          paymentMethod: paymentMethod,
          amountGiven: amountGiven,
          discountCode: appliedDiscount ? appliedDiscount.code : null,
          originalTotal: totalAmount, // Tạm tính (gốc)
          finalTotal: finalTotal // Thành tiền (đã giảm)
        })
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }

      // Cập nhật alert
      alert(`Thanh toán thành công!\nThành tiền: ${formatCurrency(finalTotal)}\nTiền khách đưa: ${formatCurrency(amountGiven)}\nTiền thối: ${formatCurrency(changeAmount)}`);
      onPaymentSuccess(); // Gọi hàm callback để đóng modal và tải lại queue

    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 8. Render JSX
  return createPortal(
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        <div className="payment-modal-header">
          <h4 className="modal-title">Lập hóa đơn thanh toán</h4>
          <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
        </div>

        {loading && <div className="modal-loading">Đang tải dữ liệu...</div>}
        {error && <div className="modal-error alert alert-danger mx-3">{error}</div>}

        {!loading && activeInvoice && (
          <div className="payment-modal-body">
            <div className="service-list-panel">
              <h5>Dịch vụ</h5>
              <div className="service-list-items">
                {services.map(service => (
                  <div key={service._id} className="service-item" onClick={() => handleAddItem(service)}>
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">{formatCurrency(service.price)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* // <-- FIX 1: Ép cột này thành flex-column */}
            <div 
              className="cart-panel" 
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <h5>Giỏ hàng (Hóa đơn: {activeInvoice._id.slice(-6)})</h5>
              <p>Bệnh nhân: <strong>{appointment.patient?.basicInfo?.fullName}</strong></p>
              
              {/* // <-- FIX 2 (ĐÃ SỬA LOGIC): Cho phép khối này dãn ra và cuộn */}
              <div 
                className="cart-items-list" 
                style={{ flex: '1 1 auto', overflowY: 'auto' }}
              >
                {activeInvoice.items.length === 0 ? (
                  <p className="text-center text-muted">Vui lòng chọn dịch vụ</p>
                ) : (
                  activeInvoice.items.map(item => (
                    <div key={item.item._id} className="cart-item">
                      <div className="cart-item-info">
                        <span>{item.nameAtPayment}</span>
                        <span>{formatCurrency(item.priceAtPayment)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => handleUpdateQuantity(item.item._id, item.quantity - 1)}>-</button>
                        <input type="number" value={item.quantity} readOnly />
                        <button onClick={() => handleUpdateQuantity(item.item._id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <hr />

              {/* === BẮT ĐẦU KHỐI CẬP NHẬT JSX === */}
              {/* // <-- FIX 3 (ĐÃ SỬA LOGIC): Ngăn khối này dãn ra */}
              <div 
                className="payment-summary"
                style={{ flex: '0 0 auto' }}
              >
                
                {/* Phần Mã giảm giá, Tạm tính, Thành tiền */}
                <div className="summary-row">
                  <label htmlFor="discountCode">Mã giảm giá:</label>
                  <div className="discount-input-group">
                    <input
                      type="text"
                      id="discountCode"
                      className="form-control form-control-sm"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã..."
                      disabled={!!appliedDiscount || isApplyingDiscount}
                    />
                    {appliedDiscount ? (
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={handleRemoveDiscount}
                      >
                        Xóa
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm btn-outline-primary" 
                        onClick={handleApplyDiscount}
                        disabled={isApplyingDiscount || !discountCode}
                      >
                        {isApplyingDiscount ? '...' : 'Áp dụng'}
                      </button>
                    )}
                  </div>
                </div>
                <div className={`summary-row ${appliedDiscount ? 'original-total-row' : ''}`}>
                  <strong>{appliedDiscount ? 'Tạm tính:' : 'Tổng cộng:'}</strong>
                  <strong className={`total-amount ${appliedDiscount ? 'original-total' : ''}`}>
                    {formatCurrency(totalAmount)}
                  </strong>
                </div>
                {appliedDiscount && (
                  <>
                    <div className="summary-row discount-applied">
                      <span>Giảm giá ({appliedDiscount.code}):</span>
                      <span>- {formatCurrency(appliedDiscount.discountAmount)}</span>
                    </div>
                    <div className="summary-row final-total-row">
                      <strong>Thành tiền:</strong>
                      <strong className="total-amount final-total">{formatCurrency(finalTotal)}</strong>
                    </div>
                  </>
                )}
                
                <hr className="my-2" />

                {/* === LOGIC MỚI BẮT ĐẦU TỪ ĐÂY === */}

                <div className="summary-row">
                  <label>Phương thức:</label>
                  <select 
                    className="form-select form-select-sm" 
                    value={paymentMethod} 
                    onChange={e => setPaymentMethod(e.target.value)}
                    disabled={isFetchingQR}
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="transfer">Chuyển khoản</option>
                  </select>
                </div>

                {/* --- KHỐI 1: HIỂN THỊ NẾU LÀ "TIỀN MẶT" --- */}
                {paymentMethod === 'cash' && (
                  <>
                    <div className="summary-row">
                      <label htmlFor="amountGiven">Tiền khách đưa:</label>
                      <input
                        type="number"
                        id="amountGiven"
                        className="form-control form-control-sm"
                        value={amountGiven === 0 ? '' : amountGiven}
                        onChange={e => {
                          let val = parseFloat(e.target.value);
                          if (isNaN(val) || val < 0) {
                            val = 0;
                          }
                          setAmountGiven(val);
                        }}
                        onFocus={e => e.target.select()}
                        placeholder="Nhập số tiền..."
                        min="0"
                      />
                    </div>
                    <div className="summary-row highlight">
                      <strong>Tiền thối:</strong>
                      <strong className="change-amount">{formatCurrency(changeAmount)}</strong>
                    </div>
                  </>
                )}

                {/* --- KHỐI 2: HIỂN THỊ NẾU LÀ "CHUYỂN KHOẢN" --- */}
                {paymentMethod === 'transfer' && (
                  <div className="transfer-payment-section">
                    {isFetchingQR && <p className="text-center">Đang tạo mã QR...</p>}
                    
                    {qrInfo.qrCodeUrl && (
                      <>
                        <p className='text-center small'>Quét mã để thanh toán. Vui lòng xác nhận đúng số tiền và nội dung trước khi chuyển.</p>
                        <img 
                          src={qrInfo.qrCodeUrl} 
                          alt="Mã QR thanh toán" 
                          className="qr-code-image" 
                        />
                        <div className="summary-row">
                          <strong>Số tiền:</strong>
                          <strong>{formatCurrency(qrInfo.amount)}</strong>
                        </div>
                        <div className="summary-row">
                          <strong>Nội dung:</strong>
                          <strong>{qrInfo.memo}</strong>
                        </div>
                        <p className='text-center text-danger small mt-2'>Sau khi khách chuyển thành công, nhân viên hãy nhấn "Xác nhận" ở dưới.</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              <button 
                className={`btn w-100 mt-3 ${paymentMethod === 'transfer' ? 'btn-success' : 'btn-primary'}`}
                onClick={handleFinalizePayment}
                disabled={isSubmitting || finalTotal === 0 || isFetchingQR}
              >
                {/* Đổi chữ trên nút dựa theo phương thức */}
                {isSubmitting ? 'Đang xử lý...' : 
                  (paymentMethod === 'transfer' ? 
                    'Xác nhận đã nhận tiền' : 
                    `Hoàn tất thanh toán ${formatCurrency(finalTotal)}`
                  )
                }
              </button>
              {/* === KẾT THÚC KHỐI CẬP NHẬT === */}

            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default PaymentModal;