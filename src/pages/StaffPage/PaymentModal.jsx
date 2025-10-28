// src/pages/staff/PaymentModal.jsx
// (ĐÃ SỬA LỖI THỨ TỰ HOOK)

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './PaymentModal.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

function PaymentModal({ appointment, onClose, onPaymentSuccess }) {
  const [allServices, setAllServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountGiven, setAmountGiven] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrInfo, setQrInfo] = useState({ qrCodeUrl: '', memo: '', amount: 0 });
  const [isFetchingQR, setIsFetchingQR] = useState(false);
  
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // 1. Tải dịch vụ VÀ hóa đơn (Giữ nguyên)
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      try {
        const [servicesRes, invoiceRes] = await Promise.all([
          fetch(`${API_BASE}/staff/receptionist/billing-services`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE}/staff/receptionist/invoices/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ appointmentId: appointment._id })
          })
        ]);
        const servicesData = await servicesRes.json();
        const invoiceData = await invoiceRes.json();
        if (!servicesData.success) throw new Error(servicesData.message);
        if (!invoiceData.success) throw new Error(invoiceData.message);

        setAllServices(servicesData.data);
        setFilteredServices(servicesData.data);
        setActiveInvoice(invoiceData.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [appointment._id]);
  
  // 2. Lọc dịch vụ khi tìm kiếm (Giữ nguyên)
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredServices(allServices);
    } else {
      setFilteredServices(
        allServices.filter(service =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, allServices]);

  // ===== BƯỚC 1: DI CHUYỂN KHỐI NÀY LÊN TRÊN =====
  // 3. Logic tính toán tiền (Phải khai báo trước khi sử dụng)
  const totalAmount = useMemo(() => activeInvoice?.totalAmount || 0, [activeInvoice]);
  
  const finalTotal = useMemo(() => {
    if (appliedDiscount) {
      return Math.max(0, totalAmount - appliedDiscount.discountAmount);
    }
    return totalAmount;
  }, [totalAmount, appliedDiscount]);
  
  const changeAmount = useMemo(() => {
    if (paymentMethod === 'cash' && amountGiven > 0) {
      const change = amountGiven - finalTotal; 
      return change >= 0 ? change : 0;
    }
    return 0;
  }, [amountGiven, finalTotal, paymentMethod]);
  // =============================================

  // 4. Tải QR Code (Giờ đã có thể truy cập 'finalTotal' an toàn)
  useEffect(() => {
    if (paymentMethod === 'transfer' && activeInvoice && finalTotal > 0) {
      const fetchQrCode = async () => {
        setIsFetchingQR(true);
        setError(''); 
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/generate-qr`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (!data.success) throw new Error(data.message);
          setQrInfo(data.data);
        } catch (e) {
          setError(e.message);
        } finally {
          setIsFetchingQR(false);
        }
      };
      fetchQrCode();
    } else {
      setQrInfo({ qrCodeUrl: '', memo: '', amount: 0 });
    }
  }, [paymentMethod, activeInvoice, finalTotal]); // Phụ thuộc vào finalTotal

  // ... (Toàn bộ logic nghiệp vụ còn lại: updateInvoiceItems, handleAddItem, handleUpdateQuantity... giữ nguyên) ...
  const updateInvoiceItems = async (newItems) => {
    if (appliedDiscount) {
      handleRemoveDiscount(); 
      setError("Giỏ hàng đã thay đổi, vui lòng nhập lại mã giảm giá.");
    }
    const optimisticInvoice = { ...activeInvoice, items: newItems };
    setActiveInvoice(optimisticInvoice);
    const itemsPayload = newItems.map(item => ({
      itemId: item.item._id || item.item, 
      quantity: item.quantity
    }));
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items: itemsPayload })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      setActiveInvoice(data.data);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAddItem = (service) => {
    const existingItem = activeInvoice.items.find(item => (item.item._id || item.item) === service._id);
    let newItems = [];
    if (existingItem) {
      newItems = activeInvoice.items.map(item =>
        (item.item._id || item.item) === service._id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newItems = [
        ...activeInvoice.items,
        {
          item: service, 
          quantity: 1,
          priceAtPayment: service.price,
          nameAtPayment: service.name
        }
      ];
    }
    updateInvoiceItems(newItems);
  };

  const handleUpdateQuantity = (serviceId, newQuantity) => {
    let newItems;
    if (newQuantity <= 0) {
      newItems = activeInvoice.items.filter(item => (item.item._id || item.item) !== serviceId);
    } else {
      newItems = activeInvoice.items.map(item =>
        (item.item._id || item.item) === serviceId ? { ...item, quantity: newQuantity } : item
      );
    }
    updateInvoiceItems(newItems);
  };
  
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsApplyingDiscount(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/apply-discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ code: discountCode, currentTotal: totalAmount })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
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

  const handleFinalizePayment = async () => {
    setIsSubmitting(true);
    setError('');
    if (paymentMethod === 'cash' && amountGiven < finalTotal) {
      setError(`Số tiền khách đưa không đủ. Cần ít nhất ${formatCurrency(finalTotal)}.`);
      setIsSubmitting(false);
      return; 
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          paymentMethod: paymentMethod,
          amountGiven: amountGiven,
          discountCode: appliedDiscount ? appliedDiscount.code : null,
          originalTotal: totalAmount, 
          finalTotal: finalTotal 
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      
      const successMessage = `Thanh toán thành công! Tiền thối: ${formatCurrency(changeAmount)}`;
      onPaymentSuccess({ message: successMessage, type: 'success' });
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Render JSX (Giữ nguyên từ trước)
  return createPortal(
    <div className="payment-modal-overlay">
      <div className="payment-modal-content">
        
        <div className="payment-modal-header">
          <h4 className="modal-title">Lập hóa đơn thanh toán</h4>
          <button type="button" className="btn-close" onClick={onClose} disabled={isSubmitting}></button>
        </div>

        {loading && <div className="modal-loading">Đang tải dữ liệu...</div>}
        {error && !loading && <div className="modal-error alert alert-danger mx-3">{error}</div>}

        {!loading && activeInvoice && (
          <div className="payment-modal-body">
            
            {/* CỘT 1: DANH SÁCH DỊCH VỤ */}
            <div className="service-list-panel">
              <div className="service-search-bar">
                <input
                  type="text"
                  placeholder="Tìm dịch vụ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="service-list-items">
                {filteredServices.length > 0 ? filteredServices.map(service => (
                  <div key={service._id} className="service-item">
                    <div className="service-info">
                      <div className="service-name">{service.name}</div>
                      <div className="service-price">{formatCurrency(service.price)}</div>
                    </div>
                    <button className="service-add-btn" onClick={() => handleAddItem(service)}>
                      <i className="fas fa-plus-circle"></i>
                    </button>
                  </div>
                )) : (
                  <p className='text-center text-muted p-3'>Không tìm thấy dịch vụ.</p>
                )}
              </div>
            </div>
            
            {/* CỘT 2: GIỎ HÀNG & THANH TOÁN */}
            <div className="cart-panel">
              <div className="cart-header">
                <h5>Giỏ hàng (HĐ: {activeInvoice._id.slice(-6)})</h5>
                <p>Bệnh nhân: <strong>{appointment.patient?.basicInfo?.fullName}</strong></p>
              </div>
              
              {/* PHẦN CUỘN CỦA GIỎ HÀNG */}
              <div className="cart-items-list">
                {activeInvoice.items.length === 0 ? (
                  <p className="text-center text-muted p-3">Vui lòng chọn dịch vụ</p>
                ) : (
                  activeInvoice.items.map(item => (
                    <div key={item.item._id || item.item} className="cart-item">
                      <div className="cart-item-info">
                        <span>{item.nameAtPayment}</span>
                        <span>{formatCurrency(item.priceAtPayment)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <button onClick={() => handleUpdateQuantity(item.item._id || item.item, item.quantity - 1)}>-</button>
                        <input type="number" value={item.quantity} readOnly />
                        <button onClick={() => handleUpdateQuantity(item.item._id || item.item, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {/* PHẦN TÓM TẮT (CỐ ĐỊNH Ở DƯỚI) */}
              <div className="payment-summary">
                
                {/* Discount */}
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
                      <button className="btn btn-sm btn-outline-danger" onClick={handleRemoveDiscount}>Xóa</button>
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
                
                {/* Tiền Tạm tính */}
                {appliedDiscount && (
                  <div className="summary-row original-total-row">
                    <span>Tạm tính:</span>
                    <span className="total-amount original-total">{formatCurrency(totalAmount)}</span>
                  </div>
                )}
                {/* Tiền Giảm giá */}
                {appliedDiscount && (
                  <div className="summary-row discount-applied">
                    <span>Giảm ({appliedDiscount.code}):</span>
                    <span>- {formatCurrency(appliedDiscount.discountAmount)}</span>
                  </div>
                )}
                
                {/* Tiền Thành Tiền */}
                <div className="summary-row final-total-row">
                  <strong>{appliedDiscount ? 'Thành tiền:' : 'Tổng cộng:'}</strong>
                  <strong className="total-amount final-total">{formatCurrency(finalTotal)}</strong>
                </div>
                
                <hr className="my-2" />

                {/* Phương thức */}
                <div className="summary-row">
                  <label>Phương thức:</label>
                  <select 
                    className="form-select form-select-sm" 
                    value={paymentMethod} 
                    onChange={e => setPaymentMethod(e.target.value)}
                    disabled={isFetchingQR}
                    style={{ flexBasis: '60%', maxWidth: '250px' }}
                  >
                    <option value="cash">Tiền mặt</option>
                    <option value="transfer">Chuyển khoản</option>
                  </select>
                </div>

                {/* Khối Tiền mặt */}
                {paymentMethod === 'cash' && (
                  <>
                    <div className="summary-row">
                      <label htmlFor="amountGiven">Tiền khách đưa:</label>
                      <input
                        type="number"
                        id="amountGiven"
                        className="form-control form-control-sm"
                        value={amountGiven === 0 ? '' : amountGiven}
                        onChange={e => setAmountGiven(parseFloat(e.target.value) || 0)}
                        onFocus={e => e.target.select()}
                        placeholder="Nhập số tiền..."
                        min="0"
                        style={{ flexBasis: '60%', maxWidth: '250px' }}
                      />
                    </div>
                    <div className="summary-row highlight">
                      <strong>Tiền thối:</strong>
                      <strong className="change-amount">{formatCurrency(changeAmount)}</strong>
                    </div>
                  </>
                )}

                {/* Khối Chuyển khoản */}
                {paymentMethod === 'transfer' && (
                  <div className="transfer-payment-section">
                    {isFetchingQR && <p className="text-center">Đang tạo mã QR...</p>}
                    {qrInfo.qrCodeUrl && !isFetchingQR && (
                      <>
                        <img src={qrInfo.qrCodeUrl} alt="Mã QR thanh toán" className="qr-code-image" />
                        <div className="summary-row w-100">
                          <strong>Số tiền:</strong>
                          <strong>{formatCurrency(qrInfo.amount)}</strong>
                        </div>
                        <div className="summary-row w-100">
                          <strong>Nội dung:</strong>
                          <strong>{qrInfo.memo}</strong>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Nút Chốt */}
                <button 
                  className={`btn w-100 mt-3 btn-finalize-payment ${paymentMethod === 'transfer' ? 'btn-success' : 'btn-primary'}`}
                  onClick={handleFinalizePayment}
                  disabled={isSubmitting || finalTotal === 0 || isFetchingQR}
                >
                  {isSubmitting ? 'Đang xử lý...' : 
                    (paymentMethod === 'transfer' ? 
                      'Xác nhận đã nhận tiền' : 
                      `Hoàn tất thanh toán ${formatCurrency(finalTotal)}`
                    )
                  }
                </button>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default PaymentModal;