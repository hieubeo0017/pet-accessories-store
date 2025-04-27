import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAppointmentDetails, fetchSpaServiceById } from '../services/api';
import './SpaBookingConfirmation.css';

const SpaBookingConfirmation = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [serviceDetails, setServiceDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cuộn lên đầu trang khi trang được tải
    window.scrollTo(0, 0);
    
    // Code khác...
  }, []);

  useEffect(() => {
    const loadAppointmentDetails = async () => {
      try {
        setLoading(true);
        const response = await getAppointmentDetails(id);
        const appointmentData = response.data;
        setAppointment(appointmentData);
        
        // Tải thông tin chi tiết về dịch vụ
        if (appointmentData?.services && Array.isArray(appointmentData.services)) {
          try {
            // Lấy thông tin chi tiết cho từng dịch vụ
            const servicesData = await Promise.all(
              appointmentData.services.map(async (service) => {
                try {
                  const serviceResponse = await fetchSpaServiceById(service.service_id);
                  console.log('Service response:', serviceResponse);
                  
                  // Kiểm tra cấu trúc dữ liệu và truy xuất tên dịch vụ linh hoạt hơn
                  return {
                    ...service,
                    name: serviceResponse.name || serviceResponse.data?.name || service.service_name || `Dịch vụ ${service.service_id}`
                  };
                } catch (err) {
                  console.error(`Error fetching service ${service.service_id}:`, err);
                  return {
                    ...service,
                    name: service.service_name || `Dịch vụ ${service.service_id.replace(/^SPA-/, '')}`,
                  };
                }
              })
            );
            setServiceDetails(servicesData);
          } catch (err) {
            console.error('Error loading service details:', err);
          }
        }
      } catch (err) {
        console.error('Error loading appointment details:', err);
        setError('Không thể tải thông tin lịch hẹn');
      } finally {
        setLoading(false);
      }
    };

    loadAppointmentDetails();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Format giờ hẹn từ định dạng ISO về HH:MM đẹp hơn
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Đảm bảo timeString là chuỗi
    const timeStr = String(timeString);
    
    // Kiểm tra xem giờ có phải là định dạng ISO date đầy đủ không
    if (timeStr.includes('T')) {
      // Lấy phần giờ từ chuỗi ISO mà không tạo đối tượng Date để tránh chuyển đổi múi giờ
      const timePart = timeStr.split('T')[1].split('.')[0];
      const [hour, minute] = timePart.split(':');
      return `${hour}:${minute}`;
    }
    
    // Xử lý định dạng HH:MM:SS (loại bỏ seconds)
    if (timeStr.includes(':')) {
      return timeStr.split(':').slice(0, 2).join(':');
    }
    
    return timeStr;
  };

  const formatPrice = (price) => {
    return parseInt(price).toLocaleString('vi-VN') + 'đ';
  };

  if (loading) {
    return (
      <div className="booking-confirmation-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="booking-confirmation-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Không thể tải thông tin đặt lịch</h2>
        <p>{error || 'Có lỗi xảy ra. Vui lòng kiểm tra mã đặt lịch.'}</p>
        <Link to="/spa/services" className="btn-primary">Quay lại trang dịch vụ</Link>
      </div>
    );
  }

  return (
    <div className="booking-confirmation-page">
      <div className="confirmation-container">
        <div className="confirmation-header">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h1>Đặt lịch thành công!</h1>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi</p>
        </div>
        
        <div className="confirmation-details">
          <div className="confirmation-info">
            <h2>Chi tiết đặt lịch</h2>
            <div className="booking-detail-row">
              <span className="label">Mã đặt lịch:</span>
              <span className="value">{appointment.id}</span>
            </div>
            <div className="booking-detail-row">
              <span className="label">Ngày hẹn:</span>
              <span className="value">{formatDate(appointment.appointment_date)}</span>
            </div>
            <div className="booking-detail-row">
              <span className="label">Giờ hẹn:</span>
              <span className="value">{formatTime(appointment.appointment_time)}</span>
            </div>
            <div className="booking-detail-row">
              <span className="label">Trạng thái:</span>
              <span className="value status-badge confirmed">Đã xác nhận</span>
            </div>
            <div className="booking-detail-row">
              <span className="label">Phương thức thanh toán:</span>
              <span className="value">
                {appointment.payment_method === 'cash' ? 'Tiền mặt' : 
                 appointment.payment_method === 'vnpay' || appointment.payment_method === 'e-wallet' ? 'VNPAY' : 
                 'Chưa xác định'}
              </span>
            </div>
          </div>
          
          <div className="confirmation-services">
            <h2>Dịch vụ đã chọn</h2>
            <div className="services-list">
              {serviceDetails.length > 0 ? (
                serviceDetails.map((service, index) => (
                  <div key={index} className="service-item">
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">{formatPrice(service.price)}</span>
                  </div>
                ))
              ) : appointment.services && Array.isArray(appointment.services) ? (
                appointment.services.map((service, index) => (
                  <div key={index} className="service-item">
                    <span className="service-name">{service.service_name || `Dịch vụ #${service.service_id}`}</span>
                    <span className="service-price">{formatPrice(service.price)}</span>
                  </div>
                ))
              ) : (
                <div className="no-services">Không có thông tin dịch vụ</div>
              )}
            </div>
            <div className="total-row">
              <span className="total-label">Tổng cộng:</span>
              <span className="total-value">{formatPrice(appointment.total_amount)}</span>
            </div>
          </div>
          
          <div className="confirmation-instructions">
            <h2>Thông tin quan trọng</h2>
            <ul>
              <li>Chúng tôi sẽ gọi điện xác nhận lịch hẹn trong vòng 30 phút.</li>
              <li>Vui lòng đến trước giờ hẹn 10-15 phút để hoàn tất thủ tục đăng ký.</li>
              <li>Bạn có thể hủy hoặc đổi lịch hẹn trước 24 giờ.</li>
              <li>Mọi thắc mắc xin liên hệ: <strong>1900 1234</strong></li>
            </ul>
          </div>
        </div>
        
        <div className="confirmation-actions">
          {/* Thêm console.log để kiểm tra giá trị thực tế của status */}
          {console.log("Trạng thái lịch hẹn:", appointment.status, typeof appointment.status)}
          
          {/* Điều kiện linh hoạt hơn để hiển thị nút đánh giá */}
          {(appointment.status === 'completed' || 
            appointment.status?.toLowerCase() === 'completed' || 
            appointment.status?.toLowerCase().includes('hoàn thành')) && (
            <Link to={`/spa/review/${appointment.id}`} className="btn-review-appointment">
              <i className="fas fa-star"></i> Đánh giá dịch vụ
            </Link>
          )}
          <Link to="/spa/appointments" className="btn-view-appointments">
            <i className="fas fa-calendar-alt"></i> Xem lịch hẹn của tôi
          </Link>
          <Link to="/" className="btn-back-home">
            <i className="fas fa-home"></i> Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SpaBookingConfirmation;