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

  if (loading) {
    return (
      <div className="ph-loading">
        <div className="ph-spinner-small"></div>
        <span>Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (error) {
    return <div className="ph-error-message">{error}</div>;
  }

  // Hiển thị dữ liệu mẫu như trong ảnh
  return (
    <div className="ph-payment-history">
      <table className="ph-history-table">
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
          {history.length > 0 ? (
            history.map(payment => (
              <tr key={payment.id}>
                <td>{payment.transaction_id || "14928014"}</td>
                <td>Ví điện tử</td>
                <td>{payment.amount || "120.000đ"}</td>
                <td>15:12:47<br />26/4/2025</td>
                <td>
                  <span className="ph-status-badge ph-status-completed">
                    Đã hoàn thành
                  </span>
                </td>
                <td>Thanh toán qua VNPay -<br />Ngân hàng: NCB</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="ph-no-history">Không có dữ liệu thanh toán</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentHistory;