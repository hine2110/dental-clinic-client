
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
 // Hoặc import từ StaffAppointments.css

function Toast({ message, type = 'success', onClose }) {
  // Tự động đóng sau 3 giây
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

  return ReactDOM.createPortal(
    <div className={`toast-notification ${type}`}>
      <i className={icon}></i>
      <p>{message}</p>
      <button onClick={onClose} className="toast-close-btn">&times;</button>
    </div>,
    // Chúng ta dùng lại portal của modal để đảm bảo nó nổi lên trên
    document.getElementById('modal-root') 
  );
}

export default Toast;