import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  if (!service) return null;

  return (
    <div className="spa-service-card">
      <div className="service-image">
        <img 
          src={service.image_url || '/images/spa/default-service.jpg'} 
          alt={service.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/images/spa/default-service.jpg';
          }}
        />
      </div>
      <div className="service-info">
        <h3>{service.name}</h3>
        
        <div className="service-tags">
          <span className="service-tag tag-pet-type">
            {service.pet_type === 'dog' ? 'Cho chó' : 
             service.pet_type === 'cat' ? 'Cho mèo' : 'Mọi loại thú'}
          </span>
          <span className="service-tag tag-duration">
            {service.duration} phút
          </span>
        </div>
        
        <p>{service.description}</p>
        
        <div className="service-price-action">
          <span className="service-price">
            {parseInt(service.price).toLocaleString('vi-VN')}đ
          </span>
          <Link to={`/spa/service/${service.id}`} className="view-details-btn">
            Chi tiết
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;