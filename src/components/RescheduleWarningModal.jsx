
import React from 'react';
import { createPortal } from 'react-dom';
import './RescheduleWarningModal.css'; 

function RescheduleWarningModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="warning-modal-overlay" onClick={onClose}>
      <div className="warning-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="warning-modal-header">
          <h3 className="warning-modal-title">⚠️ Reschedule Warning</h3>
          <button onClick={onClose} className="warning-modal-close-btn">&times;</button>
        </div>
        <div className="warning-modal-body">
          <p>Are you sure you want to reschedule this appointment?</p>
          <p className="warning-text">
            <strong>Note:</strong> You can only reschedule this appointment <strong>once</strong>.
          </p>
        </div>
        <div className="warning-modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger">
            Confirm Reschedule
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default RescheduleWarningModal;