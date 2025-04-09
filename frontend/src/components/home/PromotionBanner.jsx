import React from 'react';
import { Link } from 'react-router-dom';
import './PromotionBanner.css';

const PromotionBanner = () => {
    return (
        <section className="promotion-banner">
            <div className="promotion-content">
                <h2>Giảm giá đặc biệt</h2>
                <h3>Giảm đến 50% cho tất cả phụ kiện</h3>
                <p>Chỉ trong tuần này - Số lượng có hạn!</p>
                <Link to="/promotion" className="promotion-btn">Mua ngay</Link>
            </div>
        </section>
    );
};

export default PromotionBanner;