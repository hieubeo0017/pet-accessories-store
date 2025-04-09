import React from 'react';
import { Link } from 'react-router-dom';
import './FeaturedCats.css';

const FeaturedCats = () => {
    // Dữ liệu giống mèo nổi bật
    const featuredCats = [
        { 
            id: 101, 
            name: 'Mèo Anh lông ngắn', 
            description: 'Tính cách điềm tĩnh, dễ chăm sóc',
            price: 3500000, 
            image: '/images/featured-pets/cats/british-shorthair.jpg'
        },
        { 
            id: 102, 
            name: 'Mèo Ba Tư (Persian)', 
            description: 'Lông dài quyến rũ, tính cách hiền lành',
            price: 4200000, 
            image: '/images/featured-pets/cats/persian.jpg'
        },
        { 
            id: 103, 
            name: 'Mèo Ragdoll', 
            description: 'Mèo to với bộ lông mềm mượt, tính cách thân thiện',
            price: 5000000, 
            image: '/images/featured-pets/cats/ragdoll.jpg'
        },
        { 
            id: 104, 
            name: 'Mèo Maine Coon', 
            description: 'Giống mèo lớn, thông minh và dễ gần',
            price: 5500000, 
            image: '/images/featured-pets/cats/maine-coon.jpg'
        }
    ];

    return (
        <section className="category-showcase">
            <h2 className="section-title">Các Giống Mèo Nổi Bật</h2>
            <div className="category-grid">
                {featuredCats.map(cat => (
                    <div key={cat.id} className="category-card">
                        <div className="category-image">
                            <img src={cat.image} alt={cat.name} />
                            <div className="category-actions">
                                <Link to={`/cats/${cat.id}`} className="view-details">
                                    Xem chi tiết
                                </Link>
                            </div>
                        </div>
                        <div className="category-info">
                            <Link to={`/cats/${cat.id}`} className="category-name">
                                {cat.name}
                            </Link>
                            <p className="category-description">{cat.description}</p>
                            <p className="category-price">{cat.price.toLocaleString('vi-VN')}đ</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="view-more">
                <Link to="/pets?type=cat" className="view-more-btn">Xem tất cả giống mèo</Link>
            </div>
        </section>
    );
};

export default FeaturedCats;