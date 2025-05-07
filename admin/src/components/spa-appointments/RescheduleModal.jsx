import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { fetchTimeSlotAvailability, rescheduleAppointment } from '../../services/spaAppointmentService';
import { toast } from 'react-toastify';
import './RescheduleModal.css';

const RescheduleModal = ({ appointment, onClose, onSuccess }) => {
  const [rescheduleData, setRescheduleData] = useState({
    date: appointment.appointment_date,
    time: appointment.appointment_time
  });
  
  const [availableSlots, setAvailableSlots] = useState({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (rescheduleData.date) {
      checkAvailability(new Date(rescheduleData.date));
    }
  }, [rescheduleData.date]);
  
  const checkAvailability = async (date) => {
    if (!date) return;
    
    setIsCheckingAvailability(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
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
    
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error('Vui lòng chọn ngày và giờ hẹn mới');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Đảm bảo định dạng ngày là YYYY-MM-DD
      let formattedDate = rescheduleData.date;
      if (formattedDate) {
        // Xử lý nếu ngày là đối tượng Date
        if (formattedDate instanceof Date) {
          formattedDate = formattedDate.toISOString().split('T')[0];
        } 
        // Xử lý nếu ngày là chuỗi nhưng không đúng định dạng YYYY-MM-DD
        else if (typeof formattedDate === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
          // Tạo mới từ Date object
          const dateObj = new Date(formattedDate);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0];
          }
        }
      }
      
      // Đơn giản hóa: chỉ thêm seconds vào time
      const formattedTime = `${rescheduleData.time}:00`;
      
      console.log('Ngày đã chọn để gửi API:', formattedDate);
      console.log('Giờ đã chọn để gửi API:', formattedTime);
      
      await rescheduleAppointment(
        appointment.id, 
        formattedDate,
        formattedTime
      );
      
      onSuccess();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi đổi lịch hẹn');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="modal-overlay">
      <div className="reschedule-modal">
        <div className="modal-header">
          <h3>Đổi lịch hẹn</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <p>Bạn đang đổi lịch hẹn cho <strong>{appointment.pet_name}</strong></p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Ngày hẹn mới <span className="required">*</span></label>
              <DatePicker
                selected={rescheduleData.date ? new Date(rescheduleData.date) : null}
                onChange={(date) => {
                  setRescheduleData(prev => ({
                    ...prev,
                    date: date ? date.toISOString().split('T')[0] : '',
                    time: '' // Reset giờ khi thay đổi ngày
                  }));
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
              <label>Giờ hẹn mới <span className="required">*</span></label>
              {isCheckingAvailability ? (
                <div className="loading-slots">Đang kiểm tra khung giờ khả dụng...</div>
              ) : (
                <div className="time-slots">
                  {Object.entries(availableSlots).map(([time, slotInfo]) => {
                    const isAvailable = slotInfo.available > 0;
                    return (
                      <div 
                        key={time} 
                        className={`time-slot-container ${!isAvailable ? 'time-disabled' : ''}`}
                      >
                        <div
                          className={`time-slot-option ${rescheduleData.time === time ? 'selected' : ''}`}
                          onClick={() => isAvailable && setRescheduleData(prev => ({ ...prev, time }))}
                        >
                          <div className="time">{time}</div>
                          {isAvailable ? (
                            <div className="availability">{slotInfo.available}/{slotInfo.total} chỗ</div>
                          ) : (
                            <div className="full-status">Đã đầy</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-cancel" 
                onClick={onClose}
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                type="submit" 
                className="btn-save"
                disabled={!rescheduleData.date || !rescheduleData.time || submitting}
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận đổi lịch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;