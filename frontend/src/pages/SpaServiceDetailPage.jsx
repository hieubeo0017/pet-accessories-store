import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSpaServiceById } from '../services/api';
import './SpaServiceDetailPage.css';
import RelatedSpaServices from '../components/spa/RelatedSpaServices';

const SpaServiceDetailPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm xử lý đường dẫn ảnh
  const getImageUrl = (serviceData) => {
    if (serviceData.images && serviceData.images.length > 0) {
      const primaryImage = serviceData.images.find(img => img.is_primary);
      if (primaryImage && primaryImage.image_url) {
        return primaryImage.image_url;
      }
      return serviceData.images[0].image_url;
    }
    
    return serviceData.image_url || '/images/spa/default-service.jpg';
  };

  const getFullImageUrl = (url) => {
    if (!url) return '/images/spa/default-service.jpg';
    
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    return `http://localhost:5000/${url.startsWith('/') ? url.substring(1) : url}`;
  };

  useEffect(() => {
    const loadServiceDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Fetching service details for ID: ${id}`);
        const response = await fetchSpaServiceById(id);
        
        console.log('API response:', response);
        
        // Thay đổi cách xử lý response từ API
        if (response && response.data) {
          // Nếu response.data là object có các thuộc tính cần thiết
          setService(response.data);
        } else if (response) {
          // Nếu response trực tiếp là dữ liệu cần thiết (không có .data)
          setService(response);
        } else {
          setError('Không tìm thấy thông tin dịch vụ');
        }
      } catch (err) {
        console.error('Error loading service details:', err);
        setError('Không thể tải thông tin chi tiết dịch vụ');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadServiceDetails();
    }
    
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin dịch vụ...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="error-message">
        {error || 'Không tìm thấy dịch vụ hoặc có lỗi xảy ra'}
        <div className="error-actions">
          <Link to="/spa/services" className="back-button">Quay lại danh sách dịch vụ</Link>
        </div>
      </div>
    );
  }

  const imageSrc = getFullImageUrl(getImageUrl(service));

  return (
    <div className="spa-service-detail-page">
      <div className="service-detail-container">
        <div className="service-image-container">
          <img 
            src={imageSrc} 
            alt={service.name} 
            className="service-detail-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/spa/default-service.jpg';
            }}
          />
        </div>
        
        <div className="service-detail-info">
          <h1>{service.name}</h1>
          
          <div className="service-tags">
            <span className="service-tag tag-pet-type">
              {service.pet_type === 'dog' ? 'Cho chó' : 
               service.pet_type === 'cat' ? 'Cho mèo' : 'Mọi loại thú'}
            </span>
            <span className="service-tag tag-duration">
              {service.duration} phút
            </span>
            <span className="service-tag tag-size">
              {service.pet_size === 'small' ? 'Thú nhỏ' : 
               service.pet_size === 'medium' ? 'Thú vừa' : 
               service.pet_size === 'large' ? 'Thú lớn' : 'Mọi kích cỡ'}
            </span>
            {service.is_featured && (
              <span className="service-tag tag-featured">
                <i className="fas fa-star"></i> Dịch vụ nổi bật
              </span>
            )}
          </div>
          
          <div className="service-price">
            <span className="price-value">{parseInt(service.price).toLocaleString('vi-VN')}đ</span>
          </div>
          
          <div className="service-description">
            <h3>Mô tả dịch vụ</h3>
            <p>{service.description}</p>
          </div>
          
          <Link to={`/spa/booking?service=${service.id}`} className="book-service-btn">
            Đặt lịch ngay
          </Link>
        </div>
      </div>
      <RelatedSpaServices currentServiceId={service.id} petType={service?.pet_type} />
    </div>
  );
};

export default SpaServiceDetailPage;