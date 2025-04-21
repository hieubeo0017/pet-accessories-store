import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';
import { toast } from 'react-toastify';
import './SpaAppointmentsPage.css';

const SpaAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: '',
    time: '',
  });

  // Form tìm kiếm
  const [searchParams, setSearchParams] = useState({
    type: 'phone', // 'phone', 'email', hoặc 'bookingId'
    value: ''
  });
  const [showSearchForm, setShowSearchForm] = useState(!localStorage.getItem('customerInfo'));

  useEffect(() => {
    // Kiểm tra nếu có thông tin khách hàng
    const customerInfo = localStorage.getItem('customerInfo');
    if (customerInfo) {
      const info = JSON.parse(customerInfo);
      loadAppointments(info);
      setShowSearchForm(false);
    } else {
      setShowSearchForm(true);
      setLoading(false); // Thêm dòng này để dừng loading khi hiển thị form tìm kiếm
    }
  }, []);

  const loadAppointments = async (customerInfo = null) => {
    try {
      setLoading(true);
      
      // Mock data thay vì gọi API thật
      setTimeout(() => {
        const mockAppointments = [
          {
            id: 'APT-001',
            pet_name: 'Lucky',
            pet_type: 'dog',
            pet_breed: 'Golden Retriever',
            appointment_date: '2025-04-30',
            appointment_time: '10:00',
            services: [
              { id: '1', name: 'Tắm và vệ sinh', price: '250000' },
              { id: '2', name: 'Cắt tỉa lông', price: '350000' },
            ],
            status: 'confirmed',
            total_amount: '600000',
            can_cancel: true,
            can_reschedule: true,
            can_review: false,
          },
          {
            id: 'APT-002',
            pet_name: 'Milo',
            pet_type: 'cat',
            pet_breed: 'Persian',
            appointment_date: '2025-04-20',
            appointment_time: '15:00',
            services: [
              { id: '4', name: 'Tẩy lông rụng', price: '200000' },
            ],
            status: 'completed',
            total_amount: '200000',
            can_cancel: false,
            can_reschedule: false,
            can_review: true,
          },
          {
            id: 'APT-003',
            pet_name: 'Bella',
            pet_type: 'dog',
            pet_breed: 'Poodle',
            appointment_date: '2025-05-05',
            appointment_time: '09:00',
            services: [
              { id: '3', name: 'Massage và đắp mặt nạ', price: '300000' },
              { id: '7', name: 'Làm sạch tai', price: '120000' },
            ],
            status: 'pending',
            total_amount: '420000',
            can_cancel: true,
            can_reschedule: true,
            can_review: false,
          }
        ];
        
        setAppointments(mockAppointments);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Không thể tải dữ liệu lịch hẹn');
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchParams.value) {
      toast.error('Vui lòng nhập thông tin tìm kiếm');
      return;
    }
    
    // Mô phỏng bằng dữ liệu mẫu
    if (searchParams.type === 'phone' && searchParams.value === '0987654321') {
      const mockCustomerInfo = {
        name: 'Khách hàng',
        phone: '0987654321'
      };
      localStorage.setItem('customerInfo', JSON.stringify(mockCustomerInfo));
      loadAppointments(mockCustomerInfo);
      setShowSearchForm(false);
    } else {
      toast.error('Không tìm thấy lịch hẹn nào');
    }
  };

  const handleCancelRequest = (id) => {
    setSelectedAppointmentId(id);
    setShowCancelModal(true);
  };

  const handleRescheduleRequest = (id) => {
    const appointment = appointments.find(apt => apt.id === id);
    setSelectedAppointmentId(id);
    setRescheduleData({
      date: appointment.appointment_date,
      time: appointment.appointment_time,
    });
    setShowRescheduleModal(true);
  };

  const handleCancelConfirm = async () => {
    try {
      // Giả lập API call
      // await cancelSpaAppointment(selectedAppointmentId);
      
      // Cập nhật state để hiển thị kết quả ngay lập tức
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointmentId 
          ? { ...apt, status: 'cancelled', can_cancel: false, can_reschedule: false } 
          : apt
      ));
      
      toast.success('Hủy lịch hẹn thành công');
      setShowCancelModal(false);
    } catch (err) {
      toast.error('Không thể hủy lịch hẹn. Vui lòng thử lại sau.');
      console.error('Error cancelling appointment:', err);
    }
  };

  const handleRescheduleChange = (e) => {
    const { name, value } = e.target;
    setRescheduleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRescheduleConfirm = async () => {
    try {
      // Giả lập API call
      // await rescheduleSpaAppointment(selectedAppointmentId, rescheduleData);
      
      // Cập nhật state để hiển thị kết quả ngay lập tức
      setAppointments(appointments.map(apt => 
        apt.id === selectedAppointmentId 
          ? { 
              ...apt, 
              appointment_date: rescheduleData.date, 
              appointment_time: rescheduleData.time,
              status: 'rescheduled' 
            } 
          : apt
      ));
      
      toast.success('Đổi lịch hẹn thành công');
      setShowRescheduleModal(false);
    } catch (err) {
      toast.error('Không thể đổi lịch hẹn. Vui lòng thử lại sau.');
      console.error('Error rescheduling appointment:', err);
    }
  };

  // Format giá tiền VND
  const formatPrice = (price) => {
    return parseInt(price).toLocaleString('vi-VN') + 'đ';
  };

  // Format trạng thái lịch hẹn
  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending':
        return { label: 'Chờ xác nhận', className: 'status-pending' };
      case 'confirmed':
        return { label: 'Đã xác nhận', className: 'status-confirmed' };
      case 'completed':
        return { label: 'Đã hoàn thành', className: 'status-completed' };
      case 'cancelled':
        return { label: 'Đã hủy', className: 'status-cancelled' };
      case 'rescheduled':
        return { label: 'Đã đổi lịch', className: 'status-rescheduled' };
      default:
        return { label: status, className: '' };
    }
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu lịch hẹn...</p>
      </div>
    );
  }

  return (
    <div className="spa-appointments-page">
      <div className="page-header">
        <h1>Lịch hẹn spa của bạn</h1>
        <p>Quản lý tất cả các lịch hẹn chăm sóc thú cưng</p>
      </div>

      {showSearchForm ? (
        <div className="search-appointments-form">
          <div className="form-container">
            <h2>Tìm kiếm lịch hẹn của bạn</h2>
            <p>Nhập thông tin để tìm kiếm lịch hẹn của bạn</p>
            
            <form onSubmit={handleSearch}>
              <div className="form-group">
                <label>Tìm kiếm bằng:</label>
                <div className="search-options">
                  <label>
                    <input
                      type="radio"
                      name="searchType"
                      value="phone"
                      checked={searchParams.type === 'phone'}
                      onChange={() => setSearchParams({...searchParams, type: 'phone'})}
                    />
                    Số điện thoại
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="searchType"
                      value="email"
                      checked={searchParams.type === 'email'}
                      onChange={() => setSearchParams({...searchParams, type: 'email'})}
                    />
                    Email
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="searchType"
                      value="bookingId"
                      checked={searchParams.type === 'bookingId'}
                      onChange={() => setSearchParams({...searchParams, type: 'bookingId'})}
                    />
                    Mã đặt lịch
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <input
                  type={searchParams.type === 'email' ? 'email' : 'text'}
                  placeholder={searchParams.type === 'phone' ? 'Nhập số điện thoại' : 
                              searchParams.type === 'email' ? 'Nhập email' : 'Nhập mã đặt lịch'}
                  value={searchParams.value}
                  onChange={(e) => setSearchParams({...searchParams, value: e.target.value})}
                  required
                />
              </div>
              
              <button type="submit" className="btn-primary">Tìm kiếm</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="appointments-container">
          {error ? (
            <div className="error-message">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="no-appointments">
              <div className="empty-state">
                <i className="fas fa-calendar-times"></i>
                <h3>Bạn chưa có lịch hẹn nào</h3>
                <p>Hãy đặt lịch để chăm sóc thú cưng của bạn ngay hôm nay!</p>
                <Link to="/spa/booking" className="btn-primary">Đặt lịch ngay</Link>
              </div>
            </div>
          ) : (
            <div className="appointments-list">
              {appointments.map(appointment => {
                const statusInfo = getStatusLabel(appointment.status);
                return (
                  <div key={appointment.id} className="appointment-card">
                    <div className="appointment-header">
                      <div className="appointment-id">#{appointment.id}</div>
                      <div className={`appointment-status ${statusInfo.className}`}>
                        {statusInfo.label}
                      </div>
                    </div>
                    
                    <div className="appointment-details">
                      <div className="appointment-info">
                        <h3>Thông tin thú cưng</h3>
                        <p><strong>Tên:</strong> {appointment.pet_name}</p>
                        <p><strong>Loài:</strong> {appointment.pet_type === 'dog' ? 'Chó' : 'Mèo'}</p>
                        <p><strong>Giống:</strong> {appointment.pet_breed}</p>
                      </div>
                      
                      <div className="appointment-schedule">
                        <h3>Lịch hẹn</h3>
                        <p><strong>Ngày:</strong> {formatDate(appointment.appointment_date)}</p>
                        <p><strong>Giờ:</strong> {appointment.appointment_time}</p>
                      </div>
                    </div>
                    
                    <div className="appointment-services">
                      <h3>Dịch vụ đã đặt</h3>
                      <ul>
                        {appointment.services.map(service => (
                          <li key={service.id}>
                            <span className="service-name">{service.name}</span>
                            <span className="service-price">{formatPrice(service.price)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="appointment-total">
                        <strong>Tổng cộng:</strong> {formatPrice(appointment.total_amount)}
                      </div>
                    </div>
                    
                    <div className="appointment-actions">
                      {appointment.can_cancel && (
                        <button 
                          className="btn-cancel"
                          onClick={() => handleCancelRequest(appointment.id)}
                        >
                          <i className="fas fa-times-circle"></i> Hủy lịch hẹn
                        </button>
                      )}
                      
                      {appointment.can_reschedule && (
                        <button 
                          className="btn-reschedule"
                          onClick={() => handleRescheduleRequest(appointment.id)}
                        >
                          <i className="fas fa-calendar-alt"></i> Đổi lịch hẹn
                        </button>
                      )}
                      
                      {appointment.can_review && (
                        <Link 
                          to={`/spa/review/${appointment.id}`} 
                          className="btn-review"
                        >
                          <i className="fas fa-star"></i> Đánh giá
                        </Link>
                      )}
                      
                      <Link 
                        to={`/spa/appointment/${appointment.id}`} 
                        className="btn-details"
                      >
                        <i className="fas fa-info-circle"></i> Chi tiết
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Nút đăng xuất chỉ hiển thị khi đã đăng nhập */}
      {!showSearchForm && (
        <button 
          className="forget-info-btn"
          onClick={() => {
            localStorage.removeItem('customerInfo');
            setShowSearchForm(true);
            setAppointments([]);
          }}
        >
          Đăng xuất / Tìm kiếm lịch hẹn khác
        </button>
      )}

      {/* Modal xác nhận hủy lịch hẹn */}
      {showCancelModal && (
        <Modal
          title="Xác nhận hủy lịch hẹn"
          onClose={() => setShowCancelModal(false)}
        >
          <div className="cancel-modal-content">
            <p>Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
            <p className="warning-text">Lưu ý: Việc hủy lịch hẹn trước 24 giờ sẽ không bị tính phí. Nếu hủy trong vòng 24 giờ trước thời điểm hẹn, bạn có thể bị tính phí hủy.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowCancelModal(false)}
              >
                Không
              </button>
              <button 
                className="btn-primary" 
                onClick={handleCancelConfirm}
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal đổi lịch hẹn */}
      {showRescheduleModal && (
        <Modal
          title="Đổi lịch hẹn"
          onClose={() => setShowRescheduleModal(false)}
        >
          <div className="reschedule-modal-content">
            <p>Vui lòng chọn thời gian mới cho lịch hẹn của bạn:</p>
            <div className="form-group">
              <label>Ngày</label>
              <input 
                type="date" 
                name="date" 
                value={rescheduleData.date}
                onChange={handleRescheduleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Giờ</label>
              <select 
                name="time" 
                value={rescheduleData.time}
                onChange={handleRescheduleChange}
              >
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
              </select>
            </div>
            <p className="info-text">Lưu ý: Việc đổi lịch hẹn cần được thực hiện trước 24 giờ so với thời gian đã đặt.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRescheduleModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-primary" 
                onClick={handleRescheduleConfirm}
              >
                Xác nhận đổi lịch
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SpaAppointmentsPage;