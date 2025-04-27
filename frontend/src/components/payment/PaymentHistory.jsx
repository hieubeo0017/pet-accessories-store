import React, { useState, useEffect } from 'react';
import { getPaymentHistory } from '../../services/api';
import './PaymentHistory.css';

const PaymentHistory = ({ appointmentId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, [appointmentId]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await getPaymentHistory(appointmentId);
      
      if (response.success) {
        setHistory(response.data || []);
      } else {
        setError('Không thể tải lịch sử thanh toán');
      }
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Có lỗi khi tải lịch sử thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN');
  };

  const getPaymentMethodLabel = (method) => {
    switch(method) {
      case 'cash': return 'Tiền mặt';
      case 'bank_transfer': return 'Chuyển khoản';
      case 'vnpay': return 'VNPay';
      case 'e-wallet': return 'Ví điện tử';
      case 'momo': return 'MoMo';
      default: return method;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return { label: 'Đã hoàn thành', className: 'status-completed' };
      case 'pending': return { label: 'Đang xử lý', className: 'status-pending' };
      case 'failed': return { label: 'Thất bại', className: 'status-failed' };
      default: return { label: status, className: '' };
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner-small"></div>
        <p>Đang tải lịch sử thanh toán...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="payment-history">
      {history.length === 0 ? (
        <p className="no-history">Chưa có giao dịch thanh toán nào</p>
      ) : (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Mã giao dịch</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {history.map(payment => {
                const statusInfo = getStatusLabel(payment.status);
                return (
                  <tr key={payment.id}>
                    <td>{payment.id}</td>
                    <td>{getPaymentMethodLabel(payment.payment_method)}</td>
                    <td className="amount">{parseInt(payment.amount).toLocaleString('vi-VN')}đ</td>
                    <td>{formatDateTime(payment.payment_date)}</td>
                    <td>
                      <span className={`status-badge ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="notes">{payment.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;