import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/common/Modal';
import { toast } from 'react-toastify';
import { 
  searchAppointments, 
  cancelSpaAppointment, 
  rescheduleSpaAppointment,
  restoreSpaAppointment,
  fetchSpaTimeSlotAvailability,
  createSpaPayment,
  createVnPayUrl,
  getPaymentHistory
} from '../services/api';
import DatePicker, { registerLocale } from 'react-datepicker';
import vi from 'date-fns/locale/vi';
import "react-datepicker/dist/react-datepicker.css";
import './SpaAppointmentsPage.css';
import PaymentModal from '../components/payment/PaymentModal';
import PaymentHistory from '../components/payment/PaymentHistory';

// Đăng ký locale tiếng Việt
registerLocale("vi", vi);

// Thêm hàm tiện ích này ở đầu component để dễ debug
const logAppointmentDetails = (appointment) => {
  console.log('Chi tiết lịch hẹn:');
  console.log(`- ID: ${appointment.id || appointment.appointment_id}`);
  console.log(`- Ngày: ${appointment.appointment_date}`);
  console.log(`- Giờ: ${appointment.appointment_time}`);
  console.log(`- Ngày hiển thị: ${appointment.formatted_date || formatDate(appointment.appointment_date)}`);
  console.log(`- Giờ hiển thị: ${appointment.formatted_time || formatTime(appointment.appointment_time)}`);
};

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
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState({});
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmReschedule, setConfirmReschedule] = useState(false);
  const [originalAppointment, setOriginalAppointment] = useState({
    date: '',
    time: '',
    formatted_date: '',
    formatted_time: ''
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedAppointmentForPayment, setSelectedAppointmentForPayment] = useState(null);

  // Form tìm kiếm
  const [searchParams, setSearchParams] = useState({
    type: 'phone', // 'phone', 'email', hoặc 'bookingId'
    value: ''
  });
  const [showSearchForm, setShowSearchForm] = useState(!localStorage.getItem('customerInfo'));

  useEffect(() => {
    // Kiểm tra nếu có thông tin khách hàng
    const customerInfo = localStorage.getItem('customerInfo');
    
    // Kiểm tra nếu vừa hoàn thành thanh toán
    const paymentSuccess = localStorage.getItem('paymentSuccess');
    
    if (customerInfo) {
      const info = JSON.parse(customerInfo);
      loadAppointments(info);
      setShowSearchForm(false);
      
      
      
    } else {
      setShowSearchForm(true);
      setLoading(false); // Thêm dòng này để dừng loading khi hiển thị form tìm kiếm
    }
  }, []);

  // Thay thế hàm loadAppointments bằng phiên bản dùng API thật
  const loadAppointments = async (customerInfo = null) => {
    try {
      setLoading(true);
      
      if (!customerInfo) {
        setLoading(false);
        return;
      }
      
      // Xác định loại và giá trị tìm kiếm từ thông tin khách hàng
      let searchType = 'phone';
      let searchValue = '';
      
      if (customerInfo.phone) {
        searchType = 'phone';
        searchValue = customerInfo.phone;
      } else if (customerInfo.email) {
        searchType = 'email';
        searchValue = customerInfo.email;
      } else if (customerInfo.bookingId) {
        searchType = 'bookingId';
        searchValue = customerInfo.bookingId;
      } else {
        setLoading(false);
        return;
      }
      
      // Gọi API tìm kiếm
      const response = await searchAppointments({
        type: searchType,
        value: searchValue
      });
      
      if (response.success && response.data) {
        setAppointments(response.data);
      } else {
        setError('Không tìm thấy lịch hẹn nào');
      }
      
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Không thể tải dữ liệu lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  // Thêm hàm validation trước khi submit
  const validateSearchInput = () => {
    const { type, value } = searchParams;
    
    if (!value || value.trim() === '') {
      toast.error('Vui lòng nhập thông tin tìm kiếm');
      return false;
    }
    
    // Validate phone number
    if (type === 'phone' && !/^[0-9]{10,11}$/.test(value)) {
      toast.error('Số điện thoại không hợp lệ. Vui lòng nhập 10-11 chữ số');
      return false;
    }
    
    // Validate email
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('Email không hợp lệ');
      return false;
    }
    
    // Validate booking ID
    if (type === 'bookingId' && !/^[A-Z]+-\d{4}$/.test(value)) {
      toast.error('Mã đặt lịch không hợp lệ. Định dạng: APT-XXXX');
      return false;
    }
    
    return true;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!validateSearchInput()) {
      return;
    }
    
    try {
      setIsSearching(true);
      setError(null); // Reset lỗi trước khi tìm kiếm
      
      // Tạo payload để gửi đến API
      const searchData = {
        type: searchParams.type,
        value: searchParams.value
      };
      
      // Gọi API tìm kiếm
      const response = await searchAppointments(searchData);
      
      if (response.success && response.data && response.data.length > 0) {
        // Lưu thông tin khách hàng vào localStorage
        const customerInfo = {
          name: response.data[0].full_name || 'Khách hàng',
          [searchParams.type]: searchParams.value
        };
        localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
        
        // Cập nhật danh sách lịch hẹn
        setAppointments(response.data);
        setShowSearchForm(false);
        toast.success('Tìm thấy lịch hẹn của bạn');
      } else {
        toast.error('Không tìm thấy lịch hẹn nào với thông tin này');
      }
    } catch (err) {
      console.error('Error searching appointments:', err);
      setError('Không thể tìm kiếm lịch hẹn. Vui lòng thử lại sau.');
      toast.error('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.');
    } finally {
      setIsSearching(false);
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

  const handleRestoreRequest = (id) => {
    setSelectedAppointmentId(id);
    setShowRestoreModal(true);
  };

  const handleCancelConfirm = async () => {
    try {
      setLoading(true);
      console.log('Bắt đầu hủy lịch hẹn với ID:', selectedAppointmentId);
      
      // Gọi API hủy lịch hẹn
      const response = await cancelSpaAppointment(selectedAppointmentId);
      
      console.log('Phản hồi từ API hủy lịch:', response);
      
      // Kiểm tra đúng định dạng response từ API
      if (response && response.data) {
        // Lấy trạng thái trực tiếp từ dữ liệu phản hồi API
        const actualStatus = response.data.status;
        
        console.log('Trạng thái mới từ API:', actualStatus);
        
        // Cập nhật trạng thái trong danh sách appointments
        const newAppointments = appointments.map(apt => {
          if (apt.id === selectedAppointmentId || apt.appointment_id === selectedAppointmentId) {
            console.log('Đang cập nhật trạng thái lịch hẹn từ:', apt.status, 'thành:', actualStatus);
            return { 
              ...apt, 
              status: actualStatus, 
              can_cancel: false, 
              can_reschedule: false 
            };
          }
          return apt;
        });
        
        // Cập nhật state
        setAppointments(newAppointments);
        
        // Hiển thị thông báo thành công
        toast.success('Hủy lịch hẹn thành công');
        
        // Force re-render để đảm bảo UI được cập nhật
        setTimeout(() => {
          // Sử dụng hàm callback trong setState để đảm bảo sử dụng state mới nhất
          setAppointments(current => [...current]);
        }, 100);
      } else {
        toast.error('Không thể hủy lịch hẹn');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      toast.error('Không thể hủy lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setShowCancelModal(false);
    }
  };

  const handleRescheduleChange = (e) => {
    const { name, value } = e.target;
    setRescheduleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRescheduleClick = (id) => {
    const appointment = appointments.find(apt => 
      apt.id === id || apt.appointment_id === id
    );
    
    if (appointment) {
      // Sử dụng ID chính xác từ đối tượng lịch hẹn (ưu tiên id hơn appointment_id)
      const actualId = appointment.id || appointment.appointment_id;
      console.log('ID lịch hẹn cần đổi:', actualId);
      
      setSelectedAppointmentId(actualId);
      
      // Lưu thông tin lịch hẹn gốc
      setOriginalAppointment({
        date: appointment.appointment_date,
        time: appointment.appointment_time && appointment.appointment_time.substring(0, 5),
        formatted_date: formatDate(appointment.appointment_date),
        formatted_time: formatTime(appointment.appointment_time)
      });
      
      // Chuyển đổi string date thành Date object
      const appointmentDate = appointment.appointment_date ? new Date(appointment.appointment_date) : null;
      setSelectedDate(appointmentDate);
      
      setRescheduleData({
        date: appointment.appointment_date,
        time: appointment.appointment_time && appointment.appointment_time.substring(0, 5)
      });
      
      // Lấy danh sách giờ khả dụng khi mở modal
      if (appointmentDate) {
        fetchAvailableTimeSlots(appointmentDate);
      }
      
      // Reset trạng thái xác nhận
      setConfirmReschedule(false);
      setShowRescheduleModal(true);
    } else {
      toast.error('Không tìm thấy thông tin lịch hẹn');
    }
  };

  const handleProceedToConfirm = () => {
    // Kiểm tra xem đã chọn đủ thông tin chưa
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error('Vui lòng chọn ngày và giờ mới');
      return;
    }
    
    // Chuyển sang bước xác nhận
    setConfirmReschedule(true);
  };

  const handleRescheduleConfirm = async () => {
    try {
      setLoading(true);
      console.log('Bắt đầu đổi lịch với dữ liệu:', rescheduleData);
      
      // Gọi API đổi lịch hẹn
      const response = await rescheduleSpaAppointment(selectedAppointmentId, rescheduleData);
      
      if (response.success) {
        toast.success('Đổi lịch hẹn thành công');
        
        // Lấy dữ liệu đã cập nhật từ response API
        const updatedAppointment = response.data;
        
        // Cập nhật trực tiếp state appointments với dữ liệu mới
        setAppointments(prevAppointments => {
          return prevAppointments.map(apt => 
            (apt.id === selectedAppointmentId || apt.appointment_id === selectedAppointmentId)
              ? {
                  ...apt,
                  appointment_date: updatedAppointment.appointment_date || rescheduleData.date,
                  appointment_time: updatedAppointment.appointment_time || 
                    (rescheduleData.time.includes(':00') ? rescheduleData.time : `${rescheduleData.time}:00`),
                  formatted_date: formatDate(updatedAppointment.appointment_date || rescheduleData.date),
                  formatted_time: formatTime(updatedAppointment.appointment_time || rescheduleData.time),
                  status: updatedAppointment.status || 'rescheduled'
                }
              : apt
          );
        });
      } else {
        toast.error(response.message || 'Không thể đổi lịch hẹn');
      }
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
      toast.error('Không thể đổi lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setConfirmReschedule(false);
      setShowRescheduleModal(false);
    }
  };
  
  const handleRestoreConfirm = async () => {
    try {
      setLoading(true);
      // Gọi API khôi phục lịch hẹn thực tế
      const response = await restoreSpaAppointment(selectedAppointmentId);
      
      if (response.success) {
        // Cập nhật danh sách lịch hẹn
        const updatedAppointments = appointments.map(apt => 
          apt.id === selectedAppointmentId || apt.appointment_id === selectedAppointmentId
            ? { ...apt, status: 'pending', can_cancel: true, can_reschedule: true } 
            : apt
        );
        setAppointments(updatedAppointments);
        toast.success('Khôi phục lịch hẹn thành công');
      } else {
        toast.error(response.message || 'Không thể khôi phục lịch hẹn');
      }
    } catch (err) {
      console.error('Error restoring appointment:', err);
      toast.error('Không thể khôi phục lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      setShowRestoreModal(false);
    }
  };

  const handlePaymentClick = (appointment) => {
    setSelectedAppointmentForPayment(appointment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (updatedAppointment) => {
    // Cập nhật danh sách lịch hẹn với thông tin thanh toán mới
    setAppointments(prevAppointments => {
      return prevAppointments.map(apt => 
        (apt.id === updatedAppointment.id || apt.appointment_id === updatedAppointment.id)
          ? { ...apt, payment_status: updatedAppointment.payment_status }
          : apt
      );
    });
    
    setShowPaymentModal(false);
  };

  const handlePaymentHistoryClick = (appointment) => {
    setSelectedAppointmentForPayment(appointment);
    setShowPaymentHistory(true);
  };

  // Thêm các hàm xử lý sự kiện cho các nút
  const handleCancelClick = (id) => {
    // Tìm đối tượng lịch hẹn trong danh sách
    const appointment = appointments.find(apt => 
      apt.id === id || apt.appointment_id === id
    );
    
    if (appointment) {
      // Sử dụng ID chính xác từ đối tượng lịch hẹn (ưu tiên id hơn appointment_id)
      const actualId = appointment.id || appointment.appointment_id;
      console.log('ID lịch hẹn cần hủy:', actualId);
      
      // Lưu ID chính xác vào state
      setSelectedAppointmentId(actualId);
      setShowCancelModal(true);
    } else {
      toast.error('Không tìm thấy thông tin lịch hẹn');
    }
  };

  const handleReviewClick = (id) => {
    // Chuyển hướng đến trang đánh giá
    window.location.href = `/spa/review/${id}`;
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
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Format giờ
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    try {
      // Xử lý định dạng ISO (có T)
      if (timeString.includes('T')) {
        const timePart = timeString.split('T')[1];
        const parts = timePart.split(':');
        return `${parts[0]}:${parts[1]}`;
      }
      
      // Xử lý dạng HH:MM:SS
      if (timeString.includes(':')) {
        const parts = timeString.split(':');
        return `${parts[0]}:${parts[1]}`;
      }
      
      return timeString;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  // Hàm để lấy placeholder phù hợp
  const getPlaceholder = () => {
    switch(searchParams.type) {
      case 'phone': 
        return 'Nhập số điện thoại (VD: 0987654321)';
      case 'email': 
        return 'Nhập email (VD: example@gmail.com)';
      case 'bookingId': 
        return 'Nhập mã đặt lịch (VD: APT-0001)';
      default: 
        return 'Nhập thông tin tìm kiếm';
    }
  };

  const fetchAvailableTimeSlots = async (date) => {
    if (!date) return;
    
    try {
      setIsLoadingTimeSlots(true);
      
      // Format ngày đúng cách để tránh vấn đề múi giờ
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log('Kiểm tra khả dụng cho ngày:', formattedDate);
      
      // Gọi API lấy khung giờ khả dụng
      const response = await fetchSpaTimeSlotAvailability(formattedDate);
      
      if (response.success && response.data) {
        setAvailableTimeSlots(response.data);
        
        // Tự động chọn khung giờ đầu tiên có chỗ trống
        const availableTimes = Object.entries(response.data)
          .filter(([_, info]) => info.available > 0)
          .map(([time]) => time);
          
        if (availableTimes.length > 0) {
          setRescheduleData(prev => ({
            ...prev,
            time: availableTimes[0]
          }));
        } else {
          setRescheduleData(prev => ({
            ...prev,
            time: ''
          }));
        }
      } else {
        setAvailableTimeSlots({});
        toast.error('Không tìm thấy khung giờ khả dụng cho ngày đã chọn');
      }
    } catch (error) {
      console.error('Lỗi khi lấy khung giờ khả dụng:', error);
      toast.error('Không thể kiểm tra khung giờ khả dụng');
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    
    if (date) {
      // Format ngày để lưu vào state
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      setRescheduleData(prev => ({
        ...prev,
        date: formattedDate
      }));
      
      // Lấy khung giờ khả dụng cho ngày mới
      fetchAvailableTimeSlots(date);
    }
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
                  placeholder={getPlaceholder()}
                  value={searchParams.value}
                  onChange={(e) => setSearchParams({...searchParams, value: e.target.value})}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                  className="btn-primary"
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Đang tìm...
                  </>
                ) : 'Tìm kiếm'}
              </button>
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
              {appointments.map((appointment, index) => (
                <div className="appointment-card" key={appointment.id || appointment.appointment_id || `appointment-${index}`}>
                  <div className="appointment-header">
                    <h3>Mã đặt lịch: {appointment.id || appointment.appointment_id}</h3>
                    {(() => {
                      const statusInfo = getStatusLabel(appointment.status);
                      return (
                        <span className={`status-badge ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                  </div>
                  
                  <div className="appointment-details">
                    <div className="pet-info">
                      <h4>Thông tin thú cưng</h4>
                      <p><strong>Tên:</strong> {appointment.pet_name}</p>
                      <p><strong>Loại:</strong> {appointment.pet_type === 'dog' ? 'Chó' : 'Mèo'}</p>
                      <p><strong>Giống:</strong> {appointment.pet_breed || 'Không có thông tin'}</p>
                      <p><strong>Kích thước:</strong> {
                        appointment.pet_size === 'small' ? 'Nhỏ (dưới 10kg)' : 
                        appointment.pet_size === 'medium' ? 'Vừa (10-25kg)' : 'Lớn (trên 25kg)'
                      }</p>
                    </div>

                    <div className="appointment-time">
                      <h4>Lịch hẹn</h4>
                      <p><strong>Ngày:</strong> {appointment.formatted_date || formatDate(appointment.appointment_date)}</p>
                      <p><strong>Giờ:</strong> {appointment.formatted_time || formatTime(appointment.appointment_time)}</p>
                    </div>
                    
                    <div className="services-list">
                      <h4>Dịch vụ đã đặt</h4>
                      {appointment.services && appointment.services.length > 0 ? (
                        <ul>
                          {appointment.services.map(service => {
                            // Xác định icon phù hợp với loại dịch vụ
                            const getServiceIcon = (serviceName) => {
                              // Kiểm tra xem serviceName có tồn tại không
                              if (!serviceName) return 'fa-paw'; // Icon mặc định nếu không có tên dịch vụ
                              
                              const name = serviceName.toLowerCase();
                              if (name.includes('tắm') || name.includes('vệ sinh')) return 'fa-shower';
                              if (name.includes('cắt') || name.includes('tỉa')) return 'fa-cut';
                              if (name.includes('spa') || name.includes('massage')) return 'fa-spa';
                              if (name.includes('nhuộm')) return 'fa-palette';
                              if (name.includes('khám') || name.includes('điều trị')) return 'fa-stethoscope';
                              if (name.includes('học') || name.includes('huấn luyện')) return 'fa-graduation-cap';
                              return 'fa-paw';
                            };
                            
                            return (
                              <li key={service.id || service.service_id} className="service-item">
                                <div className="service-info">
                                  <span className="service-name">
                                    <i className={`fas ${getServiceIcon(service.service_name || service.name)}`}></i>
                                    {service.service_name || service.name || 'Dịch vụ không xác định'}
                                  </span>
                                  <div className="service-details">
                                    {service.duration && (
                                      <span className="service-duration">
                                        <i className="far fa-clock"></i>
                                        {service.duration} phút
                                      </span>
                                    )}
                                    <span className="service-type">
                                      {service.pet_type === 'dog' ? 'Dành cho chó' : 
                                       service.pet_type === 'cat' ? 'Dành cho mèo' : 'Mọi loại thú cưng'}
                                    </span>
                                  </div>
                                </div>
                                <span className="service-price">{parseInt(service.price).toLocaleString('vi-VN')}đ</span>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="no-services">Không có dịch vụ nào</p>
                      )}
                    </div>

                    <div className="total-amount-container">
                      <p className="total-amount">
                        <strong>Tổng tiền:</strong> 
                        <span>{parseInt(appointment.total_amount).toLocaleString('vi-VN')}đ</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="appointment-actions">
                    {/* Chỉ hiển thị button đổi lịch khi có thể đổi lịch và không ở trạng thái completed */}
                    {(appointment.can_reschedule || appointment.status === 'confirmed') && appointment.status !== 'completed' && (
                      <button className="btn-reschedule" onClick={() => handleRescheduleClick(appointment.appointment_id)}>
                        Đổi lịch
                      </button>
                    )}
                    
                    {/* Chỉ hiển thị button hủy lịch khi trạng thái là pending và chưa thanh toán HOẶC thanh toán tiền mặt */}
                    {appointment.status === 'pending' && 
                      (appointment.payment_status !== 'paid' || appointment.payment_method === 'cash') && (
                      <button className="btn-cancel" onClick={() => handleCancelClick(appointment.appointment_id)}>
                        Hủy lịch
                      </button>
                    )}
                    
                    {/* Chỉ hiển thị button đánh giá khi ở trạng thái completed */}
                    {(appointment.can_review || appointment.status === 'completed') && (
                      <button className="btn-review" onClick={() => handleReviewClick(appointment.appointment_id)}>
                        Đánh giá
                      </button>
                    )}

                    {/* Chỉ hiển thị nút thanh toán khi lịch hẹn chưa hủy và chưa thanh toán */}
                    {appointment.status !== 'cancelled' && appointment.payment_status !== 'paid' && (
                      <button className="btn-payment" onClick={() => handlePaymentClick(appointment)}>
                        <i className="fas fa-credit-card"></i> 
                        {appointment.payment_method === 'cash' ? 'Thanh toán online' : 'Thanh toán'}
                      </button>
                    )}

                    {/* Luôn hiển thị nút lịch sử thanh toán */}
                    <button className="btn-history" onClick={() => handlePaymentHistoryClick(appointment)}>
                      <i className="fas fa-history"></i> Lịch sử thanh toán
                    </button>
                  </div>
                </div>
              ))}
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
          title={confirmReschedule ? "Xác nhận đổi lịch hẹn" : "Đổi lịch hẹn"}
          onClose={() => {
            setShowRescheduleModal(false);
            setConfirmReschedule(false);
          }}
        >
          <div className="reschedule-modal-content">
            {!confirmReschedule ? (
              <>
                <p>Vui lòng chọn thời gian mới cho lịch hẹn của bạn:</p>
                <div className="form-group">
                  <label>Ngày</label>
                  <div className="date-picker-container">
                    <DatePicker
                      selected={selectedDate}
                      onChange={handleDateChange}
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      locale="vi"
                      placeholderText="Chọn ngày"
                      className="form-control"
                      isClearable
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      todayButton="Hôm nay"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Giờ</label>
                  {isLoadingTimeSlots ? (
                    <div className="loading-time-slots">
                      <div className="spinner-small"></div>
                      <p>Đang tải khung giờ trống...</p>
                    </div>
                  ) : (
                    <>
                      {Object.keys(availableTimeSlots).length > 0 ? (
                        <div className="time-slots-selection">
                          {Object.entries(availableTimeSlots).map(([time, info]) => (
                            <div 
                              key={time} 
                              className={`time-slot-option ${rescheduleData.time === time ? 'selected' : ''} ${info.available <= 0 ? 'disabled' : ''}`}
                              onClick={() => info.available > 0 && setRescheduleData(prev => ({ ...prev, time }))}
                            >
                              <span className="time">{time}</span>
                              {info.available > 0 ? (
                                <span className="availability">{info.available}/{info.total} chỗ</span>
                              ) : (
                                <span className="full-tag">Đã đầy</span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-slots-message">Không có khung giờ khả dụng cho ngày đã chọn</p>
                      )}
                    </>
                  )}
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
                    onClick={handleProceedToConfirm}
                    disabled={!rescheduleData.date || !rescheduleData.time || isLoadingTimeSlots}
                  >
                    Tiếp tục
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="reschedule-confirmation">
                  <div className="comparison-container">
                    <div className="appointment-comparison horizontal-layout">
                      <div className="original-appointment">
                        <h4>Lịch hẹn hiện tại</h4>
                        <div className="appointment-details">
                          <div className="detail-row">
                            <p className="detail-label"><strong>Ngày:</strong></p>
                            <p className="detail-value">{originalAppointment.formatted_date}</p>
                          </div>
                          <div className="detail-row">
                            <p className="detail-label"><strong>Giờ:</strong></p>
                            <p className="detail-value">{originalAppointment.formatted_time}</p>
                          </div>
                        </div>
                      </div>
                      <div className="arrow-icon">
                        <i className="fas fa-long-arrow-alt-right"></i>
                      </div>
                      <div className="new-appointment">
                        <h4>Lịch hẹn mới</h4>
                        <div className="appointment-details">
                          <div className="detail-row">
                            <p className="detail-label"><strong>Ngày:</strong></p>
                            <p className="detail-value">{selectedDate ? formatDate(selectedDate) : ''}</p>
                          </div>
                          <div className="detail-row">
                            <p className="detail-label"><strong>Giờ:</strong></p>
                            <p className="detail-value">{rescheduleData.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="confirm-text">Bạn có chắc chắn muốn đổi lịch hẹn sang thời gian mới không?</p>
                  <div className="modal-actions">
                    <button 
                      className="btn-secondary" 
                      onClick={() => setConfirmReschedule(false)}
                    >
                      Quay lại
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={handleRescheduleConfirm}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
                        </>
                      ) : 'Xác nhận đổi lịch'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* Modal xác nhận khôi phục lịch hẹn */}
      {showRestoreModal && (
        <Modal
          title="Xác nhận khôi phục lịch hẹn"
          onClose={() => setShowRestoreModal(false)}
        >
          <div className="restore-modal-content">
            <p>Bạn có chắc chắn muốn khôi phục lịch hẹn này không?</p>
            <p className="info-text">Lịch hẹn sẽ được chuyển về trạng thái chờ xác nhận.</p>
            <div className="modal-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRestoreModal(false)}
              >
                Không
              </button>
              <button 
                className="btn-primary" 
                onClick={handleRestoreConfirm}
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal thanh toán */}
      {showPaymentModal && selectedAppointmentForPayment && (
        <PaymentModal
          appointment={selectedAppointmentForPayment}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal lịch sử thanh toán */}
      {showPaymentHistory && selectedAppointmentForPayment && (
        <Modal 
          title="Lịch sử thanh toán" 
          onClose={() => setShowPaymentHistory(false)}
        >
          <PaymentHistory appointmentId={selectedAppointmentForPayment.id} />
        </Modal>
      )}
    </div>
  );
};

export default SpaAppointmentsPage;