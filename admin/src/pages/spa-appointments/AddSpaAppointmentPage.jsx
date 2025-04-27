import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchSpaServices } from '../../services/spaService'; // Thay thế hàm lấy dịch vụ
import { createAppointment, fetchTimeSlotAvailability } from '../../services/spaAppointmentService'; // Import tất cả từ cùng file
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AddSpaAppointment.css';

const AddSpaAppointmentPage = () => {
  const navigate = useNavigate();
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(false);
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
  
  // Tải danh sách dịch vụ spa từ API
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const result = await fetchSpaServices({ is_active: true });
        setAvailableServices(result.data || []);
      } catch (error) {
        console.error('Error loading spa services:', error);
        toast.error('Không thể tải danh sách dịch vụ');
      } finally {
        setLoading(false);
      }
    };
    
    loadServices();
  }, []);
  
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
        // Xóa nếu đã chọn
        return {
          ...prev,
          selected_services: selected.filter(id => id !== serviceId)
        };
      } else {
        // Thêm nếu chưa chọn
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
      // Sử dụng cùng một cách lấy ngày như EditSpaAppointmentPage
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
  
  // Cập nhật hàm submit để sử dụng API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.selected_services.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Đơn giản hóa: chỉ thêm seconds vào time nếu cần
      let formattedTime = formData.appointment_time;
      
      // Đảm bảo định dạng HH:MM:SS
      if (formattedTime && !formattedTime.endsWith(':00')) {
        formattedTime = formattedTime.includes(':') && formattedTime.split(':').length === 2 
          ? `${formattedTime}:00` 
          : formattedTime;
      }
      
      console.log('Giờ đã chọn để gửi API:', formattedTime);
      
      // Đảm bảo định dạng ngày là YYYY-MM-DD
      let formattedDate = formData.appointment_date;
      if (formattedDate) {
        if (formattedDate instanceof Date) {
          formattedDate = formattedDate.toISOString().split('T')[0];
        } else if (typeof formattedDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
          const dateObj = new Date(formattedDate);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0];
          }
        }
      }
      
      // Chuẩn bị dữ liệu lịch hẹn
      const appointmentData = {
        appointmentData: {
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          email: formData.email || null,
          pet_name: formData.pet_name,
          pet_type: formData.pet_type,
          pet_breed: formData.pet_breed || null,
          pet_size: formData.pet_size,
          pet_notes: formData.pet_notes || null,
          appointment_date: formattedDate, // Sử dụng ngày đã định dạng nhất quán
          appointment_time: formattedTime, // Sử dụng giờ đã định dạng nhất quán
          status: formData.status,
          payment_status: formData.payment_status,
          payment_method: formData.payment_method, // Thêm vào đây
          total_amount: calculateTotal()
        },
        services: formData.selected_services.map(serviceId => {
          const service = availableServices.find(s => s.id === serviceId);
          return {
            service_id: serviceId,
            price: service.price
          };
        })
      };
      
      // Gọi API tạo lịch hẹn
      await createAppointment(appointmentData);
      
      toast.success("Tạo lịch hẹn spa thành công");
      navigate("/spa-appointments");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tạo lịch hẹn");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="add-spa-appointment page">
      <div className="page-header">
        <h1>Thêm lịch hẹn spa mới</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="appointment-form">
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
                      // Format time từ "09:45" thành "09:45:00" để so sánh
                      const fullTimeFormat = time.includes(':00') ? time : `${time}:00`;
                      const available = slotInfo.available > 0;
                      
                      return (
                        <div className="time-slot-container" key={time}>
                          <button
                            type="button"
                            className={`time-slot-btn ${formData.appointment_time === fullTimeFormat ? 'selected' : ''} ${!available ? 'disabled' : ''}`}
                            onClick={() => {
                              if (available) {
                                console.log('Chọn giờ:', fullTimeFormat);
                                setFormData(prev => ({ ...prev, appointment_time: fullTimeFormat }));
                              }
                            }}
                            disabled={!available}
                          >
                            {time}
                            {available && <span className="available-tag">{slotInfo.available} chỗ</span>}
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
          {loading ? (
            <div className="loading">Đang tải danh sách dịch vụ...</div>
          ) : (
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
          )}
          
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
          
          {/* Thay thế phương thức thanh toán */}
          <div className="form-group">
            <label>Phương thức thanh toán</label>
            <select
              name="payment_method"
              value={formData.payment_method}
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
            onClick={() => navigate('/spa-appointments')}
          >
            Hủy
          </button>
          <button 
            type="submit" 
            className="btn-save"
            disabled={loading || submitting || formData.selected_services.length === 0}
          >
            {submitting ? 'Đang xử lý...' : 'Tạo lịch hẹn'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSpaAppointmentPage;