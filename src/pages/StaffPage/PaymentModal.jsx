// src/pages/staff/PaymentModal.jsx
// (ĐÃ SỬA LỖI BUG THÊM/XÓA ITEM VÀ TÍNH TIỀN THỐI)
// (Phiên bản cuối cùng, xử lý item là String hoặc Object)

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './PaymentModal.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// === HELPER FUNCTION (ĐÃ THÊM) ===
// Hàm này giúp lấy ID từ item một cách nhất quán
const getItemId = (item) => {
  if (!item) return null;
  // Nếu item.item là object (do FE thêm vào), lấy item.item._id
  // Nếu item.item là string (do BE trả về), dùng chính nó
  return item.item?._id || item.item; 
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

  // 3. Logic tính toán tiền (Giữ nguyên)
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

  // 4. Tải QR Code (Giữ nguyên)
  useEffect(() => {
    if (paymentMethod === 'transfer' && activeInvoice && finalTotal >= 0) {
      const fetchQrCode = async () => {
        setIsFetchingQR(true);
        setError(''); 
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/generate-qr`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: finalTotal })
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
  }, [paymentMethod, activeInvoice, finalTotal]);


  // ==============================================================
  // === BẮT ĐẦU SỬA LỖI LOGIC GIỎ HÀNG (3 HÀM) ===
  // ==============================================================

  /**
   * (ĐÃ SỬA LỖI 1)
   * Gửi dữ liệu giỏ hàng mới nhất lên server.
   * Đọc 'itemModel' từ cấp ANH EM (sibling) để tạo payload chính xác.
   */
  const updateInvoiceItems = async (newItems) => {
    if (appliedDiscount) {
      handleRemoveDiscount(); 
      setError("Giỏ hàng đã thay đổi, vui lòng nhập lại mã giảm giá.");
    }
    
    // Cập nhật giao diện ngay
    const optimisticInvoice = { ...activeInvoice, items: newItems };
    setActiveInvoice(optimisticInvoice);

    // Tạo payload chuẩn để gửi về BE
    // Cấu trúc `newItems` LÀ: { item: {...} HOẶC "string", itemModel: "...", ... }
    const itemsPayload = newItems.map(item => {
      // Dùng helper function để lấy ID một cách an toàn
      const id = getItemId(item); 
      if (!id || !item.itemModel) {
        // Ghi log lỗi nếu cấu trúc vẫn sai
        console.error("Invalid item structure in updateInvoiceItems:", item);
        return null;
      }
      return {
        itemId: id,
        quantity: item.quantity,
        itemModel: item.itemModel
      };
    }).filter(Boolean); // Lọc bỏ bất kỳ item lỗi nào

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/staff/receptionist/invoices/${activeInvoice._id}/items`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ items: itemsPayload })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      
      // Đồng bộ lại state với dữ liệu chính xác từ server
      // data.data.items lúc này sẽ có item.item là Object (do BE populate)
      setActiveInvoice(data.data);
    } catch (e) {
      setError(e.message);
      // (Nên thêm logic rollback (setActiveInvoice(activeInvoice)) nếu thất bại)
    }
  };

  /**
   * (ĐÃ SỬA LỖI 2)
   * Thêm dịch vụ thủ công (từ cột trái).
   * Tạo item mới với 'itemModel' là ANH EM (sibling) của 'item'.
   */
  const handleAddItem = (service) => {
    // 'service' là đối tượng đầy đủ từ `allServices`
    // (đã bao gồm '_id', 'name', 'price', và 'itemModel')
    
    const existingItem = activeInvoice.items.find(
        // Dùng helper function để so sánh ID một cách an toàn
        item => getItemId(item) === service._id
    );

    let newItems = [];
    if (existingItem) {
      // Nếu đã tồn tại, chỉ tăng số lượng
      newItems = activeInvoice.items.map(item =>
        (getItemId(item) === service._id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      // Nếu chưa có, thêm item mới với cấu trúc CHUẨN
      newItems = [
        ...activeInvoice.items,
        {
          item: service, // <-- `service` là đối tượng đầy đủ
          itemModel: service.itemModel, // <-- QUAN TRỌNG: Thêm 'itemModel' làm anh em
          quantity: 1,
          priceAtPayment: service.price,
          nameAtPayment: service.name // Dùng 'name' (đã chuẩn hóa ở BE)
        }
      ];
    }
    updateInvoiceItems(newItems);
  };

  /**
   * (ĐÃ SỬA LỖI 3)
   * Cập nhật số lượng (tăng/giảm/xóa).
   * Sử dụng logic tìm kiếm `getItemId` nhất quán.
   */
  const handleUpdateQuantity = (serviceId, newQuantity) => {
    let newItems;
    // Logic tìm kiếm nhất quán
    const findLogic = (item) => getItemId(item) === serviceId;

    if (newQuantity <= 0) {
      // Xóa item
      newItems = activeInvoice.items.filter(item => !findLogic(item));
    } else {
      // Cập nhật số lượng
      newItems = activeInvoice.items.map(item =>
        findLogic(item) ? { ...item, quantity: newQuantity } : item
      );
    }
    updateInvoiceItems(newItems);
  };

  // ==============================================================
  // === KẾT THÚC SỬA LỖI LOGIC GIỎ HÀNG ===
  // ==============================================================


  // ... (Các hàm logic khác: apply/remove discount) ...
  
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

  /**
   * (ĐÃ SỬA LỖI 4)
   * Lấy tiền thối 'change' chính xác từ server trả về.
   */
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
      
      // === SỬA LỖI TÍNH TIỀN THỐI ===
      // Lấy tiền thối chính xác từ server trả về (data.data.change)
      const serverChangeAmount = data.data?.change || 0; 
      const successMessage = `Thanh toán thành công! Tiền thối: ${formatCurrency(serverChangeAmount)}`;
      onPaymentSuccess({ message: successMessage, type: 'success' });
      // === KẾT THÚC SỬA LỖI ===

    } catch (e) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Render JSX
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
                  // ==============================================================
                  // === (ĐÃ SỬA LỖI 5) SỬA LỖI JSX RENDER GIỎ HÀNG ===
                  // ==============================================================
                  activeInvoice.items.map(item => {
                    // Dùng helper function để lấy ID
                    const id = getItemId(item);
                    if (!id) return null; // Bỏ qua nếu item bị hỏng
                    
                    return (
                      <div key={id} className="cart-item">
                        <div className="cart-item-info">
                          {/* 'nameAtPayment' được đảm bảo tồn tại */}
                          <span>{item.nameAtPayment}</span>
                          <span>{formatCurrency(item.priceAtPayment)}</span>
                        </div>
                        <div className="cart-item-controls">
                          {/* Dùng 'id' đã lấy được */}
                          <button onClick={() => handleUpdateQuantity(id, item.quantity - 1)}>-</button>
                          <input type="number" value={item.quantity} readOnly />
                          <button onClick={() => handleUpdateQuantity(id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                    );
                  })
                  // ==============================================================
                  // === KẾT THÚC SỬA LỖI JSX RENDER GIỎ HÀNG ===
                  // ==============================================================
                )}
              </div>
              
              {/* PHẦN TÓM TẮT (CỐ ĐỊNH Ở Dưới) */}
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
                  disabled={isSubmitting || (paymentMethod === 'cash' && finalTotal === 0 && amountGiven === 0) || (paymentMethod === 'transfer' && finalTotal === 0) || isFetchingQR}
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