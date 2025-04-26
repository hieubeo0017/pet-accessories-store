import { useState } from 'react';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';

const AppointmentDetailPanel = ({ appointment, onStatusUpdate, onPaymentUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleStatusChange = async (status) => {
    try {
      setIsUpdating(true);
      await onStatusUpdate(status);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePaymentStatusChange = async (status) => {
    try {
      setIsUpdating(true);
      await onPaymentUpdate(status);
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };
  
  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'completed': return 'Đã hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };
  
  return (
    <div className="appointment-detail-panel">
      <div className="panel-section">
        <h3>Thông tin lịch hẹn</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Mã lịch hẹn:</span>
            <span className="value">{appointment.id}</span>
          </div>
          <div className="info-item">
            <span className="label">Ngày hẹn:</span>
            <span className="value">{formatDate(appointment.appointment_date)}</span>
          </div>
          <div className="info-item">
            <span className="label">Giờ hẹn:</span>
            <span className="value">{formatTime(appointment.appointment_time)}</span>
          </div>
          <div className="info-item">
            <span className="label">Trạng thái:</span>
            <span className={`value status ${getStatusClass(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Thanh toán:</span>
            <span className={`value payment-status ${appointment.payment_status === 'paid' ? 'status-completed' : 'status-pending'}`}>
              {appointment.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Tổng tiền:</span>
            <span className="value price">{formatCurrency(appointment.total_amount)} VNĐ</span>
          </div>
        </div>
      </div>
      
      <div className="panel-section">
        <h3>Thông tin thú cưng</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Tên thú cưng:</span>
            <span className="value">{appointment.pet_name}</span>
          </div>
          <div className="info-item">
            <span className="label">Loại thú cưng:</span>
            <span className="value">{appointment.pet_type === 'dog' ? 'Chó' : 'Mèo'}</span>
          </div>
          <div className="info-item">
            <span className="label">Giống:</span>
            <span className="value">{appointment.pet_breed || 'Không có thông tin'}</span>
          </div>
          <div className="info-item">
            <span className="label">Kích thước:</span>
            <span className="value">
              {appointment.pet_size === 'small' ? 'Nhỏ (dưới 10kg)' : 
               appointment.pet_size === 'medium' ? 'Vừa (10-25kg)' : 'Lớn (trên 25kg)'}
            </span>
          </div>
          {appointment.pet_notes && (
            <div className="info-item full-width">
              <span className="label">Ghi chú:</span>
              <span className="value">{appointment.pet_notes}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="panel-section">
        <h3>Thông tin khách hàng</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Họ tên:</span>
            <span className="value">{appointment.full_name}</span>
          </div>
          <div className="info-item">
            <span className="label">Số điện thoại:</span>
            <span className="value">{appointment.phone_number}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{appointment.email || 'Không có thông tin'}</span>
          </div>
        </div>
      </div>
      
      <div className="action-controls">
        <div className="status-controls">
          <h4>Cập nhật trạng thái lịch hẹn</h4>
          <div className="button-group">
            <button 
              onClick={() => handleStatusChange('confirmed')} 
              className={`btn-status confirmed ${appointment.status === 'confirmed' ? 'active' : ''}`}
              disabled={isUpdating || ['completed', 'cancelled'].includes(appointment.status)}
            >
              Xác nhận
            </button>
            <button 
              onClick={() => handleStatusChange('completed')} 
              className={`btn-status completed ${appointment.status === 'completed' ? 'active' : ''}`}
              disabled={isUpdating || appointment.status === 'cancelled'}
            >
              Hoàn thành
            </button>
            <button 
              onClick={() => handleStatusChange('cancelled')} 
              className={`btn-status cancelled ${appointment.status === 'cancelled' ? 'active' : ''}`}
              disabled={isUpdating || appointment.status === 'completed'}
            >
              Hủy lịch
            </button>
          </div>
        </div>
        
        <div className="payment-controls">
          <h4>Cập nhật trạng thái thanh toán</h4>
          <div className="button-group">
            <button 
              onClick={() => handlePaymentStatusChange('pending')} 
              className={`btn-payment pending ${appointment.payment_status === 'pending' ? 'active' : ''}`}
              disabled={isUpdating}
            >
              Chưa thanh toán
            </button>
            <button 
              onClick={() => handlePaymentStatusChange('paid')} 
              className={`btn-payment paid ${appointment.payment_status === 'paid' ? 'active' : ''}`}
              disabled={isUpdating}
            >
              Đã thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailPanel;