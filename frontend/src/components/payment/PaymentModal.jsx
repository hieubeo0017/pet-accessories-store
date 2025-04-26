import React, { useState } from 'react';
import Modal from '../common/Modal';
import { toast } from 'react-toastify';
import { createSpaPayment, createVnPayUrl } from '../../services/api';
import './PaymentModal.css';

const PaymentModal = ({ appointment, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState(appointment.total_amount);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Số tiền đã thanh toán (nếu có)
  const paidAmount = 0; // Giả định chưa thanh toán gì
  const remainingAmount = parseFloat(appointment.total_amount) - paidAmount;
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    if (parseFloat(amount) > remainingAmount) {
      toast.error(`Số tiền không thể vượt quá số dư cần thanh toán (${remainingAmount.toLocaleString('vi-VN')}đ)`);
      return;
    }
    
    setLoading(true);
    
    try {
      // Gọi hàm xử lý thanh toán dựa trên phương thức đã chọn
      processPaymentMethod(paymentMethod);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Có lỗi xảy ra khi xử lý thanh toán');
      setLoading(false);
    }
  };
  
  // Tách riêng hàm xử lý thanh toán dựa trên phương thức
  const processPaymentMethod = (method) => {
    const redirectUrl = `${window.location.origin}/payment/callback`;
    
    switch (method) {
      case 'vnpay':
        // Chỉ gọi API VNPay, không gọi API thanh toán cash
        console.log("Xử lý thanh toán VNPay");
        createVnPayUrl(appointment.id, amount, redirectUrl)
          .then(response => {
            if (response.success) {
              console.log("Chuyển hướng đến URL VNPay:", response.paymentUrl);
              window.location.href = response.paymentUrl;
              // Không gọi setLoading(false) vì chúng ta đang rời khỏi trang
            } else {
              toast.error('Không thể tạo liên kết thanh toán');
              setLoading(false);
            }
          })
          .catch(error => {
            console.error('Error creating payment URL:', error);
            toast.error('Có lỗi khi khởi tạo thanh toán online');
            setLoading(false);
          });
        break;
        
      case 'cash':
      default:
        createSpaPayment(appointment.id, {
          amount: parseFloat(amount),
          payment_method: 'cash',
          status: 'completed',
          notes: notes
        })
          .then(handlePaymentSuccess)
          .catch(handlePaymentError);
        break;
    }
  };
  
  // Xử lý thành công
  const handlePaymentSuccess = (response) => {
    if (response.success) {
      toast.success('Thanh toán thành công');
      onSuccess(response.data.appointment);
    } else {
      toast.error(response.message || 'Thanh toán thất bại');
    }
    setLoading(false);
  };
  
  // Xử lý lỗi
  const handlePaymentError = (error) => {
    console.error('Error processing payment:', error);
    toast.error('Có lỗi xảy ra khi xử lý thanh toán');
    setLoading(false);
  };
  
  return (
    <Modal title="Thanh toán" onClose={onClose}>
      <div className="payment-modal">
        <div className="appointment-summary">
          <h3>Thông tin lịch hẹn</h3>
          <p><strong>Mã lịch hẹn:</strong> {appointment.id}</p>
          <p><strong>Khách hàng:</strong> {appointment.full_name}</p>
          <p><strong>Dịch vụ:</strong> {appointment.services && appointment.services.length > 0 
            ? appointment.services.map(s => s.service_name || s.name).join(', ')
            : 'Không có thông tin dịch vụ'}
          </p>
          <p className="total-amount"><strong>Tổng tiền:</strong> {parseInt(appointment.total_amount).toLocaleString('vi-VN')}đ</p>
          
          {paidAmount > 0 && (
            <>
              <p><strong>Đã thanh toán:</strong> {paidAmount.toLocaleString('vi-VN')}đ</p>
              <p><strong>Còn lại:</strong> {remainingAmount.toLocaleString('vi-VN')}đ</p>
            </>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <div className="payment-methods">
              <label className={`payment-method ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={() => setPaymentMethod('cash')}
                />
                <i className="fas fa-money-bill-wave"></i>
                <span>Thanh toán tại quầy</span>
              </label>
              
              <label className={`payment-method ${paymentMethod === 'vnpay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="payment_method"
                  value="vnpay"
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => setPaymentMethod('vnpay')}
                />
                <img 
                  src="https://sandbox.vnpayment.vn/paymentv2/images/brands/logo.svg" 
                  alt="VNPAY" 
                  style={{ maxHeight: "30px" }}
                />
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>Số tiền thanh toán</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              max={remainingAmount}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thanh toán (nếu có)"
            ></textarea>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
                </>
              ) : (
                <>
                  {paymentMethod === 'vnpay' ? 
                    'Tiến hành thanh toán online' : 
                    'Xác nhận thanh toán'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal;