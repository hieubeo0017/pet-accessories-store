import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './PaymentCallbackPage.css';
import { confirmVnpayPayment } from '../services/api';

const PaymentCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xử lý thanh toán...');
  const [paymentDetails, setPaymentDetails] = useState(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const responseCode = params.get('vnp_ResponseCode');
    const transactionNo = params.get('vnp_TransactionNo');
    
    if (responseCode === '00') {
      // Thanh toán thành công
      setStatus('success');
      setMessage('Thanh toán của bạn đã được xác nhận thành công.');
      
      // Gọi API xác nhận thanh toán
      confirmVnpayPayment(params)
        .then(result => console.log('Payment confirmed:', result))
        .catch(err => console.error('Backend confirmation failed:', err));
      
      // Lưu thông tin vào localStorage để cập nhật UI
      localStorage.setItem('paymentSuccess', JSON.stringify({
        appointmentId: extractAppointmentId(params.get('vnp_OrderInfo')),
        timestamp: new Date().getTime(),
        transactionNo: transactionNo
      }));
      
      // Chuyển về trang lịch hẹn sau 3 giây
      setTimeout(() => {
        const appointmentId = extractAppointmentId(params.get('vnp_OrderInfo'));
        if (appointmentId) {
          navigate(`/spa/booking/confirmation/${appointmentId}`);
        } else {
          navigate('/spa/appointments');
        }
      }, 3000);
    } else {
      // Thanh toán thất bại
      setStatus('error');
      setMessage('Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.');
    }
  }, [location.search, navigate]);
  
  return (
    <div className="payment-callback-page">
      <div className={`callback-container ${status}`}>
        {status === 'processing' && <div className="spinner"></div>}
        
        {status === 'success' && <div className="success-icon"><i className="fas fa-check-circle"></i></div>}
        
        {status === 'error' && <div className="error-icon"><i className="fas fa-times-circle"></i></div>}
        
        <h2>{status === 'success' ? 'Thanh toán thành công' : 
             status === 'error' ? 'Thanh toán thất bại' : 
             'Đang xử lý thanh toán'}</h2>
        
        <p className="message">{message}</p>
        
        {paymentDetails && paymentDetails.appointmentId && (
          <div className="payment-details">
            <p className="appointment-id">Mã lịch hẹn: {paymentDetails.appointmentId}</p>
            {paymentDetails.amount > 0 && (
              <p className="amount">Số tiền: {paymentDetails.amount.toLocaleString('vi-VN')}đ</p>
            )}
            {paymentDetails.transactionNo && (
              <p className="transaction">Mã giao dịch: {paymentDetails.transactionNo}</p>
            )}
            {paymentDetails.bankCode && (
              <p className="bank">Ngân hàng: {paymentDetails.bankCode}</p>
            )}
          </div>
        )}
        
        <div className="actions">
          <button 
            className="btn-primary" 
            onClick={() => navigate('/spa/appointments')}
          >
            Quay lại trang lịch hẹn
          </button>
        </div>
      </div>
    </div>
  );
};

// Hàm trích xuất appointment_id giữ nguyên
const extractAppointmentId = (orderInfo) => {
  if (!orderInfo) return '';
  
  // Trích xuất ID từ chuỗi "THANHTOANAPTXXXX"
  const match = orderInfo.match(/THANHTOAN(APT\d+)/i) || orderInfo.match(/(APT-\d+)/i);
  if (match && match[1]) {
    // Đảm bảo ID có định dạng APT-XXXX
    let id = match[1];
    if (!id.includes('-')) {
      id = id.replace(/^(APT)(\d+)$/i, 'APT-$2');
    }
    return id;
  }
  
  return '';
};

export default PaymentCallbackPage;