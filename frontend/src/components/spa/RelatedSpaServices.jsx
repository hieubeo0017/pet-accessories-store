import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchRelatedSpaServices } from '../../services/api';
import './RelatedSpaServices.css';

const RelatedSpaServices = ({ currentServiceId, petType }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Thêm hàm xử lý đường dẫn hình ảnh
  const getFullImageUrl = (url) => {
    if (!url) return '/images/spa/default-service.jpg';
    
    // Nếu đã là URL đầy đủ (bắt đầu bằng http), giữ nguyên
    if (url.startsWith('http')) {
      return url;
    }
    
    // Nếu đường dẫn bắt đầu bằng /uploads/, thêm tiền tố server
    if (url.startsWith('/uploads/') || url.includes('uploads/')) {
      return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
    }
    
    // Nếu là đường dẫn tĩnh từ folder public (bắt đầu bằng /images/)
    if (url.startsWith('/images/') || url.includes('images/')) {
      return url;
    }
    
    // Trường hợp còn lại, thêm tiền tố server
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };

  useEffect(() => {
    const getRelatedServices = async () => {
      try {
        setLoading(true);
        const response = await fetchRelatedSpaServices(currentServiceId);
        if (response && response.data) {
          setServices(response.data);
        }
      } catch (error) {
        console.error('Error loading related services:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentServiceId) {
      getRelatedServices();
    }
  }, [currentServiceId]);

  if (loading) {
    return (
      <div className="related-services-loading">
        <div className="spinner-small"></div>
      </div>
    );
  }

  if (!services.length) {
    return null;
  }

  return (
    <div className="related-services-container">
      <h2 className="related-services-title">Các dịch vụ spa khác</h2>
      <div className="related-services-grid">
        {services.map(service => (
          <Link 
            to={`/spa/service/${service.id}`} 
            key={service.id} 
            className="related-service-card"
          >
            <div className="related-service-image">
              {service.image_url ? (
                <img 
                  src={getFullImageUrl(service.image_url)} 
                  alt={service.name} 
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null; // Tránh lặp vô hạn
                    e.target.src = '/images/spa/default-service.jpg';
                  }} 
                />
              ) : (
                <div className="no-image">
                  <i className="fas fa-paw"></i>
                </div>
              )}
              {service.is_featured && (
                <span className="featured-badge">
                  <i className="fas fa-star"></i> Nổi bật
                </span>
              )}
            </div>
            <div className="related-service-info">
              <h3>{service.name}</h3>
              <div className="related-service-details">
                <span className="duration">
                  <i className="far fa-clock"></i> {service.duration} phút
                </span>
                <span className="pet-type">
                  {service.pet_type === 'dog' ? 'Cho chó' : 
                   service.pet_type === 'cat' ? 'Cho mèo' : 
                   'Mọi loại thú'}
                </span>
              </div>
              <div className="related-service-price">
                {parseInt(service.price).toLocaleString('vi-VN')}đ
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedSpaServices;