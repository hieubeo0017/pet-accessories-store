import ReactDOM from 'react-dom';
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import moment from 'moment-timezone';

const TimeSlotForm = ({ timeSlot, onClose, onSave, isOpen }) => {
  const [formData, setFormData] = useState({
    time_slot: '',
    max_capacity: 3,
    is_active: true
  });
  
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  
  const [loading, setLoading] = useState(false);
  
  const commonHours = ['09', '10', '11', '14', '15', '16', '17'];
  const minuteOptions = ['00', '15', '30', '45'];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (timeSlot) {
      let timeString = timeSlot.time_slot;
      let hourValue = '09';
      let minuteValue = '00';
      
      if (timeString) {
        if (timeString.includes('T')) {
          const timePart = timeString.split('T')[1];
          const parts = timePart.split(':');
          hourValue = parts[0];
          minuteValue = parts[1];
        } else if (timeString.includes(':')) {
          const parts = timeString.split(':');
          hourValue = parts[0];
          minuteValue = parts[1];
        }
      }
      
      setHour(hourValue);
      setMinute(minuteValue);
      
      setFormData({
        ...timeSlot,
        time_slot: `${hourValue}:${minuteValue}`
      });
    }
  }, [timeSlot]);
  
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      time_slot: `${hour}:${minute}`
    }));
  }, [hour, minute]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const preparedData = {
        ...formData,
        max_capacity: parseInt(formData.max_capacity),
        time_slot: `${hour}:${minute}:00`
      };
      
      await onSave(preparedData);
      toast.success(timeSlot ? 'Cập nhật khung giờ thành công' : 'Thêm khung giờ thành công');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{timeSlot ? 'Cập nhật khung giờ' : 'Thêm khung giờ mới'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="time-slot-form">
            <div className="form-group">
              <label>Thời gian</label>
              <div className="time-select-container">
                <select 
                  value={hour} 
                  onChange={(e) => setHour(e.target.value)}
                  className="time-select"
                >
                  {commonHours.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="time-separator">:</span>
                <select 
                  value={minute} 
                  onChange={(e) => setMinute(e.target.value)}
                  className="time-select"
                >
                  {minuteOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="time-display">
                Giờ đã chọn: <strong>{hour}:{minute}</strong>
              </div>
            </div>
            
            <div className="form-group">
              <label>Số chỗ tối đa</label>
              <input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleChange}
                min="1"
                max="20"
                required
              />
            </div>
            
            <div className="checkbox-container">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                id="is_active"
              />
              <label htmlFor="is_active">Đang hoạt động</label>
            </div>
          </form>
        </div>
        
        <div className="modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          
          <button
            type="button"
            className="btn-add"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : (timeSlot ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TimeSlotForm;