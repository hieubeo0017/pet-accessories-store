import ReactDOM from 'react-dom';
import { useEffect } from 'react';

const DeleteConfirmationModal = ({ title, message, warningMessage, onConfirm, onCancel }) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{title || 'Xác nhận xóa'}</h3>
          <button 
            className="modal-close" 
            onClick={onCancel}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
          {warningMessage && (
            <p className="warning-message">{warningMessage}</p>
          )}
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
          >
            Hủy
          </button>
          <button 
            className="btn btn-danger" 
            onClick={onConfirm}
          >
            Xóa
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmationModal;