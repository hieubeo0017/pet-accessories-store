import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service, children, highlight }) => {
  // Cải thiện cách lấy đường dẫn ảnh để xử lý nhiều trường hợp
  const getImageUrl = () => {
    // Ưu tiên sử dụng trường image từ API tìm kiếm
    if (service.image) {
      return service.image;
    }
    
    // 1. Kiểm tra xem service có mảng images không
    if (service.images && service.images.length > 0) {
      // Ưu tiên lấy ảnh được đánh dấu là primary
      const primaryImage = service.images.find(img => img.is_primary);
      if (primaryImage && primaryImage.image_url) {
        return primaryImage.image_url;
      }
      // Nếu không có ảnh primary, lấy ảnh đầu tiên
      if (service.images[0].image_url) {
        return service.images[0].image_url;
      }
    }
    
    // 2. Nếu không có mảng images, kiểm tra image_url
    if (service.image_url) {
      return service.image_url;
    }
    
    // 3. Ảnh mặc định nếu không có ảnh nào
    return '/images/spa/default-service.jpg';
  };

  // Thêm tiền tố URL nếu cần
  const getFullImageUrl = (url) => {
    if (!url) return '/images/spa/default-service.jpg';
    
    // Nếu đã là URL đầy đủ, giữ nguyên
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    // Thêm tiền tố URL nếu là đường dẫn tương đối
    return `http://localhost:5000${url.startsWith('/') ? '' : '/'}${url}`;
  };
  
  const imageSrc = getFullImageUrl(getImageUrl());
  
  return (
    <div className={`spa-service-card ${highlight ? 'exact-match' : ''}`}>
      {highlight && <span className="exact-match-tag"></span>}
      <div className="service-image">
        <img 
          src={imageSrc}
          alt={service.name} 
          onError={(e) => {
            e.target.onerror = null; // Tránh lặp vô hạn
            e.target.src = '/images/spa/default-service.jpg';
          }}
        />
      </div>
      <div className="service-info">
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        
        <div className="service-tags">
          <span className="service-tag tag-pet-type">
            {service.pet_type === 'dog' ? 'Cho chó' : 
             service.pet_type === 'cat' ? 'Cho mèo' : 'Mọi loại thú'}
          </span>
          <span className="service-tag tag-duration">
            {service.duration} phút
          </span>
        </div>
        
        <div className="service-price-action">
          <span className="service-price">
            {parseInt(service.price).toLocaleString('vi-VN')}đ
          </span>
          
          {children || (
            <Link to={`/spa/service/${service.id}`} className="view-details-btn">Chi tiết</Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;