import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSpaServices, createSpaAppointment, fetchBreeds, fetchSpaTimeSlotAvailability, createVnPayUrl, createSpaPayment } from '../services/api';
import EmailAuth from '../components/auth/EmailAuth';
import DatePicker, { registerLocale } from 'react-datepicker';
import { vi } from 'date-fns/locale/vi';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Đăng ký locale tiếng Việt
registerLocale('vi', vi);

import './SpaBookingPage.css';

const SpaBookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const preSelectedServiceId = queryParams.get('service');

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    petName: '',
    petType: 'dog',
    petBreed: '',
    petSize: 'small',
    petNotes: '',
    appointmentDate: '',
    appointmentTime: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    selectedServices: preSelectedServiceId ? [preSelectedServiceId] : []
  });

  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // State cho xác thực email
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailUser, setEmailUser] = useState(null);

  const [startDate, setStartDate] = useState(null);

  // State cho danh sách giống
  const [breeds, setBreeds] = useState([]);
  const [isLoadingBreeds, setIsLoadingBreeds] = useState(false);

  // State cho khung giờ
  const [availableTimeSlots, setAvailableTimeSlots] = useState({});
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);

  // Thêm state cho phần thanh toán
  const [paymentMethod, setPaymentMethod] = useState('vnpay'); // Mặc định là VNPay
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [appointmentCreated, setAppointmentCreated] = useState(null);
  const [paymentNotes, setPaymentNotes] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        // Gọi API thực thay vì dùng mock data
        const response = await fetchSpaServices();
        setServices(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching spa services:', error);
        setError('Không thể tải dịch vụ spa');
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  useEffect(() => {
    const loadBreeds = async () => {
      if (!formData.petType) return;
      
      try {
        setIsLoadingBreeds(true);
        const response = await fetchBreeds(formData.petType);
        
        // Kiểm tra và xử lý dữ liệu
        if (response && response.data && Array.isArray(response.data)) {
          const breedOptions = response.data.map(breed => ({ value: breed, label: breed }));
          setBreeds(breedOptions);
        } else if (response && response.data && Array.isArray(response.data.data)) {
          // Trường hợp API trả về { data: [...] }
          const breedOptions = response.data.data.map(breed => ({ value: breed, label: breed }));
          setBreeds(breedOptions);
        } else {
          console.error('Unexpected API response format:', response);
          setBreeds([]);
        }
      } catch (error) {
        console.error('Error loading breeds:', error);
        setBreeds([]);
      } finally {
        setIsLoadingBreeds(false);
      }
    };
    
    loadBreeds();
  }, [formData.petType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    if (date) {
      // Tạo ngày mới không phụ thuộc vào timezone
      const localDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0
      );
      
      // Lưu ngày vào state dưới định dạng ISO string YYYY-MM-DD
      const formattedDate = localDate.toISOString().split('T')[0];
      setStartDate(localDate);
      setFormData(prev => ({
        ...prev,
        appointmentDate: formattedDate
      }));
      
      // Gọi API kiểm tra khung giờ khả dụng
      checkAvailability(formattedDate);
    } else {
      setStartDate(null);
      setFormData(prev => ({
        ...prev,
        appointmentDate: '',
        appointmentTime: '' // Reset giờ khi xóa ngày
      }));
      setAvailableTimeSlots({}); // Xóa danh sách khung giờ
    }
  };

  const checkAvailability = async (date) => {
    setIsLoadingTimeSlots(true);
    try {
      const response = await fetchSpaTimeSlotAvailability(date);
      console.log('API response in component:', response);
      
      if (response && response.success && response.data) {
        // Đảm bảo lưu trực tiếp object data từ API
        setAvailableTimeSlots(response.data);
        console.log('Time slots set to state:', response.data);
      } else {
        console.warn('No time slots data found in response');
        setAvailableTimeSlots({});
      }
    } catch (error) {
      console.error('Error checking time slot availability:', error);
      toast.error('Không thể kiểm tra khung giờ trống');
      setAvailableTimeSlots({});
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const selectedServices = [...prev.selectedServices];
      
      if (selectedServices.includes(serviceId)) {
        return {
          ...prev,
          selectedServices: selectedServices.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prev,
          selectedServices: [...selectedServices, serviceId]
        };
      }
    });
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({
      ...prev,
      appointmentTime: time
    }));
  };

  const nextStep = () => {
    // Kiểm tra validation cho step 1
    if (currentStep === 1) {
      // Kiểm tra các trường bắt buộc
      if (!formData.petName.trim()) {
        toast.error('Vui lòng nhập tên thú cưng');
        return;
      }
      
      // Kiểm tra giống thú cưng
      if (!formData.petBreed.trim()) {
        toast.error('Vui lòng chọn hoặc nhập giống thú cưng');
        return;
      }
      
      // Các trường petType và petSize đã có giá trị mặc định nên không cần kiểm tra
      // petNotes không bắt buộc nên cũng không cần kiểm tra
    }
    
    // Nếu đã pass tất cả validation, chuyển sang bước tiếp theo
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleProceedToBooking = (e) => {
    e.preventDefault();
    
    if (!emailVerified) {
      // Hiển thị form xác thực nếu chưa xác thực email
      if (!formData.email || !validateEmail(formData.email)) {
        toast.error('Vui lòng nhập địa chỉ email hợp lệ để xác thực');
        return;
      }
      setShowEmailAuth(true);
    } else {
      // Nếu email đã xác thực, tạo lịch hẹn và chuyển sang bước thanh toán
      handleSubmitBooking();
    }
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handlePhoneVerified = (user) => {
    setFirebaseUser(user);
    setPhoneVerified(true);
    setShowPhoneAuth(false);
  };

  const handleEmailVerified = (user) => {
    setEmailUser(user || { email: formData.email });  // Lấy email từ form
    setEmailVerified(true);
    setShowEmailAuth(false);
    
    // Hiển thị thông báo thành công (nếu có toast)
    if (typeof toast !== 'undefined') {
      toast.success("Email đã được xác thực thành công!");
    }
  };

  const handleSubmitBooking = async () => {
    try {
      toast.info('Đang xử lý đặt lịch...');
      
      // Đảm bảo định dạng ngày là YYYY-MM-DD
      let formattedDate = formData.appointmentDate;
      if (formData.appointmentDate) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.appointmentDate)) {
          const dateObj = new Date(formData.appointmentDate);
          formattedDate = dateObj.toISOString().split('T')[0];
        }
      }

      // Đảm bảo định dạng thời gian là HH:MM:SS
      let formattedTime = formData.appointmentTime;
      if (formData.appointmentTime) {
        // Đảm bảo định dạng giờ đúng với chuẩn ISO
        formattedTime = formData.appointmentTime + ':00';
      }
      
      // Tính tổng tiền
      const totalAmount = formData.selectedServices.reduce((total, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return total + (service ? parseInt(service.price) : 0);
      }, 0);
      
      // Chuẩn bị dữ liệu
      const appointmentData = {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        email: formData.email,
        pet_name: formData.petName,
        pet_type: formData.petType,
        pet_breed: formData.petBreed || '',
        pet_size: formData.petSize,
        pet_notes: formData.petNotes || '',
        appointment_date: formattedDate,
        appointment_time: formattedTime,
        payment_status: 'pending',
        status: 'pending',
        total_amount: totalAmount,
        payment_method: paymentMethod // 'cash' hoặc 'vnpay'
      };
      
      // Gọi API đặt lịch
      const response = await createSpaAppointment({ 
        appointmentData, 
        services: formData.selectedServices.map(serviceId => ({
          service_id: serviceId,
          price: services.find(s => s.id === serviceId)?.price || 0
        }))
      });
      
      // Lưu thông tin lịch hẹn vừa tạo
      const appointmentId = response.data.data.id;
      setAppointmentCreated({
        id: appointmentId,
        ...appointmentData
      });
      
      // Chuyển đến bước thanh toán
      nextStep();
      
    } catch (error) {
      console.error('Lỗi khi đặt lịch:', error);
      
      if (error.response) {
        console.error('Thông tin phản hồi từ server:', error.response.data);
        toast.error(error.response.data.message || 'Có lỗi xảy ra khi đặt lịch');
      } else {
        toast.error('Không thể kết nối đến server. Vui lòng thử lại sau.');
      }
    }
  };
  
  const handleProcessPayment = async () => {
    if (!appointmentCreated) {
      toast.error('Không tìm thấy thông tin lịch hẹn để thanh toán');
      return;
    }
    
    try {
      setIsProcessingPayment(true);
      
      // Tính tổng tiền
      const totalAmount = formData.selectedServices.reduce((total, serviceId) => {
        const service = services.find(s => s.id === serviceId);
        return total + (service ? parseInt(service.price) : 0);
      }, 0);
      
      if (paymentMethod === 'vnpay') {
        // Tạo URL thanh toán VNPay
        const redirectUrl = `${window.location.origin}/payment/callback`;
        const vnpayResponse = await createVnPayUrl(appointmentCreated.id, totalAmount, redirectUrl);
        
        if (vnpayResponse.success) {
          // Chuyển hướng đến trang thanh toán VNPay
          window.location.href = vnpayResponse.paymentUrl;
          // Không set loading false vì đang rời khỏi trang
        } else {
          toast.error('Không thể tạo liên kết thanh toán');
          setIsProcessingPayment(false);
        }
      } else if (paymentMethod === 'cash') {
        // Thanh toán tiền mặt tại cửa hàng
        const paymentResponse = await createSpaPayment(appointmentCreated.id, {
          amount: totalAmount,
          payment_method: 'cash',
          status: 'pending',
          notes: paymentNotes || 'Thanh toán tại cửa hàng'
        });
        
        if (paymentResponse.success) {
          toast.success('Đã ghi nhận thanh toán tại cửa hàng');
          // Chuyển đến trang xác nhận
          navigate(`/spa/booking/confirmation/${appointmentCreated.id}`);
        } else {
          toast.error('Không thể xử lý thanh toán');
          setIsProcessingPayment(false);
        }
      }
    } catch (error) {
      console.error('Lỗi khi xử lý thanh toán:', error);
      toast.error('Có lỗi xảy ra khi xử lý thanh toán');
      setIsProcessingPayment(false);
    }
  };

  const handleSkipPayment = () => {
    // Chuyển đến trang xác nhận mà không thanh toán
    navigate(`/spa/booking/confirmation/${appointmentCreated.id}`);
  };

  return (
    <div className="spa-booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <h1>Đặt lịch spa cho thú cưng</h1>
          <div className={`booking-steps progress-${currentStep}`}>
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-name">Thông tin thú cưng</div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-name">Chọn dịch vụ</div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-name">Xác nhận</div>
            </div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-number">4</div>
              <div className="step-name">Thanh toán</div>
            </div>
            
            <div className="step-progress-line" style={{
              width: currentStep === 1 ? '0%' : 
                    currentStep === 2 ? '33%' : 
                    currentStep === 3 ? '67%' : '100%'
            }}></div>
          </div>
        </div>

        <div className="booking-form-container">
          {currentStep === 1 && (
            <div className="booking-step">
              <h2>Thông tin thú cưng</h2>
              <div className="form-group">
                <label>Tên thú cưng</label>
                <input 
                  type="text" 
                  name="petName" 
                  value={formData.petName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Loại thú cưng</label>
                  <select 
                    name="petType" 
                    value={formData.petType} 
                    onChange={handleInputChange}
                  >
                    <option value="dog">Chó</option>
                    <option value="cat">Mèo</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="pet_breed">Giống</label>
                  {isLoadingBreeds ? (
                    <div className="select-loading">
                      <div className="spinner-small"></div>
                      <select disabled>
                        <option>Đang tải giống...</option>
                      </select>
                    </div>
                  ) : (
                    <CreatableSelect
                      id="pet_breed"
                      name="petBreed"
                      value={formData.petBreed ? { value: formData.petBreed, label: formData.petBreed } : null}
                      onChange={(selectedOption) => {
                        handleInputChange({
                          target: {
                            name: 'petBreed',
                            value: selectedOption ? selectedOption.value : ''
                          }
                        });
                      }}
                      options={breeds}
                      isLoading={isLoadingBreeds}
                      placeholder="Chọn hoặc nhập giống thú cưng..."
                      noOptionsMessage={() => "Không tìm thấy giống phù hợp. Bạn có thể nhập giống mới."}
                      formatCreateLabel={(inputValue) => `Sử dụng "${inputValue}"`}
                      isClearable
                      isSearchable
                      isDisabled={!formData.petType}
                      className="breed-select"
                    />
                  )}
                  {formData.petType && !formData.petBreed && (
                    <small className="form-hint">
                      Chọn từ danh sách hoặc nhập giống mới nếu không tìm thấy
                    </small>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Kích thước</label>
                <select 
                  name="petSize" 
                  value={formData.petSize} 
                  onChange={handleInputChange}
                >
                  <option value="small">Nhỏ (dưới 10kg)</option>
                  <option value="medium">Vừa (10-25kg)</option>
                  <option value="large">Lớn (trên 25kg)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Ghi chú đặc biệt</label>
                <textarea 
                  name="petNotes" 
                  value={formData.petNotes} 
                  onChange={handleInputChange}
                  placeholder="Tình trạng sức khỏe, yêu cầu đặc biệt..."
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={nextStep} className="btn-primary">
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="booking-step">
              <h2>Chọn dịch vụ và thời gian</h2>
              
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Đang tải dịch vụ...</p>
                </div>
              ) : (
                <div className="services-selection">
                  <h3>Dịch vụ</h3>
                  <div className="services-grid">
                    {services.filter(service => 
                      service.pet_type === formData.petType || service.pet_type === 'all'
                    ).map(service => (
                      <div 
                        key={service.id} 
                        className={`service-option ${formData.selectedServices.includes(service.id) ? 'selected' : ''}`}
                        onClick={() => handleServiceToggle(service.id)}
                      >
                        <div className="service-option-content">
                          <div className="checkbox">
                            {formData.selectedServices.includes(service.id) && <span>✓</span>}
                          </div>
                          <div className="service-info">
                            <h4>{service.name}</h4>
                            <p>{service.description.substring(0, 100)}...</p>
                            <span className="service-price">
                              {parseInt(service.price).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="appointment-time">
                    <h3>Thời gian</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ngày</label>
                        <div className="custom-date-container">
                          <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            locale="vi"
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày"
                            minDate={new Date()}
                            className="date-input"
                            required
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
                        {!formData.appointmentDate ? (
                          <div className="date-required-message">
                            <i className="fas fa-info-circle"></i> Vui lòng chọn ngày trước
                          </div>
                        ) : isLoadingTimeSlots ? (
                          <div className="loading-time-slots">
                            <div className="spinner-small"></div>
                            <p>Đang tải khung giờ trống...</p>
                          </div>
                        ) : (
                          <div className="time-slots">
                            {Object.keys(availableTimeSlots).length > 0 ? (
                              Object.entries(availableTimeSlots).map(([time, slotInfo]) => {
                                console.log('Rendering time slot:', time, slotInfo);
                                return (
                                  <div 
                                    key={time}
                                    className={`time-slot ${formData.appointmentTime === time ? 'selected' : ''} ${slotInfo.available <= 0 ? 'disabled' : ''}`}
                                    onClick={() => slotInfo.available > 0 && handleTimeSelect(time)}
                                  >
                                    <span className="time">{time}</span>
                                    <span className="slot-count">{slotInfo.available} chỗ trống</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="no-slots-message">Không có khung giờ trống cho ngày này</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Quay lại
                </button>
                <button 
                  type="button" 
                  onClick={nextStep} 
                  className="btn-primary"
                  disabled={formData.selectedServices.length === 0 || !formData.appointmentDate || !formData.appointmentTime}
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="booking-step">
              <h2>Thông tin liên hệ và xác nhận</h2>
              <div className="form-group">
                <label>Họ tên</label>
                <input 
                  type="text" 
                  name="fullName" 
                  value={formData.fullName} 
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại <span className="verified-badge">{phoneVerified ? '(Đã xác thực)' : ''}</span></label>
                  <input 
                    type="tel" 
                    name="phoneNumber" 
                    value={formData.phoneNumber} 
                    onChange={handleInputChange}
                    required
                    disabled={phoneVerified}
                  />
                </div>
                
                <div className="form-group">
                  <label>Email <span className="verified-badge">{emailVerified ? '(Đã xác thực)' : ''}</span></label>
                  <div className="email-input-container">
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      disabled={emailVerified}
                      required
                      placeholder="Nhập địa chỉ email của bạn"
                      style={{ paddingRight: '90px' }}
                    />
                    {!emailVerified && (
                      <button 
                        type="button" 
                        onClick={() => {
                          if (validateEmail(formData.email)) {
                            setShowEmailAuth(true);
                          } else {
                            toast.error('Vui lòng nhập địa chỉ email hợp lệ');
                          }
                        }}
                        disabled={!formData.email}
                        style={{
                          position: 'absolute',
                          right: '5px',
                          top: '40%',
                          transform: 'translateY(-50%)',
                          height: '35px',
                          backgroundColor: formData.email ? '#1976d2' : '#e0e0e0',
                          color: formData.email ? 'white' : '#909090',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '0 15px',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: formData.email ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s ease',
                          boxShadow: formData.email ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                        }}
                        title={formData.email ? 'Nhấn để xác thực email' : 'Nhập email trước khi xác thực'}
                      >
                        Xác thực
                      </button>
                    )}
                  </div>
                  {!emailVerified && (
                    <div className="email-verify-guide" style={{ 
                      fontSize: '13px', 
                      color: '#757575', 
                      marginTop: '8px', 
                      paddingLeft: '2px', 
                      fontStyle: 'italic' 
                    }}>
                      {formData.email 
                        ? 'Nhấn nút "Xác thực" để tiếp tục đặt lịch' 
                        : 'Nhập địa chỉ email để kích hoạt nút xác thực'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="booking-summary">
                <h3>Thông tin đặt lịch</h3>
                <div className="summary-item">
                  <strong>Thú cưng:</strong> {formData.petName} ({formData.petType === 'dog' ? 'Chó' : 'Mèo'})
                  <div className="sub-info">Kích thước: {
                    formData.petSize === 'small' ? 'Nhỏ (dưới 10kg)' : 
                    formData.petSize === 'medium' ? 'Vừa (10-25kg)' : 
                    'Lớn (trên 25kg)'
                  }</div>
                  {formData.petNotes && <div className="sub-info">Ghi chú: {formData.petNotes}</div>}
                </div>
                <div className="summary-item">
                  <strong>Thời gian:</strong> {
                    formData.appointmentDate 
                      ? new Date(formData.appointmentDate).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : ''
                  } - {formData.appointmentTime}
                </div>
                <div className="summary-item">
                  <strong>Dịch vụ đã chọn:</strong>
                  <ul>
                    {formData.selectedServices.map(serviceId => {
                      const service = services.find(s => s.id === serviceId);
                      return service ? (
                        <li key={serviceId}>
                          {service.name} - {parseInt(service.price).toLocaleString('vi-VN')}đ
                        </li>
                      ) : null;
                    })}
                  </ul>
                </div>
                <div className="summary-total">
                  <strong>Tổng tiền:</strong> 
                  {formData.selectedServices.reduce((total, serviceId) => {
                    const service = services.find(s => s.id === serviceId);
                    return total + (service ? parseInt(service.price) : 0);
                  }, 0).toLocaleString('vi-VN')}đ
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Quay lại
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  onClick={handleProceedToBooking}
                >
                  {emailVerified ? 'Hoàn tất đặt lịch' : 'Xác thực và đặt lịch'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="booking-step">
              <h2>Thanh toán</h2>
              
              <div className="payment-confirmation">
                <div className="booking-summary">
                  <h3>Thông tin lịch hẹn</h3>
                  <div className="summary-item">
                    <strong>Mã lịch hẹn:</strong> {appointmentCreated?.id}
                  </div>
                  <div className="summary-item">
                    <strong>Thú cưng:</strong> {formData.petName} ({formData.petType === 'dog' ? 'Chó' : 'Mèo'})
                  </div>
                  <div className="summary-item">
                    <strong>Thời gian:</strong> {
                      formData.appointmentDate 
                        ? new Date(formData.appointmentDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : ''
                    } - {formData.appointmentTime}
                  </div>
                  <div className="summary-item">
                    <strong>Dịch vụ đã chọn:</strong>
                    <ul>
                      {formData.selectedServices.map(serviceId => {
                        const service = services.find(s => s.id === serviceId);
                        return service ? (
                          <li key={serviceId}>
                            {service.name} - {parseInt(service.price).toLocaleString('vi-VN')}đ
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                  <div className="summary-total">
                    <strong>Tổng tiền:</strong> 
                    {formData.selectedServices.reduce((total, serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      return total + (service ? parseInt(service.price) : 0);
                    }, 0).toLocaleString('vi-VN')}đ
                  </div>
                </div>
                
                <div className="payment-section">
                  <h3>Chọn phương thức thanh toán</h3>
                  <div className="payment-methods">
                    <label className={`payment-method ${paymentMethod === 'vnpay' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="vnpay"
                        checked={paymentMethod === 'vnpay'}
                        onChange={() => setPaymentMethod('vnpay')}
                      />
                      <img 
                        src="https://sandbox.vnpayment.vn/paymentv2/images/brands/logo.svg" 
                        alt="VNPAY" 
                        style={{ maxHeight: "30px" }}
                      />
                      <span>Thanh toán qua VNPAY</span>
                    </label>
                    
                    <label className={`payment-method ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <i className="fas fa-money-bill-wave"></i>
                      <span>Thanh toán tại cửa hàng</span>
                    </label>
                  </div>
                  
                  {paymentMethod === 'cash' && (
                    <div className="form-group">
                      <label>Ghi chú</label>
                      <textarea
                        value={paymentNotes}
                        onChange={(e) => setPaymentNotes(e.target.value)}
                        placeholder="Ghi chú thanh toán (nếu có)"
                      ></textarea>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleProcessPayment}
                  disabled={isProcessingPayment}
                  style={{ width: '30%' }}
                >
                  {isProcessingPayment ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Đang xử lý...
                    </>
                  ) : (
                    <>
                      {paymentMethod === 'vnpay' ? 
                        'Thanh toán online' : 
                        'Xác nhận thanh toán tại cửa hàng'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPhoneAuth && (
        <div className="auth-modal">
          <PhoneAuth
            phoneNumber={formData.phoneNumber}
            onVerified={handlePhoneVerified}
            onCancel={() => setShowPhoneAuth(false)}
          />
        </div>
      )}

      {showEmailAuth && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <EmailAuth
              email={formData.email}
              onVerified={handleEmailVerified}
              onCancel={() => setShowEmailAuth(false)}
            />
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default SpaBookingPage;