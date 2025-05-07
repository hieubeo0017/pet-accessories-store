import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { toast } from 'react-toastify';
import { createSpaPayment, createVnPayUrl, changePaymentMethod } from '../../services/api';
import './PaymentModal.css';

const PaymentModal = ({ appointment, onClose, onSuccess }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState(appointment.total_amount);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [cashPaymentMessage, setCashPaymentMessage] = useState(false);

  // Thiết lập phương thức thanh toán mặc định dựa vào dữ liệu lịch hẹn
  useEffect(() => {
    if (appointment.payment_method === 'cash') {
      // Tự động chọn VNPAY khi đã thanh toán tiền mặt trước đó
      setPaymentMethod('vnpay');
      setCashPaymentMessage(true);
    }
  }, [appointment]);
  
  // Số tiền đã thanh toán (nếu có)
  const paidAmount = 0; // Giả định chưa thanh toán gì
  const remainingAmount = parseFloat(appointment.total_amount) - paidAmount;
  
  // Cập nhật hàm xử lý submit để bao gồm việc đổi phương thức thanh toán
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log(`Đang thực hiện thanh toán với phương thức: ${paymentMethod}`);
    console.log(`Phương thức thanh toán ban đầu của lịch hẹn: ${appointment.payment_method}`);

    if (appointment.payment_method !== paymentMethod) {
      console.log(`Phát hiện thay đổi phương thức thanh toán từ ${appointment.payment_method} sang ${paymentMethod}`);
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    if (parseFloat(amount) > remainingAmount) {
      toast.error(`Số tiền không thể vượt quá số dư cần thanh toán (${remainingAmount.toLocaleString('vi-VN')}đ)`);
      return;
    }
    
    setLoading(true);
    
    // Nếu đang chuyển từ thanh toán tiền mặt sang VNPay
    if (cashPaymentMessage) {
      try {
        // 1. Đổi phương thức thanh toán từ cash sang vnpay
        const changeResult = await changePaymentMethod(appointment.id, 'vnpay');
        
        if (changeResult.success) {
          // 2. Tạo URL thanh toán VNPAY và chuyển hướng
          const redirectUrl = `${window.location.origin}/payment/callback`;
          const vnpayResponse = await createVnPayUrl(
            appointment.id, 
            parseFloat(amount), 
            redirectUrl
          );
          
          if (vnpayResponse.success) {
            // Chuyển hướng đến trang thanh toán VNPAY
            window.location.href = vnpayResponse.paymentUrl;
          } else {
            toast.error('Không thể tạo liên kết thanh toán');
            setLoading(false);
          }
        } else {
          toast.error('Không thể chuyển phương thức thanh toán');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error('Có lỗi xảy ra khi xử lý thanh toán');
        setLoading(false);
      }
    } else {
      // Xử lý như bình thường cho các trường hợp khác
      processPaymentMethod(paymentMethod);
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
          status: 'pending', // Thay đổi từ 'completed' thành 'pending'
          notes: notes || 'Thanh toán tại quầy'
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
          {cashPaymentMessage ? (
            <div className="payment-method-switch" style={{
              backgroundColor: '#f0f9ff',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              borderLeft: '4px solid #0070c9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px', color: '#0070c9' }}></i>
                <span style={{ fontWeight: '500' }}>Chuyển đổi phương thức thanh toán</span>
              </div>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                Lịch hẹn này đã được đặt với phương thức thanh toán tiền mặt. 
                Bạn sẽ thực hiện thanh toán online qua VNPay thay vì thay toán tiền mặt tại cửa hàng.
              </p>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: 'white', 
                padding: '10px',
                borderRadius: '5px',
                marginTop: '10px',
                border: '1px solid #e0e0e0'
              }}>
                <img 
                  src="https://sandbox.vnpayment.vn/paymentv2/images/brands/logo.svg" 
                  alt="VNPAY" 
                  style={{ height: "28px", marginRight: "10px" }}
                />
                <span style={{ fontWeight: '500' }}>Thanh toán VNPay</span>
              </div>
            </div>
          ) : (
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
                  <span>Thanh toán VNPay</span>
                </label>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Số tiền thanh toán</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1000"
              max={remainingAmount}
              required
              disabled={cashPaymentMessage} // Vô hiệu hóa khi đang chuyển từ thanh toán tiền mặt
              className={cashPaymentMessage ? "fixed-amount" : ""}
            />
            {cashPaymentMessage && (
              <p className="amount-notice" style={{
                fontSize: '13px',
                color: '#666',
                marginTop: '5px',
                fontStyle: 'italic'
              }}>
                Khi chuyển đổi từ thanh toán tiền mặt sang online, bạn cần thanh toán toàn bộ số tiền.
              </p>
            )}
          </div>
          
          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thanh toán (nếu có)"
            ></textarea>
          </div>

          <div className="payment-notice" style={{
            backgroundColor: '#fff8e1',
            padding: '12px 15px',
            borderRadius: '4px',
            marginBottom: '15px',
            borderLeft: '4px solid #ffc107'
          }}>
            <p style={{ margin: 0, lineHeight: '1.5' }}>
              <i className="fas fa-info-circle" style={{ marginRight: '8px', color: '#f57f17' }}></i> 
              <strong>Lưu ý:</strong> Sau khi thanh toán thành công với phương thức 
              <strong>{paymentMethod === 'vnpay' ? ' VNPAY' : ' tiền mặt'}</strong>, 
              lịch hẹn sẽ được tự động xác nhận và không thể hủy.
            </p>
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