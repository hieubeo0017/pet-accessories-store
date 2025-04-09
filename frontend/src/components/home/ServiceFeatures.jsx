import React from 'react';
import { FaTruck, FaShieldAlt, FaHeadset, FaUndo } from 'react-icons/fa';
import './ServiceFeatures.css';

const ServiceFeatures = () => {
    const features = [
        {
            id: 1,
            icon: <FaTruck size={24} />,
            title: 'Giao hàng nhanh',
            description: 'Miễn phí giao hàng cho đơn từ 300.000đ'
        },
        {
            id: 2,
            icon: <FaShieldAlt size={24} />,
            title: 'Sản phẩm chính hãng',
            description: 'Cam kết 100% sản phẩm chính hãng'
        },
        {
            id: 3,
            icon: <FaHeadset size={24} />,
            title: 'Hỗ trợ 24/7',
            description: 'Hỗ trợ khách hàng mọi lúc'
        },
        {
            id: 4,
            icon: <FaUndo size={24} />,
            title: 'Đổi trả dễ dàng',
            description: 'Đổi trả trong vòng 30 ngày'
        }
    ];

    return (
        <section className="service-features">
            <div className="features-container">
                {features.map(feature => (
                    <div key={feature.id} className="feature-item">
                        <div className="feature-icon">
                            {feature.icon}
                        </div>
                        <div className="feature-content">
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ServiceFeatures;