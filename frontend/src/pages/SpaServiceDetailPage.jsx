import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSpaServiceById } from '../services/api';
import './SpaServiceDetailPage.css';

const SpaServiceDetailPage = () => {
  const { id } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadServiceDetails = async () => {
      try {
        setLoading(true);
        
        // Thay thế API call bằng dữ liệu mô phỏng trong khi phát triển
        // const response = await fetchSpaServiceById(id);
        
        // Dữ liệu mô phỏng
        setTimeout(() => {
          const mockService = {
            id: id,
            name: "Tắm và vệ sinh toàn diện",
            description: "Dịch vụ tắm và vệ sinh chuyên nghiệp với các sản phẩm cao cấp, giúp làm sạch lông, da và loại bỏ mùi hôi. Bao gồm cắt móng, vệ sinh tai và các chăm sóc cơ bản khác.",
            price: "250000",
            duration: "60",
            pet_type: "dog",
            pet_size: "all",
            image_url: "/images/spa/service-bath.jpg"
          };
          
          setService(mockService);
          setLoading(false);
        }, 500); // giả lập delay API
        
      } catch (err) {
        console.error('Error loading service details:', err);
        setError('Không thể tải thông tin chi tiết dịch vụ');
        setLoading(false);
      }
    };

    loadServiceDetails();
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
    return <div className="error-message">{error || 'Không tìm thấy dịch vụ'}</div>;
  }

  return (
    <div className="spa-service-detail-page">
      <div className="service-detail-container">
        <div className="service-image-container">
          <img 
            src={service.image_url || '/images/spa/default-service.jpg'} 
            alt={service.name} 
            className="service-detail-image"
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
    </div>
  );
};

export default SpaServiceDetailPage;