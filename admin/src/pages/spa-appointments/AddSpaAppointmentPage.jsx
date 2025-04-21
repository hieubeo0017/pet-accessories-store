import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { mockSpaServices } from '../../services/spaService';
import './AddSpaAppointment.css';

const AddSpaAppointmentPage = () => {
  const navigate = useNavigate();
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(false);
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
    selected_services: []
  });
  
  // Tải danh sách dịch vụ có sẵn
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setAvailableServices(mockSpaServices);
      setLoading(false);
    }, 500);
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.selected_services.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }
    
    try {
      setLoading(true);
      // Mô phỏng gọi API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success("Tạo lịch hẹn spa thành công");
      navigate("/spa-appointments");
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast.error("Lỗi khi tạo lịch hẹn");
    } finally {
      setLoading(false);
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
              <input 
                type="date"
                name="appointment_date"
                value={formData.appointment_date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Giờ hẹn <span className="required">*</span></label>
              <select
                name="appointment_time"
                value={formData.appointment_time}
                onChange={handleChange}
                required
              >
                <option value="">Chọn giờ</option>
                <option value="09:00:00">09:00</option>
                <option value="10:00:00">10:00</option>
                <option value="11:00:00">11:00</option>
                <option value="14:00:00">14:00</option>
                <option value="15:00:00">15:00</option>
                <option value="16:00:00">16:00</option>
                <option value="17:00:00">17:00</option>
              </select>
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
            disabled={loading || formData.selected_services.length === 0}
          >
            {loading ? 'Đang xử lý...' : 'Tạo lịch hẹn'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSpaAppointmentPage;