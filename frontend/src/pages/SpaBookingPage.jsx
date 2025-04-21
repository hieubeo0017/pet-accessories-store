import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSpaServices, createSpaAppointment } from '../services/api';
import EmailAuth from '../components/auth/EmailAuth'; //

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

  const mockServices = [
    {
      id: '1',
      name: 'Tắm và vệ sinh',
      description: 'Dịch vụ tắm, vệ sinh tai, cắt móng và làm sạch cho thú cưng của bạn.',
      price: '250000',
      duration: '60',
      pet_type: 'dog',
      pet_size: 'all',
      image_url: '/images/spa/service-bath.jpg'
    },
    {
      id: '2',
      name: 'Cắt tỉa lông',
      description: 'Cắt tỉa lông theo yêu cầu, tạo kiểu lông phù hợp với giống chó của bạn.',
      price: '350000',
      duration: '90',
      pet_type: 'dog',
      pet_size: 'all',
      image_url: '/images/spa/service-grooming.jpg'
    },
    {
      id: '3', 
      name: 'Massage và đắp mặt nạ',
      description: 'Giúp thú cưng thư giãn với liệu pháp massage và đắp mặt nạ dưỡng lông.',
      price: '300000',
      duration: '45',
      pet_type: 'dog',
      pet_size: 'all',
      image_url: '/images/spa/service-massage.jpg'
    },
    {
      id: '4',
      name: 'Tẩy lông rụng',
      description: 'Loại bỏ lông rụng, giảm thiểu tình trạng rụng lông trong nhà.',
      price: '200000',
      duration: '40',
      pet_type: 'cat',
      pet_size: 'all',
      image_url: '/images/spa/service-deshedding.jpg'
    },
    {
      id: '5',
      name: 'Spa cao cấp toàn diện',
      description: 'Gói spa cao cấp bao gồm tắm, cắt tỉa, massage và các dịch vụ làm đẹp khác.',
      price: '500000',
      duration: '120',
      pet_type: 'all',
      pet_size: 'all',
      image_url: '/images/spa/service-premium.jpg'
    }
  ];

  useEffect(() => {
    // Giả lập việc gọi API
    const loadServices = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setServices(mockServices);
          setLoading(false);
        }, 800); // Giả lập thời gian load API
      } catch (error) {
        console.error('Error fetching spa services:', error);
        setError('Không thể tải dịch vụ spa');
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

  const nextStep = () => {
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
      // Kiểm tra email trước khi hiển thị form xác thực
      if (!formData.email || !validateEmail(formData.email)) {
        alert('Vui lòng nhập địa chỉ email hợp lệ để xác thực');
        return;
      }
      setShowEmailAuth(true);
    } else if (!phoneVerified) {
      setShowPhoneAuth(true);
    } else {
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
    setEmailUser(user);
    setEmailVerified(true);
    setShowEmailAuth(false);
  };

  const handleSubmitBooking = async () => {
    alert('Chức năng đặt lịch đang được phát triển');
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
            
            <div className="step-progress-line" style={{
              width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%'
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
                  <label>Giống</label>
                  <input 
                    type="text" 
                    name="petBreed" 
                    value={formData.petBreed} 
                    onChange={handleInputChange}
                  />
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
                        <input 
                          type="date" 
                          name="appointmentDate" 
                          value={formData.appointmentDate} 
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Giờ</label>
                        <select 
                          name="appointmentTime" 
                          value={formData.appointmentTime} 
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Chọn giờ</option>
                          <option value="09:00">09:00</option>
                          <option value="10:00">10:00</option>
                          <option value="11:00">11:00</option>
                          <option value="14:00">14:00</option>
                          <option value="15:00">15:00</option>
                          <option value="16:00">16:00</option>
                        </select>
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
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    disabled={emailVerified}
                    required
                  />
                  {!emailVerified && (
                    <button 
                      type="button" 
                      className="verify-email-btn"
                      onClick={() => {
                        if (validateEmail(formData.email)) {
                          setShowEmailAuth(true);
                        } else {
                          alert('Vui lòng nhập địa chỉ email hợp lệ');
                        }
                      }}
                    >
                      Xác thực email
                    </button>
                  )}
                </div>
              </div>
              
              <div className="booking-summary">
                <h3>Thông tin đặt lịch</h3>
                <div className="summary-item">
                  <strong>Thú cưng:</strong> {formData.petName} ({formData.petType === 'dog' ? 'Chó' : 'Mèo'})
                </div>
                <div className="summary-item">
                  <strong>Thời gian:</strong> {formData.appointmentDate} - {formData.appointmentTime}
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
                    return total + (service ? service.price : 0);
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
    </div>
  );
};

export default SpaBookingPage;