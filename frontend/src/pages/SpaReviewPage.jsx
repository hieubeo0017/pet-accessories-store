import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAppointmentDetails, submitSpaReview } from '../services/api';
import { toast } from 'react-toastify';
import './SpaReviewPage.css';

const SpaReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
    images: []
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadAppointmentDetails = async () => {
      try {
        setLoading(true);
        
        // Mock data thay vì gọi API thật
        setTimeout(() => {
          const mockAppointment = {
            id: id,
            pet_name: 'Milo',
            pet_type: 'cat',
            appointment_date: '2025-04-20',
            appointment_time: '15:00',
            services: [
              { id: '4', name: 'Tẩy lông rụng', price: '200000' }
            ],
            status: 'completed',
            total_amount: '200000',
            provider: 'Pet Care Spa',
            staff: 'Nguyễn Thị Hương'
          };
          
          setAppointment(mockAppointment);
          setLoading(false);
        }, 800);
        
      } catch (err) {
        console.error('Error loading appointment details:', err);
        setError('Không thể tải thông tin lịch hẹn');
        setLoading(false);
      }
    };

    loadAppointmentDetails();
  }, [id]);

  const handleRatingChange = (newRating) => {
    setReviewData({
      ...reviewData,
      rating: newRating
    });
  };

  const handleCommentChange = (e) => {
    setReviewData({
      ...reviewData,
      comment: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Giả lập upload ảnh
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substring(2),
      url: URL.createObjectURL(file),
      file
    }));
    
    setReviewData({
      ...reviewData,
      images: [...reviewData.images, ...newImages]
    });
  };

  const handleRemoveImage = (id) => {
    setReviewData({
      ...reviewData,
      images: reviewData.images.filter(img => img.id !== id)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewData.comment) {
      toast.warning('Vui lòng nhập nhận xét của bạn');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await submitSpaReview(id, reviewData);
      
      toast.success('Cảm ơn bạn đã đánh giá dịch vụ của chúng tôi!');
      navigate('/spa/appointments');
    } catch (err) {
      toast.error('Không thể gửi đánh giá. Vui lòng thử lại sau.');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Format giá tiền VND
  const formatPrice = (price) => {
    return parseInt(price).toLocaleString('vi-VN') + 'đ';
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
        <p>Đang tải thông tin lịch hẹn...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="error-message">
        {error || 'Không tìm thấy thông tin lịch hẹn'}
      </div>
    );
  }

  return (
    <div className="spa-review-page">
      <div className="page-header">
        <h1>Đánh giá dịch vụ spa</h1>
        <p>Chia sẻ trải nghiệm của bạn để giúp chúng tôi cải thiện dịch vụ</p>
      </div>

      <div className="review-container">
        <div className="appointment-summary">
          <h2>Thông tin lịch hẹn</h2>
          <div className="summary-card">
            <div className="summary-row">
              <div className="summary-label">Thú cưng:</div>
              <div className="summary-value">{appointment.pet_name} ({appointment.pet_type === 'dog' ? 'Chó' : 'Mèo'})</div>
            </div>
            <div className="summary-row">
              <div className="summary-label">Thời gian:</div>
              <div className="summary-value">{formatDate(appointment.appointment_date)} - {appointment.appointment_time}</div>
            </div>
            <div className="summary-row">
              <div className="summary-label">Dịch vụ:</div>
              <div className="summary-value services-list">
                {appointment.services.map(service => (
                  <div key={service.id} className="service-item">
                    <span className="service-name">{service.name}</span>
                    <span className="service-price">{formatPrice(service.price)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="summary-row total-row">
              <div className="summary-label">Tổng cộng:</div>
              <div className="summary-value total-value">{formatPrice(appointment.total_amount)}</div>
            </div>
          </div>
        </div>

        <form className="review-form" onSubmit={handleSubmit}>
          <h2>Đánh giá của bạn</h2>
          
          <div className="rating-section">
            <div className="rating-label">Đánh giá dịch vụ:</div>
            <div className="stars-container">
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star}
                  className={`star ${star <= reviewData.rating ? 'active' : ''}`}
                  onClick={() => handleRatingChange(star)}
                >
                  <i className="fas fa-star"></i>
                </span>
              ))}
            </div>
            <div className="rating-text">
              {reviewData.rating === 1 && 'Rất không hài lòng'}
              {reviewData.rating === 2 && 'Không hài lòng'}
              {reviewData.rating === 3 && 'Bình thường'}
              {reviewData.rating === 4 && 'Hài lòng'}
              {reviewData.rating === 5 && 'Rất hài lòng'}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="comment">Nhận xét của bạn:</label>
            <textarea 
              id="comment" 
              value={reviewData.comment}
              onChange={handleCommentChange}
              placeholder="Chia sẻ trải nghiệm của bạn với dịch vụ này..."
              rows={5}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Hình ảnh (không bắt buộc):</label>
            <div className="upload-container">
              <label htmlFor="images" className="upload-btn">
                <i className="fas fa-cloud-upload-alt"></i>
                Tải ảnh lên
              </label>
              <input 
                type="file" 
                id="images" 
                onChange={handleImageUpload} 
                multiple
                accept="image/*"
                style={{ display: 'none' }}
              />
              <span className="upload-note">Tối đa 5 ảnh, mỗi ảnh không quá 5MB</span>
            </div>
            
            {reviewData.images.length > 0 && (
              <div className="images-preview">
                {reviewData.images.map(img => (
                  <div key={img.id} className="image-preview-container">
                    <img src={img.url} alt="Preview" className="image-preview" />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => handleRemoveImage(img.id)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/spa/appointments')}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpaReviewPage;