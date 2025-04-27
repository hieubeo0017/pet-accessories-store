import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchSpaServices } from '../../services/spaService';
import { 
  fetchAppointmentById, 
  updateAppointment, 
  fetchTimeSlotAvailability 
} from '../../services/spaAppointmentService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddSpaAppointment.css'; // Dùng chung CSS với trang Add
import { formatTime } from '../../utils/formatters'; // Thêm import này

const EditSpaAppointmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    appointment_date: '',
    appointment_time: '',
    pet_name: '',
    pet_type: 'dog',
    pet_breed: '',
    pet_size: 'small',
    pet_notes: '',
    status: 'pending',
    payment_status: 'pending',
    payment_method: 'cash', // Thêm payment_method với giá trị mặc định
    selected_services: []
  });

  // Tải dữ liệu lịch hẹn và danh sách dịch vụ
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Lấy thông tin lịch hẹn
        const appointmentResult = await fetchAppointmentById(id);
        const appointment = appointmentResult.data;
        
        // Lấy danh sách dịch vụ
        const servicesResult = await fetchSpaServices({ is_active: true });
        setAvailableServices(servicesResult.data || []);
        
        // Đổ dữ liệu lịch hẹn vào form với thời gian đã được chuẩn hóa
        setFormData({
          full_name: appointment.full_name,
          phone_number: appointment.phone_number,
          email: appointment.email || '',
          appointment_date: appointment.appointment_date,
          appointment_time: formatTime(appointment.appointment_time),
          pet_name: appointment.pet_name,
          pet_type: appointment.pet_type,
          pet_breed: appointment.pet_breed || '',
          pet_size: appointment.pet_size,
          pet_notes: appointment.pet_notes || '',
          status: appointment.status,
          payment_status: appointment.payment_status,
          payment_method: appointment.payment_method || 'cash', // Thêm vào đây
          selected_services: appointment.services.map(service => service.service_id)
        });
        
        // Kiểm tra khung giờ khả dụng cho ngày đã chọn
        if (appointment.appointment_date) {
          checkAvailability(new Date(appointment.appointment_date));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Không thể tải dữ liệu lịch hẹn');
        navigate('/spa-appointments');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const selected = [...prev.selected_services];
      
      if (selected.includes(serviceId)) {
        return {
          ...prev,
          selected_services: selected.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prev,
          selected_services: [...selected, serviceId]
        };
      }
    });
  };
  
  const calculateTotal = () => {
    return formData.selected_services.reduce((total, serviceId) => {
      const service = availableServices.find(s => s.id === serviceId);
      return total + (service ? service.price : 0);
    }, 0);
  };
  
  const checkAvailability = async (date) => {
    if (!date) return;
    
    setIsCheckingAvailability(true);
    try {
      // Thay thế cách lấy ngày để tránh vấn đề múi giờ
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      console.log('Ngày đã được format để kiểm tra availability:', formattedDate);
      const result = await fetchTimeSlotAvailability(formattedDate);
      setAvailableSlots(result.data || {});
    } catch (error) {
      console.error('Error checking availability:', error);
      toast.error('Không thể kiểm tra khả dụng khung giờ');
    } finally {
      setIsCheckingAvailability(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.selected_services.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Đảm bảo định dạng ngày đúng là YYYY-MM-DD
      let formattedDate = formData.appointment_date;
      if (formattedDate) {
        // Xử lý nếu ngày đã là đối tượng Date
        if (formattedDate instanceof Date) {
          formattedDate = formattedDate.toISOString().split('T')[0];
        } 
        // Xử lý nếu ngày là chuỗi nhưng không đúng định dạng YYYY-MM-DD
        else if (typeof formattedDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
          // Thử chuyển đổi từ các định dạng khác (dd/mm/yyyy, mm/dd/yyyy, v.v.)
          const dateParts = formattedDate.split(/[-/\.]/);
          if (dateParts.length === 3) {
            // Giả định rằng dateParts có thể là [day, month, year] hoặc [year, month, day]
            if (dateParts[0].length === 4) {
              // Nếu phần đầu tiên là năm (YYYY-MM-DD)
              formattedDate = `${dateParts[0]}-${dateParts[1].padStart(2, '0')}-${dateParts[2].padStart(2, '0')}`;
            } else {
              // Nếu phần đầu tiên là ngày (DD-MM-YYYY)
              formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
            }
          } else {
            // Nếu không thể xác định định dạng, thử tạo từ Date object
            const dateObj = new Date(formattedDate);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toISOString().split('T')[0];
            } else {
              throw new Error("Định dạng ngày không hợp lệ. Vui lòng sử dụng định dạng YYYY-MM-DD");
            }
          }
        }
      }
      
      // Cải thiện xử lý định dạng thời gian
      let formattedTime = formData.appointment_time;
      
      if (formattedTime) {
        // Trường hợp có định dạng ISO
        if (formattedTime.includes('T')) {
          formattedTime = formattedTime.split('T')[1];
        }
        
        // Trường hợp có phần thập phân (từ SQL Server)
        if (formattedTime.includes('.')) {
          formattedTime = formattedTime.split('.')[0];
        }
        
        // Đảm bảo định dạng HH:MM:SS
        const parts = formattedTime.split(':');
        if (parts.length === 2) {
          formattedTime = `${parts[0]}:${parts[1]}:00`;
        } else if (parts.length === 1) {
          formattedTime = `${parts[0]}:00:00`;
        }
      }
      
    //   console.log('Ngày đã chọn để gửi API:', formattedDate);
    //   console.log('Giờ đã chọn để gửi API:', formattedTime);
      
      // Chuẩn bị dữ liệu cập nhật
      const appointmentData = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        email: formData.email || null,
        pet_name: formData.pet_name,
        pet_type: formData.pet_type,
        pet_breed: formData.pet_breed || null,
        pet_size: formData.pet_size,
        pet_notes: formData.pet_notes || null,
        appointment_date: formattedDate,
        appointment_time: formattedTime,
        status: formData.status,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method, // Thêm vào đây
        total_amount: calculateTotal()
      };
      
      // Chuẩn bị danh sách dịch vụ
      const services = formData.selected_services.map(serviceId => {
        const service = availableServices.find(s => s.id === serviceId);
        return {
          service_id: serviceId,
          price: service.price
        };
      });
      
      // Gọi API cập nhật
      await updateAppointment(id, appointmentData, services);
      
      toast.success("Cập nhật lịch hẹn spa thành công");
      navigate(`/spa-appointments/${id}`);
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật lịch hẹn");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }
  
  return (
    <div className="add-spa-appointment page">
      <div className="page-header">
        <h1>Chỉnh sửa lịch hẹn spa</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="appointment-form">
        {/* Form sections giống với AddSpaAppointmentPage */}
        <div className="form-section">
          <h3>Thông tin khách hàng</h3>
          <div className="form-group">
            <label>Họ tên khách hàng <span className="required">*</span></label>
            <input 
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại <span className="required">*</span></label>
              <input 
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        
        {/* Thêm các phần thông tin thú cưng, thời gian, dịch vụ và trạng thái tương tự như AddSpaAppointmentPage */}
        <div className="form-section">
          <h3>Thông tin thú cưng</h3>
          <div className="form-group">
            <label>Tên thú cưng <span className="required">*</span></label>
            <input 
              type="text"
              name="pet_name"
              value={formData.pet_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Loại thú cưng</label>
              <select
                name="pet_type"
                value={formData.pet_type}
                onChange={handleChange}
              >
                <option value="dog">Chó</option>
                <option value="cat">Mèo</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Giống</label>
              <input 
                type="text"
                name="pet_breed"
                value={formData.pet_breed}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Kích thước</label>
            <select
              name="pet_size"
              value={formData.pet_size}
              onChange={handleChange}
            >
              <option value="small">Nhỏ (dưới 10kg)</option>
              <option value="medium">Vừa (10-25kg)</option>
              <option value="large">Lớn (trên 25kg)</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Ghi chú đặc biệt</label>
            <textarea 
              name="pet_notes"
              value={formData.pet_notes}
              onChange={handleChange}
              placeholder="Tình trạng sức khỏe, yêu cầu đặc biệt..."
            ></textarea>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Thời gian</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Ngày hẹn <span className="required">*</span></label>
              <DatePicker
                selected={formData.appointment_date ? new Date(formData.appointment_date) : null}
                onChange={(date) => {
                  setFormData(prev => ({
                    ...prev,
                    appointment_date: date ? 
                      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : 
                      '',
                    appointment_time: '' // Reset giờ khi thay đổi ngày
                  }));
                  if (date) checkAvailability(date);
                }}
                dateFormat="dd/MM/yyyy"
                locale="vi"
                minDate={new Date()}
                placeholderText="dd/mm/yyyy"
                className="form-control"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Giờ hẹn <span className="required">*</span></label>
              {isCheckingAvailability ? (
                <div className="loading-slots">Đang kiểm tra khung giờ khả dụng...</div>
              ) : (
                <div className="time-slots">
                  {Object.keys(availableSlots).length > 0 ? (
                    Object.entries(availableSlots).map(([time, slotInfo]) => {
                      const fullTimeFormat = time.includes(':00') ? time : `${time}:00`;
                      // Cho phép chọn khung giờ hiện tại của lịch hẹn dù khung giờ đó đã đầy
                      const isCurrentTime = formData.appointment_time === fullTimeFormat;
                      const available = isCurrentTime || slotInfo.available > 0;
                      
                      return (
                        <div className="time-slot-container" key={time}>
                          <button
                            type="button"
                            className={`time-slot-btn ${formData.appointment_time === fullTimeFormat ? 'selected' : ''} ${!available ? 'disabled' : ''}`}
                            onClick={() => available && setFormData(prev => ({ ...prev, appointment_time: fullTimeFormat }))}
                            disabled={!available}
                          >
                            {time}
                            {available && <span className="available-tag">{isCurrentTime ? 'Đã chọn' : `${slotInfo.available} chỗ`}</span>}
                          </button>
                          {!available && <span className="full-tag">Đã đầy</span>}
                        </div>
                      );
                    })
                  ) : (
                    <div className="no-slots-message">Không có khung giờ cho ngày này</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>Chọn dịch vụ <span className="required">*</span></h3>
          <div className="service-selection">
            {availableServices.map(service => (
              <div 
                key={service.id}
                className={`service-item ${formData.selected_services.includes(service.id) ? 'selected' : ''}`}
                onClick={() => handleServiceToggle(service.id)}
              >
                <div className="service-checkbox">
                  {formData.selected_services.includes(service.id) && <i className="fas fa-check"></i>}
                </div>
                <div className="service-info">
                  <div className="service-name">{service.name}</div>
                  <div className="service-details">
                    <span className="service-price">{service.price.toLocaleString('vi-VN')}đ</span>
                    <span className="service-duration">{service.duration} phút</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {formData.selected_services.length > 0 && (
            <div className="price-summary">
              <div className="total-label">Tổng tiền:</div>
              <div className="total-price">{calculateTotal().toLocaleString('vi-VN')}đ</div>
            </div>
          )}
        </div>
        
        <div className="form-section">
          <h3>Trạng thái</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Trạng thái đặt lịch</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Trạng thái thanh toán</label>
              <select
                name="payment_status"
                value={formData.payment_status}
                onChange={handleChange}
              >
                <option value="pending">Chưa thanh toán</option>
                <option value="paid">Đã thanh toán</option>
              </select>
            </div>
          </div>
          
          {/* Thêm phương thức thanh toán */}
          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <select
              name="payment_method"
              value={formData.payment_method || 'cash'}
              onChange={handleChange}
            >
              <option value="cash">Tiền mặt</option>
              <option value="vnpay">VNPAY</option>
            </select>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-cancel"
            onClick={() => navigate(`/spa-appointments/${id}`)}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading || submitting || formData.selected_services.length === 0}
          >
            {submitting ? 'Đang xử lý...' : 'Cập nhật lịch hẹn'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditSpaAppointmentPage;